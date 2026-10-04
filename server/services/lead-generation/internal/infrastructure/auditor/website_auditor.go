package auditor

import (
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"lead-generation/internal/domain"
	"lead-generation/internal/ports"
)

var (
	emailRegex = regexp.MustCompile(`[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}`)
	phoneRegex = regexp.MustCompile(`(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}`)
)

type HTTPWebsiteAuditor struct {
	client *http.Client
}

func NewHTTPWebsiteAuditor() *HTTPWebsiteAuditor {
	return &HTTPWebsiteAuditor{
		client: &http.Client{
			Timeout: 8 * time.Second,
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{
					InsecureSkipVerify: true,
				},
				DisableKeepAlives: true,
			},
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				if len(via) >= 5 {
					return http.ErrUseLastResponse
				}
				return nil
			},
		},
	}
}

func (a *HTTPWebsiteAuditor) Audit(
	ctx context.Context,
	company domain.Company,
) ports.AuditResult {
	result := ports.AuditResult{
		SocialLinks:       make(map[string]string),
		PresenceType:      domain.PresenceNone,
		TechnicalSeverity: domain.SeverityNone,
		AuditTimestamp:    time.Now(),
	}

	rawURL := strings.TrimSpace(company.Website)
	if rawURL == "" {
		if company.GoogleProfileURL != "" {
			result.PresenceType = domain.PresenceGoogleProfile
			result.GoogleProfileURL = company.GoogleProfileURL
			result.TechnicalSeverity = domain.SeverityMedium
			result.ObservedProblem = fmt.Sprintf("Business lacks an owned domain; currently relying on Google Business Profile (%s).", company.GoogleProfileURL)
			result.PitchAngle = "Deploy bespoke high-converting digital storefront to capture high-intent search demand and build brand authority."
			result.MeasuredEvidence = fmt.Sprintf("Only Google Profile available: %s; zero owned website domain registered", company.GoogleProfileURL)
			return result
		}
		result.PresenceType = domain.PresenceNone
		result.TechnicalSeverity = domain.SeverityHigh
		result.ObservedProblem = "Zero owned website or online direct booking/ordering portal found."
		result.PitchAngle = "Deploy bespoke high-converting digital storefront to capture high-intent local search demand."
		result.MeasuredEvidence = "No official website or domain registered in public business footprint."
		return result
	}

	if company.GoogleProfileURL != "" && result.GoogleProfileURL == "" {
		result.GoogleProfileURL = company.GoogleProfileURL
	}

	// Classify presence type per Section 03 of framework
	lowerURL := strings.ToLower(rawURL)
	switch {
	case strings.Contains(lowerURL, "facebook.com") || strings.Contains(lowerURL, "fb.com") || strings.Contains(lowerURL, "fb.watch"):
		result.PresenceType = domain.PresenceSocialPage
		result.SocialLinks["facebook"] = rawURL
	case strings.Contains(lowerURL, "instagram.com"):
		result.PresenceType = domain.PresenceSocialPage
		result.SocialLinks["instagram"] = rawURL
	case strings.Contains(lowerURL, "g.co/") || strings.Contains(lowerURL, "maps.google") || strings.Contains(lowerURL, "google.com/maps"):
		result.PresenceType = domain.PresenceGoogleProfile
		result.GoogleProfileURL = rawURL
	case strings.Contains(lowerURL, ".business.site"):
		result.PresenceType = domain.PresenceGoogleProfile
		result.GoogleProfileURL = rawURL
		result.TechnicalSeverity = domain.SeverityCritical
		result.ObservedProblem = "Relying on deprecated Google Business Profile website (.business.site shut down by Google)."
		result.MeasuredEvidence = fmt.Sprintf("Defunct .business.site domain: %s (returns 404 / redirect)", rawURL)
		result.PitchAngle = "Urgent migration from defunct Google site to custom owned high-converting web app."
		return result
	case strings.Contains(lowerURL, "justdial.com") || strings.Contains(lowerURL, "indiamart.com") ||
		strings.Contains(lowerURL, "sulekha.com") || strings.Contains(lowerURL, "zomato.com") ||
		strings.Contains(lowerURL, "swiggy.com") || strings.Contains(lowerURL, "magicpin.in"):
		result.PresenceType = domain.PresenceDirectory
	default:
		result.PresenceType = domain.PresenceOwnedWebsite
		result.OfficialDomain = rawURL
	}

	// If presence is a third-party social or google shortlink, it is NOT an owned website
	if result.PresenceType != domain.PresenceOwnedWebsite {
		result.TechnicalSeverity = domain.SeverityMedium
		result.ObservedProblem = fmt.Sprintf("Business lacks an owned domain; currently relying on third-party %s (%s).", result.PresenceType, rawURL)
		result.MeasuredEvidence = fmt.Sprintf("Presence type classified as '%s' on %s; no independent owned domain detected.", result.PresenceType, rawURL)
		result.PitchAngle = "Establish independent brand ownership with dedicated web portal, escaping platform dependency."
		return result
	}

	targetURL := normalizeURL(rawURL)
	parsed, err := url.Parse(targetURL)
	if err != nil {
		result.ObservedProblem = fmt.Sprintf("Invalid website URL format registered: %s", rawURL)
		result.AuditError = err.Error()
		result.TechnicalSeverity = domain.SeverityHigh
		result.MeasuredEvidence = fmt.Sprintf("Malformed URL syntax: %s", rawURL)
		result.PitchAngle = "Fix online domain routing and deploy modern web presence."
		return result
	}

	result.OfficialDomain = parsed.Host
	result.HasHTTPS = strings.EqualFold(parsed.Scheme, "https")

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, targetURL, nil)
	if err != nil {
		result.ObservedProblem = fmt.Sprintf("Failed to initialize audit request: %v", err)
		result.AuditError = err.Error()
		result.TechnicalSeverity = domain.SeverityMedium
		return result
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")

	startTime := time.Now()
	resp, err := a.client.Do(req)
	result.ResponseTimeMs = time.Since(startTime).Milliseconds()

	if err != nil {
		result.WebsiteAccessible = false
		result.AuditError = err.Error()
		result.TechnicalSeverity = domain.SeverityCritical
		result.ObservedProblem = "Website server is completely unreachable or timed out."
		result.MeasuredEvidence = fmt.Sprintf("HTTP GET %s failed after %dms: %v", targetURL, result.ResponseTimeMs, err)
		result.PitchAngle = "Immediate domain & server recovery to eliminate severe visitor bounce and reputation damage."
		return result
	}
	defer resp.Body.Close()

	result.StatusCode = resp.StatusCode

	if resp.StatusCode >= 400 {
		result.WebsiteAccessible = false
		result.TechnicalSeverity = domain.SeverityCritical
		result.ObservedProblem = fmt.Sprintf("Website returns HTTP %d error.", resp.StatusCode)
		result.MeasuredEvidence = fmt.Sprintf("HTTP status %d received from %s (checked in %dms)", resp.StatusCode, targetURL, result.ResponseTimeMs)
		result.PitchAngle = "Restore broken web presence immediately to recover lost customer conversions and search traffic."
		return result
	}

	result.WebsiteAccessible = true

	// Read limited HTML body (max 256 KB)
	bodyBytes, _ := io.ReadAll(io.LimitReader(resp.Body, 256*1024))
	bodyStr := strings.ToLower(string(bodyBytes))

	// Mobile friendliness check
	result.IsMobileFriendly = strings.Contains(bodyStr, `<meta name="viewport"`) ||
		strings.Contains(bodyStr, `<meta name='viewport'`) ||
		strings.Contains(bodyStr, `name="viewport"`)

	if result.IsMobileFriendly {
		result.MobileReadiness = 8
		if strings.Contains(bodyStr, "responsive") || strings.Contains(bodyStr, "@media") || strings.Contains(bodyStr, "flex") {
			result.MobileReadiness = 9
		}
	} else {
		result.MobileReadiness = 2
	}

	// Extract emails
	rawEmails := emailRegex.FindAllString(string(bodyBytes), -1)
	result.FoundEmails = filterValidEmails(rawEmails)

	// Extract social media links
	extractSocials(string(bodyBytes), result.SocialLinks)

	// Determine problems, severity, and measured evidence
	var problems []string
	if !result.HasHTTPS {
		problems = append(problems, "Lacks HTTPS SSL certificate ('Not Secure' browser warning)")
		result.TechnicalSeverity = domain.SeverityHigh
	}
	if !result.IsMobileFriendly {
		problems = append(problems, "Lacks mobile-responsive viewport meta tag (fails 390px mobile viewport)")
		if result.TechnicalSeverity != domain.SeverityCritical {
			result.TechnicalSeverity = domain.SeverityHigh
		}
	}
	if result.ResponseTimeMs > 2500 {
		problems = append(problems, fmt.Sprintf("High server response latency (%dms)", result.ResponseTimeMs))
		if result.TechnicalSeverity == domain.SeverityNone || result.TechnicalSeverity == domain.SeverityLow {
			result.TechnicalSeverity = domain.SeverityMedium
		}
	}

	evidenceParts := []string{
		fmt.Sprintf("HTTP %d", result.StatusCode),
		fmt.Sprintf("Latency: %dms", result.ResponseTimeMs),
		fmt.Sprintf("HTTPS: %t", result.HasHTTPS),
		fmt.Sprintf("MobileViewport: %t (Readiness: %d/10)", result.IsMobileFriendly, result.MobileReadiness),
	}
	result.MeasuredEvidence = strings.Join(evidenceParts, " | ")

	if len(problems) > 0 {
		result.ObservedProblem = strings.Join(problems, "; ")
		result.PitchAngle = "Full technical modernization: mobile responsiveness, SSL security, and speed optimization."
	} else {
		result.ObservedProblem = "Website infrastructure is operational but lacks automated conversion funnels and interactive booking/order workflows."
		result.TechnicalSeverity = domain.SeverityLow
		result.PitchAngle = "Upgrade active website into an automated customer acquisition engine with bespoke conversion workflows."
	}

	return result
}

func normalizeURL(raw string) string {
	raw = strings.TrimSpace(raw)
	if !strings.HasPrefix(raw, "http://") && !strings.HasPrefix(raw, "https://") {
		return "https://" + raw
	}
	return raw
}

func filterValidEmails(emails []string) []string {
	seen := make(map[string]bool)
	var valid []string

	for _, e := range emails {
		e = strings.ToLower(strings.TrimSpace(e))
		if seen[e] {
			continue
		}

		// Filter common asset false positives
		if strings.HasSuffix(e, ".png") ||
			strings.HasSuffix(e, ".jpg") ||
			strings.HasSuffix(e, ".jpeg") ||
			strings.HasSuffix(e, ".svg") ||
			strings.HasSuffix(e, ".webp") ||
			strings.HasSuffix(e, "example.com") ||
			strings.HasSuffix(e, "sentry.io") ||
			strings.HasSuffix(e, "wixpress.com") {
			continue
		}

		seen[e] = true
		valid = append(valid, e)
	}

	return valid
}

func extractSocials(body string, target map[string]string) {
	lower := strings.ToLower(body)

	if idx := strings.Index(lower, "instagram.com/"); idx != -1 {
		target["instagram"] = extractSnippet(body, idx, 60)
	}
	if idx := strings.Index(lower, "facebook.com/"); idx != -1 {
		target["facebook"] = extractSnippet(body, idx, 60)
	}
	if idx := strings.Index(lower, "linkedin.com/"); idx != -1 {
		target["linkedin"] = extractSnippet(body, idx, 60)
	}
}

func extractSnippet(s string, start int, maxLen int) string {
	end := start + maxLen
	if end > len(s) {
		end = len(s)
	}
	sub := s[start:end]
	for _, term := range []string{`"`, `'`, ` `, `<`, `>`, `\n`} {
		if i := strings.Index(sub, term); i != -1 {
			sub = sub[:i]
		}
	}
	return "https://" + strings.TrimPrefix(sub, "https://")
}
