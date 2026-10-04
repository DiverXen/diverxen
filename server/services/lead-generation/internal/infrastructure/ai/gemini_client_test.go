package ai

import (
	"context"
	"testing"

	"lead-generation/internal/domain"
)

func TestGeminiClient_FallbackHeuristic(t *testing.T) {
	client := NewGeminiClient("dummy-key-to-trigger-fallback")
	// Test fallback directly
	req := AnalysisRequest{
		Company: domain.BusinessIdentity{
			Name:     "Senco Gold & Diamonds",
			Industry: "jewelry",
			Address:  "Raja Subodh Chandra Mullick Road, Kolkata",
			Phone:    "07595089162",
		},
		Digital: domain.DigitalIntelligence{
			WebsiteStatus: "No_Website",
		},
		Business: domain.BusinessIntelligence{
			BusinessScale: "Prime / Enterprise",
		},
	}

	res := client.fallbackHeuristic(req)

	if res.ICPFitRating != "High" {
		t.Errorf("expected High ICP fit, got %s", res.ICPFitRating)
	}

	if res.CommercialBudget != "High" {
		t.Errorf("expected High budget for jewelry, got %s", res.CommercialBudget)
	}

	if res.RecommendedService == "" {
		t.Errorf("expected recommended service to be populated")
	}

	if res.PitchAngle == "" {
		t.Errorf("expected pitch angle to be populated")
	}
}

func TestGeminiClient_LiveAPI(t *testing.T) {
	key := GetGeminiAPIKey()
	if key == "" {
		t.Skip("skipping live Gemini test: no API key found")
	}

	client := NewGeminiClient(key)

	req := AnalysisRequest{
		Company: domain.BusinessIdentity{
			Name:     "Nemichand Bamalwa & Sons",
			Industry: "jewelry",
			Address:  "101, Park Street, Kolkata, 700016",
			Phone:    "+91 99035 42222",
			Website:  "https://facebook.com/NCBJewellers",
		},
		Digital: domain.DigitalIntelligence{
			WebsiteStatus: "HTTP_400",
			StatusCode:    400,
		},
		Business: domain.BusinessIntelligence{
			BusinessScale: "Prime / Enterprise",
		},
	}

	res := client.AnalyzeLead(context.Background(), req)

	if res.RecommendedService == "" {
		t.Errorf("expected recommended service from Gemini, got empty")
	}

	if res.PitchAngle == "" {
		t.Errorf("expected pitch angle from Gemini, got empty")
	}
}
