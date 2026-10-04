package openstreetmap

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"lead-generation/internal/domain"
)

const overpassEndpoint = "https://overpass-api.de/api/interpreter"

var defaultEndpoints = []string{
	overpassEndpoint,
	"https://lz4.overpass-api.de/api/interpreter",
	"https://overpass.kumi.systems/api/interpreter",
}

type Client struct {
	httpClient *http.Client
	endpoint   string
}

func NewClient() *Client {
	return &Client{
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		endpoint: overpassEndpoint,
	}
}

func (c *Client) SearchCompanies(
	ctx context.Context,
	criteria domain.SearchCriteria,
) ([]domain.Company, error) {
	query, err := buildQuery(criteria)
	if err != nil {
		return nil, err
	}

	endpoints := []string{c.endpoint}
	if c.endpoint == overpassEndpoint {
		endpoints = defaultEndpoints
	}

	var lastErr error
	for _, ep := range endpoints {
		companies, err := c.doQuery(ctx, ep, query)
		if err == nil {
			return companies, nil
		}
		lastErr = err
		// If in test or single custom endpoint, don't failover
		if len(endpoints) == 1 {
			return nil, err
		}
	}

	return nil, lastErr
}

func (c *Client) doQuery(
	ctx context.Context,
	endpoint string,
	query string,
) ([]domain.Company, error) {
	requestBody := url.Values{}
	requestBody.Set("data", query)

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		endpoint,
		bytes.NewBufferString(requestBody.Encode()),
	)
	if err != nil {
		return nil, fmt.Errorf("create overpass request: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "*/*")
	req.Header.Set("User-Agent", "DIVERXEN-LeadGeneration/0.1")

	response, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("overpass request failed: %w", err)
	}

	defer response.Body.Close()

	if response.StatusCode < http.StatusOK ||
		response.StatusCode >= http.StatusMultipleChoices {

		responseBody, _ := io.ReadAll(
			io.LimitReader(response.Body, 8*1024),
		)

		return nil, fmt.Errorf(
			"overpass API returned status %d: %s",
			response.StatusCode,
			strings.TrimSpace(string(responseBody)),
		)
	}

	var result overpassResponse

	if err := json.NewDecoder(response.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf(
			"decode overpass response: %w",
			err,
		)
	}

	companies := make(
		[]domain.Company,
		0,
		len(result.Elements),
	)

	for _, element := range result.Elements {
		company := mapElementToCompany(element)

		if err := company.Validate(); err != nil {
			continue
		}

		companies = append(companies, company)
	}

	return companies, nil
}

func buildQuery(
	criteria domain.SearchCriteria,
) (string, error) {
	if len(criteria.Locations) == 0 ||
		strings.TrimSpace(criteria.Locations[0]) == "" {
		return "", fmt.Errorf(
			"at least one location is required",
		)
	}

	location := strings.TrimSpace(
		criteria.Locations[0],
	)

	var filterClauses []string
	seenPairs := make(map[string]bool)
	for _, ind := range criteria.Industries {
		pairs := getIndustryFilters(ind)
		for _, pair := range pairs {
			sig := pair[0] + ":" + pair[1]
			if seenPairs[sig] {
				continue
			}
			seenPairs[sig] = true
			if pair[1] == "restaurant" {
				filterClauses = append(filterClauses,
					`  node["amenity"="restaurant"]["phone"](area.searchArea);`,
					`  node["amenity"="restaurant"]["contact:phone"](area.searchArea);`,
					`  node["amenity"="restaurant"]["website"](area.searchArea);`,
					`  way["amenity"="restaurant"]["phone"](area.searchArea);`,
					`  way["amenity"="restaurant"]["website"](area.searchArea);`,
				)
			} else {
				filterClauses = append(filterClauses, fmt.Sprintf(`  nwr["%s"="%s"](area.searchArea);`, pair[0], pair[1]))
			}
		}
	}

	if len(filterClauses) == 0 {
		tagKey, tagValue := determineSearchTag(criteria)
		filterClauses = append(filterClauses, fmt.Sprintf(`  nwr["%s"="%s"](area.searchArea);`, tagKey, tagValue))
	}

	query := fmt.Sprintf(
		`[out:json][timeout:30];
area["name"="%s"]->.searchArea;
(
%s
);
out center 100;`,
		escapeOverpassValue(location),
		strings.Join(filterClauses, "\n"),
	)

	return query, nil
}

func determineSearchTag(
	criteria domain.SearchCriteria,
) (string, string) {
	if len(criteria.Industries) == 0 {
		return "name", "*"
	}

	industry := strings.ToLower(
		strings.TrimSpace(criteria.Industries[0]),
	)

	switch industry {
	case "restaurant", "restaurants":
		return "amenity", "restaurant"

	case "cafe", "cafes", "coffee shop", "coffee shops":
		return "amenity", "cafe"

	case "bar", "bars":
		return "amenity", "bar"

	case "hotel", "hotels":
		return "tourism", "hotel"

	case "pharmacy", "pharmacies":
		return "amenity", "pharmacy"

	case "jewelry", "jewellery", "jeweller", "jewellers":
		return "shop", "jewelry"

	case "local ecommerce", "ecommerce", "retail", "shop", "shops":
		return "shop", "boutique"

	default:
		return "amenity", industry
	}
}

func getIndustryFilters(industry string) [][2]string {
	ind := strings.ToLower(strings.TrimSpace(industry))
	switch ind {
	case "restaurant", "restaurants":
		return [][2]string{{"amenity", "restaurant"}}
	case "cafe", "cafes", "coffee shop", "coffee shops":
		return [][2]string{{"amenity", "cafe"}}
	case "bar", "bars":
		return [][2]string{{"amenity", "bar"}}
	case "hotel", "hotels":
		return [][2]string{{"tourism", "hotel"}}
	case "pharmacy", "pharmacies":
		return [][2]string{{"amenity", "pharmacy"}}
	case "jewelry", "jewellery", "jeweller", "jewellers":
		return [][2]string{
			{"shop", "jewelry"},
			{"shop", "jewellery"},
		}
	case "local ecommerce", "ecommerce", "retail", "shop", "shops":
		return [][2]string{
			{"shop", "boutique"},
			{"shop", "clothes"},
			{"shop", "gift"},
		}
	default:
		return [][2]string{{"amenity", ind}}
	}
}

func escapeOverpassValue(value string) string {
	return strings.ReplaceAll(
		value,
		`"`,
		`\"`,
	)
}
