package qualification

import (
	"context"
	"testing"

	"lead-generation/internal/domain"
	"lead-generation/internal/ports"
)

func TestService_ScoreAndQualify(t *testing.T) {
	svc := NewService()

	company := domain.Company{
		ID:       "node/101",
		Name:     "Heritage Dine",
		Industry: "restaurant",
		Location: "Park Street, Kolkata, West Bengal",
		Website:  "http://example.com",
		Phone:    "+91 33 1234 5678",
	}

	contact := &domain.Contact{
		ID:        "cnt_101",
		CompanyID: "node/101",
		Name:      "Anirban Roy",
		Role:      "Owner",
		Email:     "anirban@heritagedine.com",
	}

	audit := ports.AuditResult{
		WebsiteAccessible: true,
		HasHTTPS:          false,
		IsMobileFriendly:  false,
		ObservedProblem:   "Lacks HTTPS SSL encryption; Lacks mobile viewport",
		PitchAngle:        "Mobile redesign and SSL security upgrade",
	}

	lead, result := svc.ScoreAndQualify(company, contact, audit)

	if err := lead.Validate(); err != nil {
		t.Fatalf("expected valid lead, got: %v", err)
	}

	if result.Total < 10 {
		t.Fatalf("expected high score >= 10, got %d", result.Total)
	}

	if result.Priority != domain.PriorityA {
		t.Fatalf("expected Priority A, got %v", result.Priority)
	}

	if !result.IsEligible() {
		t.Fatalf("expected lead to be eligible for contact")
	}
}

func TestService_QualifyCommercialLead(t *testing.T) {
	svc := NewService()

	company := domain.Company{
		ID:       "node/202",
		Name:     "Nemichand Bamalwa & Sons",
		Industry: "jewelry",
		Location: "101, Park Street, Kolkata, 700016",
		Website:  "https://facebook.com/NCBJewellers",
		Phone:    "+91 99035 42222",
	}

	contact := &domain.Contact{
		ID:        "cnt_202",
		CompanyID: "node/202",
		Name:      "Management / Owner",
		Role:      "Owner",
	}

	audit := ports.AuditResult{
		WebsiteAccessible: true,
		StatusCode:        400,
		HasHTTPS:          true,
		IsMobileFriendly:  false,
		ObservedProblem:   "HTTP 400 error returned",
	}

	salesLead := svc.QualifyCommercialLead(context.Background(), company, contact, audit)

	if salesLead.Identity.Name != "Nemichand Bamalwa & Sons" {
		t.Errorf("unexpected name: %s", salesLead.Identity.Name)
	}

	if salesLead.Qualification.ICPFitScore != 2 {
		t.Errorf("expected ICPFitScore 2 for prime jewellery, got %d", salesLead.Qualification.ICPFitScore)
	}

	if salesLead.Qualification.BusinessPotentialScore != 2 {
		t.Errorf("expected BusinessPotentialScore 2 for Park Street location, got %d", salesLead.Qualification.BusinessPotentialScore)
	}

	if salesLead.Sales.PrimaryProblem == "" {
		t.Errorf("expected sales primary problem to be populated")
	}

	if salesLead.Sales.ProblemEvidence == "" {
		t.Errorf("expected problem evidence to be populated")
	}

	if salesLead.Sales.RecommendedService == "" {
		t.Errorf("expected recommended service to be populated")
	}
}
