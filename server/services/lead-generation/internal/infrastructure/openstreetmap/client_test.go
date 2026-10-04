package openstreetmap

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

		if r.URL.Path != "/api/interpreter" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}

		if contentType := r.Header.Get("Content-Type"); contentType != "application/x-www-form-urlencoded" {
			t.Fatalf(
				"unexpected content type: %s",
				contentType,
			)
		}

		if err := r.ParseForm(); err != nil {
			t.Fatalf("failed to parse form: %v", err)
		}

		query := r.FormValue("data")

		if !strings.Contains(query, `area["name"="Kolkata"]`) {
			t.Fatalf("query does not contain Kolkata area: %s", query)
		}

		if !strings.Contains(query, `["amenity"="restaurant"]`) {
			t.Fatalf("query does not contain restaurant filter: %s", query)
		}

		w.Header().Set("Content-Type", "application/json")

		_, _ = w.Write([]byte(`{
			"elements": [
				{
					"type": "node",
					"id": 123456789,
					"lat": 22.5726,
					"lon": 88.3639,
					"tags": {
						"name": "Test Restaurant",
						"amenity": "restaurant",
						"website": "https://example.com",
						"addr:street": "Park Street",
						"addr:city": "Kolkata",
						"addr:state": "West Bengal",
						"addr:postcode": "700016"
					}
				}
			]
		}`))
	}))

	defer server.Close()

	client := NewClient()
	client.endpoint = server.URL + "/api/interpreter"

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

	if company.ID != "node/123456789" {
		t.Errorf("unexpected ID: %s", company.ID)
	}

	if company.Name != "Test Restaurant" {
		t.Errorf("unexpected name: %s", company.Name)
	}

	if company.Website != "https://example.com" {
		t.Errorf("unexpected website: %s", company.Website)
	}

	if company.Industry != "restaurant" {
		t.Errorf("unexpected industry: %s", company.Industry)
	}

	if company.Location != "Park Street, Kolkata, West Bengal, 700016" {
		t.Errorf("unexpected location: %s", company.Location)
	}

	if company.Source != "openstreetmap" {
		t.Errorf("unexpected source: %s", company.Source)
	}

	if company.SourceID != "node/123456789" {
		t.Errorf("unexpected source ID: %s", company.SourceID)
	}
}

func TestClient_SearchCompanies_APIError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(
			w,
			"overpass unavailable",
			http.StatusServiceUnavailable,
		)
	}))

	defer server.Close()

	client := NewClient()
	client.endpoint = server.URL + "/api/interpreter"

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

	if !strings.Contains(err.Error(), "status 503") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestClient_SearchCompanies_InvalidJSON(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		_, _ = w.Write([]byte(`this is invalid json`))
	}))

	defer server.Close()

	client := NewClient()
	client.endpoint = server.URL + "/api/interpreter"

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

	if !strings.Contains(err.Error(), "decode overpass response") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestClient_SearchCompanies_EmptyResults(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		_, _ = w.Write([]byte(`{
			"elements": []
		}`))
	}))

	defer server.Close()

	client := NewClient()
	client.endpoint = server.URL + "/api/interpreter"

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
		t.Fatalf(
			"expected 0 companies, got %d",
			len(companies),
		)
	}
}

func TestDetermineSearchTag(t *testing.T) {
	tests := []struct {
		name      string
		industry  string
		wantKey   string
		wantValue string
	}{
		{
			name:      "restaurant",
			industry:  "restaurants",
			wantKey:   "amenity",
			wantValue: "restaurant",
		},
		{
			name:      "cafe",
			industry:  "cafes",
			wantKey:   "amenity",
			wantValue: "cafe",
		},
		{
			name:      "bar",
			industry:  "bars",
			wantKey:   "amenity",
			wantValue: "bar",
		},
		{
			name:      "hotel",
			industry:  "hotels",
			wantKey:   "tourism",
			wantValue: "hotel",
		},
		{
			name:      "pharmacy",
			industry:  "pharmacies",
			wantKey:   "amenity",
			wantValue: "pharmacy",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			criteria := domain.SearchCriteria{
				Industries: []string{tt.industry},
			}

			gotKey, gotValue := determineSearchTag(criteria)

			if gotKey != tt.wantKey {
				t.Errorf(
					"expected key %q, got %q",
					tt.wantKey,
					gotKey,
				)
			}

			if gotValue != tt.wantValue {
				t.Errorf(
					"expected value %q, got %q",
					tt.wantValue,
					gotValue,
				)
			}
		})
	}
}

func TestBuildQuery_RequiresLocation(t *testing.T) {
	criteria := domain.SearchCriteria{
		Industries: []string{"restaurants"},
	}

	_, err := buildQuery(criteria)

	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !strings.Contains(err.Error(), "location is required") {
		t.Fatalf("unexpected error: %v", err)
	}
}
