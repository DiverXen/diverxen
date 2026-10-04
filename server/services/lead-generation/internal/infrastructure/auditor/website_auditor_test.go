package auditor

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"lead-generation/internal/domain"
)

func TestWebsiteAuditor_NoWebsite(t *testing.T) {
	auditor := NewHTTPWebsiteAuditor()

	company := domain.Company{
		ID:      "test-1",
		Name:    "Cafe Without Site",
		Website: "",
	}

	result := auditor.Audit(context.Background(), company)
	if result.WebsiteAccessible {
		t.Fatalf("expected WebsiteAccessible to be false")
	}
	if result.ObservedProblem == "" {
		t.Fatalf("expected ObservedProblem to be populated")
	}
}

func TestWebsiteAuditor_ActiveWebsiteWithNeed(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		_, _ = w.Write([]byte(`
			<!DOCTYPE html>
			<html>
			<head><title>Old Restaurant</title></head>
			<body>
				<h1>Welcome</h1>
				<p>Email us at contact@oldrestaurant.com or booking@oldrestaurant.com</p>
				<a href="https://instagram.com/oldrestaurant">Instagram</a>
			</body>
			</html>
		`))
	}))
	defer server.Close()

	auditor := NewHTTPWebsiteAuditor()

	company := domain.Company{
		ID:      "test-2",
		Name:    "Old Restaurant",
		Website: server.URL,
	}

	result := auditor.Audit(context.Background(), company)
	if !result.WebsiteAccessible {
		t.Fatalf("expected WebsiteAccessible to be true")
	}
	if result.IsMobileFriendly {
		t.Fatalf("expected IsMobileFriendly to be false because meta viewport is missing")
	}
	if len(result.FoundEmails) < 2 {
		t.Fatalf("expected at least 2 extracted emails, got %d", len(result.FoundEmails))
	}
	if result.SocialLinks["instagram"] == "" {
		t.Fatalf("expected instagram link to be found")
	}
}
