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
			Timeout: 20 * time.Second,
		},
		endpoint: textSearchEndpoint,
	}
}

func (c *Client) SearchCompanies(
	ctx context.Context,
	criteria domain.SearchCriteria,
) ([]domain.Company, error) {

	query := buildSearchQuery(criteria)
	var allCompanies []domain.Company
	pageToken := ""

	// Fetch up to 3 pages (Google Places Text Search returns max 3 pages of 20 = 60 results per query)
	for page := 0; page < 3; page++ {
		requestBody := textSearchRequest{
			TextQuery: query,
			PageSize:  20,
			PageToken: pageToken,
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
				"places.nationalPhoneNumber",
				"places.internationalPhoneNumber",
				"places.primaryType",
				"places.types",
				"places.googleMapsUri",
				"places.location",
				"nextPageToken",
			}, ","),
		)

		respData, err := func() ([]byte, error) {
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

			return io.ReadAll(response.Body)
		}()
		if err != nil {
			return nil, err
		}

		var result textSearchResponse
		if err := json.Unmarshal(respData, &result); err != nil {
			return nil, fmt.Errorf("decode places response: %w", err)
		}

		for _, place := range result.Places {
			company := mapPlaceToCompany(place)

			if err := company.Validate(); err != nil {
				continue
			}

			allCompanies = append(allCompanies, company)
		}

		if result.NextPageToken == "" {
			break
		}
		pageToken = result.NextPageToken

		// Small pause between consecutive page fetches
		select {
		case <-ctx.Done():
			return allCompanies, ctx.Err()
		case <-time.After(350 * time.Millisecond):
		}
	}

	return allCompanies, nil
}

func buildSearchQuery(criteria domain.SearchCriteria) string {
	var parts []string

	if len(criteria.Industries) > 0 && criteria.Industries[0] != "" {
		parts = append(parts, criteria.Industries[0])
	}

	if len(criteria.Locations) > 0 && criteria.Locations[0] != "" {
		if len(criteria.Industries) == 0 || !strings.Contains(strings.ToLower(criteria.Industries[0]), strings.ToLower(criteria.Locations[0])) {
			parts = append(parts, "in", criteria.Locations[0])
		}
	}

	if len(parts) == 0 {
		return "businesses"
	}

	return strings.Join(parts, " ")
}
