package ai

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

type GeminiClient struct {
	apiKey     string
	httpClient *http.Client
	modelName  string
}

type AnalysisRequest struct {
	Company  domain.BusinessIdentity
	Digital  domain.DigitalIntelligence
	Business domain.BusinessIntelligence
}

type AIAnalysisResult struct {
	// Independent 0-100 component scores per Section 02 & Section 10
	DigitalMaturity    int `json:"digital_maturity"`    // 0-100: baseline maturity
	OpportunityGap     int `json:"opportunity_gap"`     // 0-100: size of unmet need
	CommercialFit      int `json:"commercial_fit"`      // 0-100: agency-fit & paying capacity
	BuyingUrgency      int `json:"buying_urgency"`      // 0-100: immediate triggers / buying signals
	Contactability     int `json:"contactability"`     // 0-100: reachability of decision maker
	EvidenceConfidence int `json:"evidence_confidence"` // 0-100: confidence in evidence

	// Identity & Model verification per Section 03 & 08
	OwnershipModel    string `json:"ownership_model"`    // "Independent", "Local Chain", "Franchise", "Corporate Branch"
	OperationalStatus string `json:"operational_status"` // "Open", "Temporarily Closed", "Closed", "Uncertain"

	// Diagnosis Output per Section 11 & 12
	ObservedIssue       string   `json:"observed_issue"`
	Evidence            string   `json:"evidence"`
	BusinessImpact      string   `json:"business_impact"`
	RecommendedService  string   `json:"recommended_service"`
	QuickWin            string   `json:"quick_win"`
	LargerOpportunity   string   `json:"larger_opportunity"`
	SecondaryIssues     []string `json:"secondary_issues"`
	OutreachPitchAngle  string   `json:"outreach_pitch_angle"`
	CommercialRationale string   `json:"commercial_rationale"`

	// Backward compatibility fields
	ICPFitRating     string `json:"icp_fit_rating"`     // "High", "Medium", "Low"
	CommercialBudget string `json:"commercial_budget"` // "High", "Medium", "Low"
	PrimaryNeed      string `json:"primary_need"`      // alias to ObservedIssue
	ProblemEvidence  string `json:"problem_evidence"`  // alias to Evidence
	Confidence       string `json:"confidence"`        // "VERIFIED", "SUPPORTED", "PROBABLE", "WEAK"
	PitchAngle       string `json:"pitch_angle"`       // alias to OutreachPitchAngle
}

func NewGeminiClient(apiKey string) *GeminiClient {
	if apiKey == "" {
		apiKey = GetGeminiAPIKey()
	}

	return &GeminiClient{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
		modelName: "gemini-2.5-flash",
	}
}

func (c *GeminiClient) AnalyzeLead(
	ctx context.Context,
	req AnalysisRequest,
) AIAnalysisResult {
	if c.apiKey == "" {
		return c.fallbackHeuristic(req)
	}

	prompt := fmt.Sprintf(`You are the Principal Lead Evaluation & B2B Sales Architect for DiverXen.
You strictly adhere to "DiverXen Growth System / Version 1.0 - Lead Evaluation Parameters".

ABOUT DIVERXEN:
DiverXen designs and builds bespoke, high-converting web applications, custom e-commerce stores, direct ordering/reservation engines, and modernizes broken digital infrastructure. DiverXen targets commercially viable businesses that need measurable digital improvement.

CORE OPERATING PRINCIPLES:
1. RECORD EVIDENCE FIRST. Score the condition second. Recommend the opportunity third. Missing data is not proof of poor quality.
2. NEVER CONFLATE PRESENCE: A Facebook page, Google Maps short link (g.co/...), Google Business profile site (.business.site), or directory listing is NOT an owned website.
3. DETECT OWNERSHIP & LOCAL BUYING AUTHORITY:
   - If the business is a corporate chain branch or global/national conglomerate (e.g., Zara, Forever 21, McDonald's, Starbucks, KFC), the local store manager has ZERO authority to commission web software. Commercial fit MUST be scored LOW (10-35), and OwnershipModel marked "Corporate Branch".
   - For established independent businesses, local showrooms, boutique retailers, or local multi-outlet brands with direct owner access, Commercial Fit is HIGH (70-95).
4. EVALUATE 5 INDEPENDENT SCORES (0-100 scale, DO NOT compress scores):
   - Opportunity Gap (0-100): How large is the measurable digital deficit and how directly can DiverXen fix it? (Higher = larger unmet need).
   - Commercial Fit (0-100): Alignment with DiverXen's high-ticket bespoke services and local decision-maker authority.
   - Buying Urgency (0-100): Clear trigger or disruption (broken site HTTP 4xx, defunct .business.site, zero owned portal, active hiring, new branch).
   - Contactability (0-100): Reachability of decision-maker via direct phone, verified email, or active messaging.
   - Evidence Confidence (0-100): 90-100 if directly verified with HTTP metrics/URL; 70-89 if multiple consistent sources; 40-69 if single source; 1-39 if inferred only.
   - Digital Maturity (0-100): Current owned presence strength. Kept separate; its weaknesses feed Opportunity Gap.
5. INDUSTRY-SPECIFIC CRITERIA:
   - Jewellery: High transaction values, luxury brand positioning, trust cues, physical showroom footfall vs digital catalog showcase, bespoke consultation booking.
   - Restaurants: High customer traffic, heavy margin loss (20-30%% commission) to food aggregators (Swiggy/Zomato), need for direct ordering, table reservations, dynamic mobile menus.
   - E-commerce / Boutiques: Catalog depth, mobile checkout friction, speed, cart abandonment, shipping clarity, conversion funnels.
6. EVIDENCE-BASED DIAGNOSIS OUTPUT:
   - Observed Issue: Exact description of what failed or is missing.
   - Evidence: Precise URL, metric, status code, latency, or observation.
   - Business Impact: Specific customer loss, margin erosion, or commercial risk.
   - Recommended Service: DiverXen service directly addressing the evidence.
   - Quick Win: Immediate high-impact improvement.
   - Larger Opportunity: Broader strategic engagement.
   - Outreach Pitch Angle: Specific, non-generic, highly personalized message addressed to the owner.

PROSPECT INPUT:
- Name: %s
- Industry: %s
- Sub-Industry: %s
- Address: %s
- Phone: %s
- Email: %s
- Input Website URL: %s
- Classified Presence Type: %s
- Verified Owned Domain: %s
- Social Links: %v
- Google Profile URL: %s
- Website Status: %s (Status Code: %d)
- Has HTTPS / SSL: %t
- Mobile Friendly Viewport: %t (Mobile Readiness: %d/10)
- Server Response Time: %d ms
- Technical Severity: %s
- Measured Technical Evidence: %s
- Detected Problems: %s
- Business Scale Indicators: %s
- Operating Signals: %v
- Growth Signals: %v

Return strictly valid JSON with this exact schema:
{
  "digital_maturity": <int 0-100>,
  "opportunity_gap": <int 0-100>,
  "commercial_fit": <int 0-100>,
  "buying_urgency": <int 0-100>,
  "contactability": <int 0-100>,
  "evidence_confidence": <int 0-100>,
  "ownership_model": "<Independent | Local Chain | Franchise | Corporate Branch>",
  "operational_status": "<Open | Temporarily Closed | Closed | Uncertain>",
  "observed_issue": "<string>",
  "evidence": "<string>",
  "business_impact": "<string>",
  "recommended_service": "<string>",
  "quick_win": "<string>",
  "larger_opportunity": "<string>",
  "secondary_issues": ["<string>"],
  "outreach_pitch_angle": "<string>",
  "commercial_rationale": "<string>",
  "icp_fit_rating": "<High | Medium | Low>",
  "commercial_budget": "<High | Medium | Low>",
  "confidence": "<VERIFIED | SUPPORTED | PROBABLE | WEAK>"
}`,
		req.Company.Name,
		req.Company.Industry,
		req.Company.SubIndustry,
		req.Company.Address,
		req.Company.Phone,
		req.Company.Email,
		req.Company.Website,
		req.Company.PresenceType,
		req.Company.OfficialWebsite,
		req.Company.SocialURLs,
		req.Company.GoogleProfileURL,
		req.Digital.WebsiteStatus,
		req.Digital.StatusCode,
		req.Digital.HasHTTPS,
		req.Digital.IsMobileFriendly,
		req.Digital.MobileReadiness,
		req.Digital.ResponseTimeMs,
		req.Digital.TechnicalSeverity,
		req.Digital.MeasuredEvidence,
		strings.Join(req.Digital.DigitalProblems, "; "),
		req.Business.BusinessScale,
		req.Business.OperatingSignals,
		req.Business.GrowthSignals,
	)

	payload := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]interface{}{
					{"text": prompt},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"temperature":      0.2,
			"responseMimeType": "application/json",
		},
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return c.fallbackHeuristic(req)
	}

	endpoint := fmt.Sprintf(
		"https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
		c.modelName,
		c.apiKey,
	)

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return c.fallbackHeuristic(req)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil || resp.StatusCode != http.StatusOK {
		return c.fallbackHeuristic(req)
	}
	defer resp.Body.Close()

	respData, err := io.ReadAll(resp.Body)
	if err != nil {
		return c.fallbackHeuristic(req)
	}

	var geminiResp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.NewDecoder(bytes.NewReader(respData)).Decode(&geminiResp); err != nil || len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return c.fallbackHeuristic(req)
	}

	rawJSON := geminiResp.Candidates[0].Content.Parts[0].Text
	rawJSON = strings.TrimSpace(rawJSON)
	rawJSON = strings.TrimPrefix(rawJSON, "```json")
	rawJSON = strings.TrimPrefix(rawJSON, "```")
	rawJSON = strings.TrimSuffix(rawJSON, "```")
	rawJSON = strings.TrimSpace(rawJSON)

	var result AIAnalysisResult
	if err := json.Unmarshal([]byte(rawJSON), &result); err != nil {
		return c.fallbackHeuristic(req)
	}

	// Normalize compatibility fields
	if result.PrimaryNeed == "" {
		result.PrimaryNeed = result.ObservedIssue
	}
	if result.ProblemEvidence == "" {
		result.ProblemEvidence = result.Evidence
	}
	if result.PitchAngle == "" {
		result.PitchAngle = result.OutreachPitchAngle
	}
	if result.Confidence == "" {
		if result.EvidenceConfidence >= 90 {
			result.Confidence = "VERIFIED"
		} else if result.EvidenceConfidence >= 70 {
			result.Confidence = "SUPPORTED"
		} else if result.EvidenceConfidence >= 40 {
			result.Confidence = "PROBABLE"
		} else {
			result.Confidence = "WEAK"
		}
	}

	return result
}

func (c *GeminiClient) fallbackHeuristic(req AnalysisRequest) AIAnalysisResult {
	industry := strings.ToLower(req.Company.Industry)
	name := strings.ToLower(req.Company.Name)
	isJewellery := strings.Contains(industry, "jewel")
	isRestaurant := strings.Contains(industry, "restaurant") || strings.Contains(industry, "cafe")
	isRetail := strings.Contains(industry, "boutique") || strings.Contains(industry, "shop") || strings.Contains(industry, "gift") || strings.Contains(industry, "clothes")

	// Detect corporate chains where local stores have no software procurement authority (Section 08)
	isCorporateChain := strings.Contains(name, "zara") ||
		strings.Contains(name, "forever 21") ||
		strings.Contains(name, "h&m") ||
		strings.Contains(name, "mcdonald") ||
		strings.Contains(name, "starbucks") ||
		strings.Contains(name, "kfc") ||
		strings.Contains(name, "domino")

	res := AIAnalysisResult{
		OperationalStatus: "Open",
	}

	if isCorporateChain {
		res.OwnershipModel = "Corporate Branch"
		res.CommercialFit = 20
		res.ICPFitRating = "Low"
		res.CommercialBudget = "High"
		res.CommercialRationale = "Global corporate chain with centralized headquarters and strict IT procurement; local branch has zero authority to approve agency work."
	} else if isJewellery {
		res.OwnershipModel = "Independent"
		res.CommercialFit = 88
		res.ICPFitRating = "High"
		res.CommercialBudget = "High"
		res.CommercialRationale = "High-margin physical establishment in prime commercial sector with substantial budget capacity for bespoke digital showrooms."
	} else if isRestaurant {
		res.OwnershipModel = "Independent"
		res.CommercialFit = 82
		res.ICPFitRating = "High"
		res.CommercialBudget = "Medium"
		res.CommercialRationale = "Active consumer-facing venue reliant on walk-ins and local searches; directly captures higher margins by cutting third-party delivery commissions."
	} else if isRetail {
		res.OwnershipModel = "Independent"
		res.CommercialFit = 75
		res.ICPFitRating = "Medium"
		res.CommercialBudget = "Medium"
		res.CommercialRationale = "Established independent retail business with verifiable local operating footprint seeking direct digital conversion channels."
	} else {
		res.OwnershipModel = "Independent"
		res.CommercialFit = 65
		res.ICPFitRating = "Medium"
		res.CommercialBudget = "Medium"
		res.CommercialRationale = "Local business with verified operating presence."
	}

	// Calculate Contactability (0-100)
	hasPhone := req.Company.Phone != ""
	hasEmail := req.Company.Email != ""
	if hasPhone && hasEmail {
		res.Contactability = 90
	} else if hasPhone {
		res.Contactability = 65
	} else if hasEmail {
		res.Contactability = 60
	} else {
		res.Contactability = 20
	}

	// Calculate Evidence Confidence (0-100) per Section 09
	if req.Digital.MeasuredEvidence != "" && req.Digital.StatusCode > 0 {
		res.EvidenceConfidence = 92
		res.Confidence = "VERIFIED"
	} else if req.Company.Website != "" {
		res.EvidenceConfidence = 78
		res.Confidence = "SUPPORTED"
	} else {
		res.EvidenceConfidence = 62
		res.Confidence = "PROBABLE"
	}

	// Calculate Opportunity Gap (0-100), Urgency (0-100), Digital Maturity (0-100), and Diagnosis
	switch {
	case req.Company.Website == "" || req.Company.PresenceType == domain.PresenceNone:
		res.DigitalMaturity = 10
		res.OpportunityGap = 85
		res.BuyingUrgency = 70
		res.ObservedIssue = "Zero owned digital presence or online booking/catalog channel."
		res.Evidence = "No official website or web portal found in verified business records."
		res.BusinessImpact = "Loses 100% of high-intent search traffic to competing businesses with direct digital booking and ordering."

		if isJewellery {
			res.RecommendedService = "Luxury Digital Showroom & VIP Consultation Portal"
			res.QuickWin = "Deploy rapid Google Business Profile optimization and interactive digital catalog."
			res.LargerOpportunity = "Bespoke high-end e-commerce platform with virtual try-on and insurance-backed checkout."
			res.OutreachPitchAngle = "Showcase exclusive jewellery collections online to bring affluent footfall directly into the showroom."
		} else if isRestaurant {
			res.RecommendedService = "Turnkey Direct Ordering & Table Reservation Web App"
			res.QuickWin = "Mobile-friendly menu and WhatsApp order link within 48 hours."
			res.LargerOpportunity = "Commission-free direct online ordering system to bypass 25%+ Zomato/Swiggy commissions."
			res.OutreachPitchAngle = "Cut third-party delivery commissions and capture direct customer reservations with an owned web portal."
		} else {
			res.RecommendedService = "Custom Responsive E-Commerce & Product Catalog"
			res.QuickWin = "Digital lookbook with instant WhatsApp checkout integration."
			res.LargerOpportunity = "Full-featured omnichannel boutique commerce platform."
			res.OutreachPitchAngle = "Expand local boutique sales beyond walk-ins into 24/7 online ordering."
		}

	case req.Company.PresenceType == domain.PresenceGoogleProfile && strings.Contains(req.Company.Website, ".business.site"):
		res.DigitalMaturity = 25
		res.OpportunityGap = 90
		res.BuyingUrgency = 95
		res.ObservedIssue = "Relying on deprecated Google Business Profile website (.business.site shut down by Google)."
		res.Evidence = fmt.Sprintf("Website URL: %s (Google Business Site shutdown)", req.Company.Website)
		res.BusinessImpact = "Visitors landing from Google Maps encounter broken redirects or dead pages, destroying customer acquisition."
		res.RecommendedService = "Urgent Google Site Migration & High-Converting Web Portal"
		res.QuickWin = "Immediate replacement of dead Google site with responsive landing page."
		res.LargerOpportunity = "Complete brand identity and interactive customer booking portal."
		res.OutreachPitchAngle = "Migrate immediately from Google's discontinued .business.site to an owned web app before search rankings collapse."

	case req.Company.PresenceType == domain.PresenceSocialPage:
		res.DigitalMaturity = 35
		res.OpportunityGap = 80
		res.BuyingUrgency = 65
		res.ObservedIssue = "Relying exclusively on a third-party social media profile rather than an owned domain."
		res.Evidence = fmt.Sprintf("Social profile URL supplied as main website: %s", req.Company.Website)
		res.BusinessImpact = "Algorithm changes and account restrictions put lead flow at risk; zero SEO ownership for search queries."
		res.RecommendedService = "Dedicated Brand Web Application & Social Funnel Integration"
		res.QuickWin = "Custom link-in-bio high-converting landing page with direct inquiry capture."
		res.LargerOpportunity = "Full brand web app integrating social feeds with direct commercial transaction engine."
		res.OutreachPitchAngle = "Convert social followers into repeat direct buyers with an owned, high-converting web storefront."

	case req.Digital.StatusCode >= 400:
		res.DigitalMaturity = 20
		res.OpportunityGap = 92
		res.BuyingUrgency = 95
		res.ObservedIssue = fmt.Sprintf("Website returns HTTP %d error code.", req.Digital.StatusCode)
		res.Evidence = fmt.Sprintf("HTTP %d error returned on URL: %s", req.Digital.StatusCode, req.Company.Website)
		res.BusinessImpact = "Customer journeys are blocked; ad spend and organic traffic are wasted on an error page."
		res.RecommendedService = "High-Performance Modern Web Overhaul & Domain Recovery"
		res.QuickWin = "Emergency server and DNS routing fix to bring core pages back online."
		res.LargerOpportunity = "Full architectural rebuild with Next.js modern frontend and zero-downtime hosting."
		res.OutreachPitchAngle = "Restore broken web presence immediately to recover lost customer conversions and search traffic."

	case !req.Digital.HasHTTPS:
		res.DigitalMaturity = 40
		res.OpportunityGap = 70
		res.BuyingUrgency = 75
		res.ObservedIssue = "Insecure HTTP connection triggering browser 'Not Secure' warnings."
		res.Evidence = "SSL/TLS certificate missing or invalid; served over plain HTTP."
		res.BusinessImpact = "Browsers display security warnings, causing high immediate bounce rate and severe Google ranking penalties."
		res.RecommendedService = "Full-Stack Security & SSL Modernization"
		res.QuickWin = "Automated Let's Encrypt TLS certificate provisioning with HTTPS enforcement."
		res.LargerOpportunity = "Full security audit, CDN caching, and modern web application overhaul."
		res.OutreachPitchAngle = "Upgrade to enterprise HTTPS security to protect customer trust and boost Google SEO ranking."

	case !req.Digital.IsMobileFriendly:
		res.DigitalMaturity = 45
		res.OpportunityGap = 75
		res.BuyingUrgency = 80
		res.ObservedIssue = "Lacks mobile-responsive viewport optimization (70%+ of local searches are on mobile)."
		res.Evidence = "<meta name=\"viewport\"> tag missing in HTML header (Mobile Readiness 2/10)."
		res.BusinessImpact = "Mobile visitors must pinch-to-zoom; poor usability leads to high drop-offs and lost conversions."
		res.RecommendedService = "Mobile-First Responsive Web Application"
		res.QuickWin = "Implement modern fluid viewport and responsive mobile navigation bar."
		res.LargerOpportunity = "Ground-up redesign as a Progressive Web App (PWA) with instant touch interactions."
		res.OutreachPitchAngle = "Modernize web interface for smartphone visitors to dramatically reduce bounce rates and increase mobile conversions."

	default:
		res.DigitalMaturity = 65
		res.OpportunityGap = 55
		res.BuyingUrgency = 50
		res.ObservedIssue = "Website is operational but lacks automated conversion funnels and interactive booking workflows."
		res.Evidence = "Static presence without automated conversion hooks or direct acquisition workflows."
		res.BusinessImpact = "High traffic volume fails to translate into direct captured revenue due to passive user experience."
		res.RecommendedService = "Conversion Rate Optimization & Interactive Web App"
		res.QuickWin = "Add sticky booking/ordering CTAs and interactive customer inquiry flow."
		res.LargerOpportunity = "Full customer portal with automated CRM capture and personalized customer journeys."
		res.OutreachPitchAngle = "Upgrade existing static site into an automated customer acquisition machine."
	}

	res.PrimaryNeed = res.ObservedIssue
	res.ProblemEvidence = res.Evidence
	res.PitchAngle = res.OutreachPitchAngle

	return res
}
