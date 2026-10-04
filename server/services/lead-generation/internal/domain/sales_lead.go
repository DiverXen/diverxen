package domain

import (
	"time"
)

// OperationalStatus indicates whether the business is currently active.
type OperationalStatus string

const (
	StatusOpen              OperationalStatus = "Open"
	StatusTemporarilyClosed OperationalStatus = "Temporarily Closed"
	StatusClosed            OperationalStatus = "Closed"
	StatusUncertain         OperationalStatus = "Uncertain"
)

// OwnershipModel distinguishes local decision-makers from corporate chains.
type OwnershipModel string

const (
	OwnershipIndependent    OwnershipModel = "Independent"
	OwnershipFranchise      OwnershipModel = "Franchise"
	OwnershipLocalChain      OwnershipModel = "Local Chain"
	OwnershipCorporateBranch OwnershipModel = "Corporate Branch"
	OwnershipUncertain       OwnershipModel = "Uncertain"
)

// PresenceType categorizes the online presence so social and directory links aren't conflated with owned sites.
type PresenceType string

const (
	PresenceOwnedWebsite  PresenceType = "Owned website"
	PresenceSocialPage    PresenceType = "Social page"
	PresenceGoogleProfile PresenceType = "Google profile"
	PresenceDirectory     PresenceType = "Marketplace / Directory"
	PresenceNone          PresenceType = "None"
	PresenceUncertain     PresenceType = "Uncertain"
)

// TechnicalSeverity levels from Section 04 of the framework.
type TechnicalSeverity string

const (
	SeverityCritical TechnicalSeverity = "Critical"
	SeverityHigh     TechnicalSeverity = "High"
	SeverityMedium   TechnicalSeverity = "Medium"
	SeverityLow      TechnicalSeverity = "Low"
	SeverityNone     TechnicalSeverity = "None"
)

// BusinessIdentity captures the core identifiers and normalized presence of a business.
type BusinessIdentity struct {
	ID                string            `json:"id"`
	Name              string            `json:"name"`
	Industry          string            `json:"industry"`
	SubIndustry       string            `json:"sub_industry"`
	Address           string            `json:"address"`
	City              string            `json:"city"`
	Phone             string            `json:"phone"`
	Email             string            `json:"email"`
	Website           string            `json:"website"`          // Raw website or input URL
	OfficialWebsite   string            `json:"official_website"` // Verified owned website URL only
	PresenceType      PresenceType      `json:"presence_type"`
	SocialURLs        map[string]string `json:"social_urls"`
	GoogleProfileURL  string            `json:"google_profile_url"`
	OperationalStatus OperationalStatus `json:"operational_status"`
	OwnershipModel    OwnershipModel    `json:"ownership_model"`
	Source            string            `json:"source"`
	SourceID          string            `json:"source_id"`
}

// DigitalIntelligence stores observed web, infrastructure, and technical metrics.
type DigitalIntelligence struct {
	WebsiteFound      bool              `json:"website_found"`
	WebsiteStatus     string            `json:"website_status"` // "Accessible", "HTTP_404", "Offline", "Not_Evaluated", "No_Website"
	StatusCode        int               `json:"status_code"`
	HasHTTPS          bool              `json:"has_https"`
	IsMobileFriendly  bool              `json:"is_mobile_friendly"`
	MobileReadiness   int               `json:"mobile_readiness"` // 0-10
	ResponseTimeMs    int64             `json:"response_time_ms"`
	TechnicalSeverity TechnicalSeverity `json:"technical_severity"`
	MeasuredEvidence  string            `json:"measured_evidence"`
	SocialProfiles    map[string]string `json:"social_profiles"`
	DigitalProblems   []string          `json:"digital_problems"`
	ExtractedEmails   []string          `json:"extracted_emails"`
	ExtractedPhones   []string          `json:"extracted_phones"`
	AuditError        string            `json:"audit_error,omitempty"`
}

// BusinessIntelligence captures commercial scale, physical footprint, and market presence.
type BusinessIntelligence struct {
	BusinessScale    string   `json:"business_scale"` // "Prime / Enterprise", "Established Commercial", "Boutique / Mid-Scale", "Small"
	HasPhysicalStore bool     `json:"has_physical_store"`
	PriceTier        string   `json:"price_tier"` // "Budget", "Mid-tier", "Premium", "Luxury"
	OperatingSignals []string `json:"operating_signals"`
	MarketingSignals []string `json:"marketing_signals"`
	GrowthSignals    []string `json:"growth_signals"`
}

// CommercialEvaluation holds the 5 independent scores (0-100) + Digital Maturity (0-100) from Sections 02 & 10.
type CommercialEvaluation struct {
	DigitalMaturity    int      `json:"digital_maturity"`    // 0-100: Current baseline strength (does NOT directly inflate score)
	OpportunityGap     int      `json:"opportunity_gap"`     // 0-100: Weight 35%
	CommercialFit      int      `json:"commercial_fit"`      // 0-100: Weight 25%
	BuyingUrgency      int      `json:"buying_urgency"`      // 0-100: Weight 15%
	Contactability     int      `json:"contactability"`     // 0-100: Weight 15%
	EvidenceConfidence int      `json:"evidence_confidence"` // 0-100: Weight 10%
	OpportunityScore   float64  `json:"opportunity_score"`   // 0-100 weighted formula
	Priority           Priority `json:"priority"`            // PriorityA, PriorityB, PriorityC, PriorityD, PriorityReview
	NextAction         string   `json:"next_action"`         // Actionable pipeline step per Section 10
}

// CommercialQualification maintains backward compatibility with older 0-2 score fields.
type CommercialQualification struct {
	ICPFitScore            int                  `json:"icp_fit_score"`
	BusinessPotentialScore int                  `json:"business_potential_score"`
	DigitalGapScore        int                  `json:"digital_gap_score"`
	BuyingSignalScore      int                  `json:"buying_signal_score"`
	ContactabilityScore    int                  `json:"contactability_score"`
	EngagementSignalScore  int                  `json:"engagement_signal_score"`
	TotalScore             int                  `json:"total_score"`
	Priority               Priority             `json:"priority"`
	Evaluation             CommercialEvaluation `json:"evaluation"`
}

// DiagnosisOutput matches Sections 11 & 12 of the framework.
type DiagnosisOutput struct {
	ObservedIssue      string   `json:"observed_issue"`
	Evidence           string   `json:"evidence"`
	BusinessImpact     string   `json:"business_impact"`
	RecommendedService string   `json:"recommended_service"`
	QuickWin           string   `json:"quick_win"`
	LargerOpportunity  string   `json:"larger_opportunity"`
	SecondaryIssues    []string `json:"secondary_issues"`
}

// SalesIntelligence provides evidence-backed, actionable data for outreach.
type SalesIntelligence struct {
	DecisionMaker       string          `json:"decision_maker"`
	DecisionMakerRole   string          `json:"decision_maker_role"`
	PreferredChannel    string          `json:"preferred_channel"`
	ConfidenceScore     int             `json:"confidence_score"` // 0-100
	ConfidenceLabel     string          `json:"confidence_label"` // "VERIFIED", "SUPPORTED", "PROBABLE", "WEAK"
	Diagnosis           DiagnosisOutput `json:"diagnosis"`
	PrimaryProblem      string          `json:"primary_problem"` // alias to Diagnosis.ObservedIssue
	ProblemEvidence     string          `json:"problem_evidence"` // alias to Diagnosis.Evidence
	Confidence          string          `json:"confidence"` // backward-compat string ("High", etc.)
	RecommendedService  string          `json:"recommended_service"`
	PitchAngle          string          `json:"pitch_angle"`
	CommercialRationale string          `json:"commercial_rationale"`
}

// SalesLead represents the complete production-grade sales prospect per Section 11.
type SalesLead struct {
	Identity      BusinessIdentity        `json:"identity"`
	Digital       DigitalIntelligence     `json:"digital"`
	Business      BusinessIntelligence    `json:"business"`
	Qualification CommercialQualification `json:"qualification"`
	Sales         SalesIntelligence       `json:"sales"`
	CreatedAt     time.Time               `json:"created_at"`
}
