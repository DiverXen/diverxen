package qualification

import (
	"context"
	"fmt"
	"strings"
	"time"

	"lead-generation/internal/domain"
	"lead-generation/internal/infrastructure/ai"
	"lead-generation/internal/ports"
)

type Service struct {
	geminiClient *ai.GeminiClient
}

func NewService() *Service {
	return &Service{
		geminiClient: ai.NewGeminiClient(""),
	}
}

func NewServiceWithAI(geminiClient *ai.GeminiClient) *Service {
	return &Service{
		geminiClient: geminiClient,
	}
}

func (s *Service) Evaluate(
	lead domain.Lead,
) domain.QualificationResult {
	qualification := lead.Qualification

	result := domain.QualificationResult{
		Score:            qualification,
		Total:            qualification.Total(),
		Priority:         qualification.Priority(),
		HasVisibleNeed:   lead.ObservedProblem != "",
		HasDecisionMaker: lead.ContactID != "",
		HasCapacity:      qualification.Capacity > 0,
	}

	result.EligibleForContact = result.IsEligible()

	return result
}

// QualifyCommercialLead builds a production-grade, evidence-backed SalesLead adhering to DiverXen Growth System v1.0.
func (s *Service) QualifyCommercialLead(
	ctx context.Context,
	company domain.Company,
	contact *domain.Contact,
	audit ports.AuditResult,
) domain.SalesLead {
	industry := strings.ToLower(strings.TrimSpace(company.Industry))
	name := strings.ToLower(strings.TrimSpace(company.Name))
	isJewellery := strings.Contains(industry, "jewel")
	isRestaurant := strings.Contains(industry, "restaurant") || strings.Contains(industry, "cafe")
	isBoutique := strings.Contains(industry, "boutique") || strings.Contains(industry, "gift") || strings.Contains(industry, "clothes") || strings.Contains(industry, "retail")

	// 1. Business Identity with Presence Separation (Section 03)
	presenceType := audit.PresenceType
	if presenceType == "" {
		presenceType = domain.PresenceNone
	}

	officialWebsite := ""
	if presenceType == domain.PresenceOwnedWebsite {
		officialWebsite = audit.OfficialDomain
		if officialWebsite == "" {
			officialWebsite = company.Website
		}
	}

	identity := domain.BusinessIdentity{
		ID:                company.ID,
		Name:              company.Name,
		Industry:          company.Industry,
		SubIndustry:       company.BusinessModel,
		Address:           company.Location,
		City:              "Kolkata",
		Phone:             company.Phone,
		Email:             company.Email,
		Website:           company.Website,
		OfficialWebsite:   officialWebsite,
		PresenceType:      presenceType,
		SocialURLs:        audit.SocialLinks,
		GoogleProfileURL:  audit.GoogleProfileURL,
		OperationalStatus: domain.StatusOpen,
		OwnershipModel:    domain.OwnershipIndependent,
		Source:            company.Source,
		SourceID:          company.SourceID,
	}

	if identity.GoogleProfileURL == "" && company.GoogleProfileURL != "" {
		identity.GoogleProfileURL = company.GoogleProfileURL
	}

	// 2. Digital Intelligence with Technical Evidence & Severity (Section 04)
	webStatus := "Accessible"
	if presenceType == domain.PresenceNone || company.Website == "" {
		webStatus = "No_Website"
	} else if audit.StatusCode >= 400 {
		webStatus = fmt.Sprintf("HTTP_%d", audit.StatusCode)
	} else if !audit.WebsiteAccessible {
		webStatus = "Offline"
	}

	var digProblems []string
	if webStatus == "No_Website" {
		digProblems = append(digProblems, "Zero owned website or online booking presence")
	} else {
		if audit.StatusCode >= 400 {
			digProblems = append(digProblems, fmt.Sprintf("HTTP %d error returned", audit.StatusCode))
		}
		if !audit.HasHTTPS {
			digProblems = append(digProblems, "Lacks HTTPS SSL certificate")
		}
		if !audit.IsMobileFriendly {
			digProblems = append(digProblems, "Lacks mobile-friendly viewport")
		}
		if audit.ResponseTimeMs > 2500 {
			digProblems = append(digProblems, fmt.Sprintf("High server response latency (%dms)", audit.ResponseTimeMs))
		}
	}

	techSeverity := audit.TechnicalSeverity
	if techSeverity == "" {
		techSeverity = domain.SeverityNone
	}

	digital := domain.DigitalIntelligence{
		WebsiteFound:      presenceType == domain.PresenceOwnedWebsite,
		WebsiteStatus:     webStatus,
		StatusCode:        audit.StatusCode,
		HasHTTPS:          audit.HasHTTPS,
		IsMobileFriendly:  audit.IsMobileFriendly,
		MobileReadiness:   audit.MobileReadiness,
		ResponseTimeMs:    audit.ResponseTimeMs,
		TechnicalSeverity: techSeverity,
		MeasuredEvidence:  audit.MeasuredEvidence,
		SocialProfiles:    audit.SocialLinks,
		DigitalProblems:   digProblems,
		ExtractedEmails:   audit.FoundEmails,
		ExtractedPhones:   audit.FoundPhones,
		AuditError:        audit.AuditError,
	}

	// 3. Business Intelligence & Scale Signals (Section 03 & 08)
	scale := "Established Commercial"
	priceTier := "Mid-tier"
	var opSignals []string
	var mktSignals []string
	var growthSignals []string

	if isJewellery {
		scale = "Prime Commercial / High-Margin"
		priceTier = "Luxury"
		opSignals = append(opSignals, "High-value physical inventory", "Footfall-dependent showroom")
	} else if isRestaurant {
		scale = "Consumer Dining Venue"
		priceTier = "Mid-tier"
		opSignals = append(opSignals, "Customer dining & takeaway operations")
	} else if isBoutique {
		scale = "Boutique Retail / Fashion"
		priceTier = "Premium"
		opSignals = append(opSignals, "Specialty retail products")
	}

	if len(company.Location) > 20 || strings.Contains(company.Location, "Park Street") || strings.Contains(company.Location, "Ballygunge") || strings.Contains(company.Location, "Camac Street") {
		opSignals = append(opSignals, "Prime commercial district address")
	}

	if len(audit.SocialLinks) > 0 {
		mktSignals = append(mktSignals, fmt.Sprintf("%d social profiles detected", len(audit.SocialLinks)))
	}

	if strings.Contains(company.Website, ".business.site") {
		growthSignals = append(growthSignals, "Defunct Google Business Profile site (shut down by Google)")
	}

	business := domain.BusinessIntelligence{
		BusinessScale:    scale,
		HasPhysicalStore: len(company.Location) > 5,
		PriceTier:        priceTier,
		OperatingSignals: opSignals,
		MarketingSignals: mktSignals,
		GrowthSignals:    growthSignals,
	}

	// 4. Sales Intelligence via AI Analysis
	var aiReq ai.AnalysisRequest
	aiReq.Company = identity
	aiReq.Digital = digital
	aiReq.Business = business

	aiRes := s.geminiClient.AnalyzeLead(ctx, aiReq)

	// Update identity with verified ownership model
	if aiRes.OwnershipModel != "" {
		identity.OwnershipModel = domain.OwnershipModel(aiRes.OwnershipModel)
	}
	if aiRes.OperationalStatus != "" {
		identity.OperationalStatus = domain.OperationalStatus(aiRes.OperationalStatus)
	}

	// 5. Compute Lead Opportunity Score (Section 10 Formula)
	gap := aiRes.OpportunityGap
	fit := aiRes.CommercialFit
	urgency := aiRes.BuyingUrgency
	contactability := aiRes.Contactability
	confidence := aiRes.EvidenceConfidence
	maturity := aiRes.DigitalMaturity

	// Check corporate chain branch constraint (Section 08):
	// A branch of a central corporate conglomerate (e.g., Zara, Forever 21) cannot commission local web software.
	isCorporateChain := identity.OwnershipModel == domain.OwnershipCorporateBranch ||
		strings.Contains(name, "zara") ||
		strings.Contains(name, "forever 21") ||
		strings.Contains(name, "h&m") ||
		strings.Contains(name, "mcdonald") ||
		strings.Contains(name, "kfc")

	if isCorporateChain {
		identity.OwnershipModel = domain.OwnershipCorporateBranch
		if fit > 30 {
			fit = 20
		}
	}

	// 0.35 x Opportunity Gap + 0.25 x Commercial Fit + 0.15 x Buying Urgency + 0.15 x Contactability + 0.10 x Evidence Confidence
	oppScore := (0.35 * float64(gap)) +
		(0.25 * float64(fit)) +
		(0.15 * float64(urgency)) +
		(0.15 * float64(contactability)) +
		(0.10 * float64(confidence))

	// Determine Priority and Next Action based on rules & gates (Section 10 & 11)
	var priority domain.Priority
	var nextAction string

	switch {
	// Gate: Corporate chain branch without local authority cannot receive Priority A
	case isCorporateChain:
		priority = domain.PriorityD
		nextAction = "Corporate brand branch with no local digital procurement authority - do not spend active sales time"

	// Gate: Closed or uncertain records cannot receive Priority A (Section 03)
	case identity.OperationalStatus == domain.StatusClosed || identity.OperationalStatus == domain.StatusUncertain:
		priority = domain.PriorityReview
		nextAction = "Resolve operational business status before proceeding"

	// Gate: Contradictory evidence or confidence below 50 routes to Review (Section 10)
	case confidence < 50:
		priority = domain.PriorityReview
		nextAction = "Resolve low confidence or contradictory evidence"

	// Gate: Priority A requires Score 75-100, Confidence >= 60, Contactability >= 40 (Section 10)
	case oppScore >= 75.0 && confidence >= 60 && contactability >= 40:
		priority = domain.PriorityA
		nextAction = "Manual review, deep research and personalised outreach"

	// Priority B: Score 60-74 (Promising but one material gap remains)
	case oppScore >= 60.0:
		priority = domain.PriorityB
		nextAction = "Enrich or validate before outreach"

	// Priority C: Score 45-59 (Moderate opportunity or weak timing)
	case oppScore >= 45.0:
		priority = domain.PriorityC
		nextAction = "Nurture and monitor for a trigger"

	// Priority D: Below 45 (Weak fit, low need or poor reachability)
	default:
		priority = domain.PriorityD
		nextAction = "Do not spend active sales time"
	}

	evaluation := domain.CommercialEvaluation{
		DigitalMaturity:    maturity,
		OpportunityGap:     gap,
		CommercialFit:      fit,
		BuyingUrgency:      urgency,
		Contactability:     contactability,
		EvidenceConfidence: confidence,
		OpportunityScore:   oppScore,
		Priority:           priority,
		NextAction:         nextAction,
	}

	// Backward-compatible scores
	icpFitOld := 1
	if fit >= 70 {
		icpFitOld = 2
	}
	potentialOld := 1
	if fit >= 80 || isJewellery {
		potentialOld = 2
	}
	digitalGapOld := 1
	if gap >= 70 {
		digitalGapOld = 2
	}
	buyingSignalOld := 1
	if urgency >= 70 {
		buyingSignalOld = 2
	}
	contactabilityOld := 1
	if contactability >= 65 {
		contactabilityOld = 2
	}
	engagementOld := 1
	if len(audit.SocialLinks) > 0 || len(audit.FoundEmails) > 0 {
		engagementOld = 2
	}
	totalScoreOld := icpFitOld + potentialOld + digitalGapOld + buyingSignalOld + contactabilityOld + engagementOld

	commQual := domain.CommercialQualification{
		ICPFitScore:            icpFitOld,
		BusinessPotentialScore: potentialOld,
		DigitalGapScore:        digitalGapOld,
		BuyingSignalScore:      buyingSignalOld,
		ContactabilityScore:    contactabilityOld,
		EngagementSignalScore:  engagementOld,
		TotalScore:             totalScoreOld,
		Priority:               priority,
		Evaluation:             evaluation,
	}

	// 6. Assemble Recommended Diagnosis Output (Section 11)
	diagnosis := domain.DiagnosisOutput{
		ObservedIssue:      aiRes.ObservedIssue,
		Evidence:           aiRes.Evidence,
		BusinessImpact:     aiRes.BusinessImpact,
		RecommendedService: aiRes.RecommendedService,
		QuickWin:           aiRes.QuickWin,
		LargerOpportunity:  aiRes.LargerOpportunity,
		SecondaryIssues:    aiRes.SecondaryIssues,
	}

	decisionMaker := "Management / Business Owner"
	role := "Business Owner / Managing Director"
	if contact != nil && contact.Name != "" {
		decisionMaker = contact.Name
		if contact.Role != "" {
			role = contact.Role
		}
	}

	prefChannel := "Phone Call / WhatsApp"
	if identity.Email != "" {
		prefChannel = "Personal Email & Follow-up Phone Call"
	}

	sales := domain.SalesIntelligence{
		DecisionMaker:       decisionMaker,
		DecisionMakerRole:   role,
		PreferredChannel:    prefChannel,
		ConfidenceScore:     confidence,
		ConfidenceLabel:     aiRes.Confidence,
		Diagnosis:           diagnosis,
		PrimaryProblem:      aiRes.ObservedIssue,
		ProblemEvidence:     aiRes.Evidence,
		Confidence:          aiRes.Confidence,
		RecommendedService:  aiRes.RecommendedService,
		PitchAngle:          aiRes.OutreachPitchAngle,
		CommercialRationale: aiRes.CommercialRationale,
	}

	return domain.SalesLead{
		Identity:      identity,
		Digital:       digital,
		Business:      business,
		Qualification: commQual,
		Sales:         sales,
		CreatedAt:     time.Now(),
	}
}

// ScoreAndQualify maintains backward compatibility for existing worker tests.
func (s *Service) ScoreAndQualify(
	company domain.Company,
	contact *domain.Contact,
	audit ports.AuditResult,
) (domain.Lead, domain.QualificationResult) {
	leadID := fmt.Sprintf("lead_%s", strings.ReplaceAll(company.ID, "/", "_"))
	contactID := ""
	if contact != nil {
		contactID = contact.ID
	}
	if contactID == "" {
		contactID = fmt.Sprintf("cnt_%s", strings.ReplaceAll(company.ID, "/", "_"))
	}

	salesLead := s.QualifyCommercialLead(context.Background(), company, contact, audit)

	qual := domain.Qualification{
		BusinessFit: salesLead.Qualification.ICPFitScore,
		VisibleNeed: salesLead.Qualification.DigitalGapScore,
		Trigger:     salesLead.Qualification.BuyingSignalScore,
		Authority:   salesLead.Qualification.ContactabilityScore,
		Capacity:    salesLead.Qualification.BusinessPotentialScore,
		Timing:      salesLead.Qualification.EngagementSignalScore,
	}

	lead := domain.Lead{
		ID:              leadID,
		CompanyID:       company.ID,
		ContactID:       contactID,
		ObservedProblem: salesLead.Sales.PrimaryProblem,
		Qualification:   qual,
		Priority:        salesLead.Qualification.Priority,
		Stage:           domain.StageIdentified,
		CreatedAt:       salesLead.CreatedAt,
		UpdatedAt:       salesLead.CreatedAt,
	}

	result := s.Evaluate(lead)
	return lead, result
}
