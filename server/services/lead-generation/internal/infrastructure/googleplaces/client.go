package googleplaces

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"lead-generation/internal/domain"
)

const textSearchEndpoint = "https://places.googleapis.com/v1/places:searchText"

type Client struct {
	apiKey     string
	httpClient *http.Client
	endpoint   string
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
		endpoint: textSearchEndpoint,
	}
}

func (c *Client) SearchCompanies(
	ctx context.Context,
	criteria domain.SearchCriteria,
) ([]domain.Company, error) {

	query := buildSearchQuery(criteria)

	requestBody := textSearchRequest{
		TextQuery: query,
		PageSize:  20,
	}

	body, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("marshal places request: %w", err)
	}

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		c.endpoint,
		bytes.NewReader(body),
	)
	if err != nil {
		return nil, fmt.Errorf("create places request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Goog-Api-Key", c.apiKey)

	req.Header.Set(
		"X-Goog-FieldMask",
		strings.Join([]string{
			"places.id",
			"places.displayName",
			"places.formattedAddress",
			"places.websiteUri",
			"places.primaryType",
			"places.types",
			"places.googleMapsUri",
			"places.location",
		}, ","),
	)

	response, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("places request failed: %w", err)
	}

	defer response.Body.Close()

	if response.StatusCode < http.StatusOK ||
		response.StatusCode >= http.StatusMultipleChoices {

		responseBody, _ := io.ReadAll(io.LimitReader(response.Body, 8*1024))

		return nil, fmt.Errorf(
			"places API returned status %d: %s",
			response.StatusCode,
			strings.TrimSpace(string(responseBody)),
		)
	}

	var result textSearchResponse

	if err := json.NewDecoder(response.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode places response: %w", err)
	}

	companies := make([]domain.Company, 0, len(result.Places))

	for _, place := range result.Places {
		company := mapPlaceToCompany(place)

		if err := company.Validate(); err != nil {
			continue
		}

		companies = append(companies, company)
	}

	return companies, nil
}

func buildSearchQuery(criteria domain.SearchCriteria) string {
	var parts []string

	if len(criteria.Industries) > 0 &&
		criteria.Industries[0] != "" {

		parts = append(parts, criteria.Industries[0])
	}

	if len(criteria.Locations) > 0 &&
		criteria.Locations[0] != "" {

		parts = append(parts, "in", criteria.Locations[0])
	}

	if len(parts) == 0 {
		return "businesses"
	}

	return strings.Join(parts, " ")
}
