package googleplaces

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"lead-generation/internal/domain"
)

func TestClient_SearchCompanies_Success(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Fatalf("expected POST, got %s", r.Method)
		}

		if r.URL.Path != "/v1/places:searchText" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}

		if got := r.Header.Get("X-Goog-Api-Key"); got != "test-api-key" {
			t.Fatalf("unexpected API key: %s", got)
		}

		fieldMask := r.Header.Get("X-Goog-FieldMask")

		if fieldMask == "" {
			t.Fatal("expected field mask header")
		}

		if !strings.Contains(fieldMask, "places.id") {
			t.Fatal("field mask should contain places.id")
		}

		if !strings.Contains(fieldMask, "places.displayName") {
			t.Fatal("field mask should contain places.displayName")
		}

		w.Header().Set("Content-Type", "application/json")

		_, _ = w.Write([]byte(`{
			"places": [
				{
					"id": "ChIJ-test-123",
					"displayName": {
						"text": "Test Restaurant",
						"languageCode": "en"
					},
					"formattedAddress": "Kolkata, West Bengal, India",
					"websiteUri": "https://example.com",
					"primaryType": "restaurant",
					"types": [
						"restaurant",
						"food"
					],
					"googleMapsUri": "https://maps.google.com/?cid=123",
					"location": {
						"latitude": 22.5726,
						"longitude": 88.3639
					}
				}
			]
		}`))
	}))

	defer server.Close()

	client := NewClient("test-api-key")
	client.endpoint = server.URL + "/v1/places:searchText"

	criteria := domain.SearchCriteria{
		Industries: []string{"restaurants"},
		Locations:  []string{"Kolkata"},
	}

	companies, err := client.SearchCompanies(
		context.Background(),
		criteria,
	)

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(companies) != 1 {
		t.Fatalf("expected 1 company, got %d", len(companies))
	}

	company := companies[0]

	if company.ID != "ChIJ-test-123" {
		t.Errorf("unexpected company ID: %s", company.ID)
	}

	if company.Name != "Test Restaurant" {
		t.Errorf("unexpected company name: %s", company.Name)
	}

	if company.Website != "https://example.com" {
		t.Errorf("unexpected website: %s", company.Website)
	}

	if company.Industry != "restaurant" {
		t.Errorf("unexpected industry: %s", company.Industry)
	}

	if company.Location != "Kolkata, West Bengal, India" {
		t.Errorf("unexpected location: %s", company.Location)
	}

	if company.Source != "google_places" {
		t.Errorf("unexpected source: %s", company.Source)
	}

	if company.SourceID != "ChIJ-test-123" {
		t.Errorf("unexpected source ID: %s", company.SourceID)
	}
}

func TestClient_SearchCompanies_APIError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(
			w,
			`{"error":{"message":"invalid API key"}}`,
			http.StatusUnauthorized,
		)
	}))

	defer server.Close()

	client := NewClient("bad-api-key")
	client.endpoint = server.URL + "/v1/places:searchText"

	criteria := domain.SearchCriteria{
		Industries: []string{"restaurants"},
		Locations:  []string{"Kolkata"},
	}

	_, err := client.SearchCompanies(
		context.Background(),
		criteria,
	)

	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !strings.Contains(err.Error(), "status 401") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestClient_SearchCompanies_InvalidJSON(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		_, _ = w.Write([]byte(`this is not valid json`))
	}))

	defer server.Close()

	client := NewClient("test-api-key")
	client.endpoint = server.URL + "/v1/places:searchText"

	criteria := domain.SearchCriteria{
		Industries: []string{"restaurants"},
		Locations:  []string{"Kolkata"},
	}

	_, err := client.SearchCompanies(
		context.Background(),
		criteria,
	)

	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !strings.Contains(err.Error(), "decode places response") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestClient_SearchCompanies_EmptyResults(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		_, _ = w.Write([]byte(`{
			"places": []
		}`))
	}))

	defer server.Close()

	client := NewClient("test-api-key")
	client.endpoint = server.URL + "/v1/places:searchText"

	criteria := domain.SearchCriteria{
		Industries: []string{"restaurants"},
		Locations:  []string{"Kolkata"},
	}

	companies, err := client.SearchCompanies(
		context.Background(),
		criteria,
	)

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(companies) != 0 {
		t.Fatalf("expected 0 companies, got %d", len(companies))
	}
}
