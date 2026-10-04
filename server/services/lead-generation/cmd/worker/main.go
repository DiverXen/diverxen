package main

import (
	"context"
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"

	"lead-generation/internal/application/discovery"
	"lead-generation/internal/application/qualification"
	"lead-generation/internal/config"
	"lead-generation/internal/domain"
	"lead-generation/internal/infrastructure/ai"
	"lead-generation/internal/infrastructure/auditor"
	"lead-generation/internal/infrastructure/googleplaces"
)

var emailPattern = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

func main() {
	logger := log.New(
		os.Stdout,
		"[lead-generation] ",
		log.LstdFlags,
	)

	// Step 0: Initialize credentials & configuration
	geminiKey := ai.GetGeminiAPIKey()
	if geminiKey != "" {
		logger.Println("Gemini AI Sales Intelligence: Active (Growth System v1.0 standard loaded)")
	} else {
		logger.Println("Gemini AI Sales Intelligence: Operating in high-precision fallback heuristic mode")
	}

	googlePlacesKey := config.GetGooglePlacesAPIKey()
	if googlePlacesKey == "" {
		logger.Fatalf("Google Places API key not found. Please ensure GOOGLE_MAPS_API_KEY or GOOGLE_PLACES_API_KEY is configured in .env")
	}
	logger.Println("Discovery Engine: Active using Google Places (New) API")

	geminiClient := ai.NewGeminiClient(geminiKey)
	googlePlacesClient := googleplaces.NewClient(googlePlacesKey)
	discoveryService := discovery.NewService(googlePlacesClient)
	websiteAuditor := auditor.NewHTTPWebsiteAuditor()
	qualificationService := qualification.NewServiceWithAI(geminiClient)

	// Step 1: Multi-sector discovery targeting Kolkata, West Bengal with a target max of 200 clients
	targetMaxClients := 200
	location := "Kolkata, West Bengal"

	searchQueries := []string{
		"jewellery showroom in Kolkata, West Bengal",
		"boutique clothing store in Kolkata, West Bengal",
		"designer ethnic wear sarees in Kolkata, West Bengal",
		"fine dining restaurants in Kolkata, West Bengal",
		"cafes and bakeries in Kolkata, West Bengal",
		"electronics and home appliances store in Kolkata, West Bengal",
		"interior design and decor showroom in Kolkata, West Bengal",
		"beauty salon and luxury spa in Kolkata, West Bengal",
		"dental clinic and healthcare in Kolkata, West Bengal",
		"gym and fitness centre in Kolkata, West Bengal",
		"furniture showroom in Kolkata, West Bengal",
		"opticians and eyewear showroom in Kolkata, West Bengal",
		"banquet and catering services in Kolkata, West Bengal",
	}

	logger.Printf("Step 1: Starting Google Places (New) discovery in %s (Target: up to %d qualified clients)...\n",
		location,
		targetMaxClients,
	)

	var rawCompanies []domain.Company
	seenIDs := make(map[string]bool)

	for _, query := range searchQueries {
		if len(rawCompanies) >= targetMaxClients+60 {
			// Collected sufficient candidate buffer to guarantee 200 after gatekeeping
			break
		}

		logger.Printf("  Querying Google Places for: %q ...\n", query)
		criteria := domain.SearchCriteria{
			Industries: []string{query},
			Locations:  []string{location},
		}

		comps, err := discoveryService.DiscoverCompanies(context.Background(), criteria)
		if err != nil {
			logger.Printf("  Warning: discovery for %q encountered issue: %v (continuing)\n", query, err)
			continue
		}

		addedForQuery := 0
		for _, c := range comps {
			if !seenIDs[c.ID] {
				seenIDs[c.ID] = true
				rawCompanies = append(rawCompanies, c)
				addedForQuery++
			}
		}

		logger.Printf("  Retrieved %d places for query (%d unique added, total raw: %d).\n",
			len(comps), addedForQuery, len(rawCompanies),
		)
	}

	logger.Printf("Discovery completed. Found %d raw unique businesses via Google Places (New) API.\n", len(rawCompanies))

	// Step 2: Gatekeeping - Normalize, validate contactability, and deduplicate records
	logger.Println("Step 2: Normalizing names and validating contact channels...")
	var candidates []domain.Company
	seenNames := make(map[string]bool)

	for _, c := range rawCompanies {
		name := strings.TrimSpace(c.Name)
		if name == "" {
			continue
		}

		normName := strings.ToLower(name)
		if seenNames[normName] {
			continue
		}
		seenNames[normName] = true

		cleanedPhone, hasValidPhone := cleanAndValidatePhone(c.Phone)
		hasValidEmail := isValidEmailAddress(c.Email)
		hasWebsite := strings.TrimSpace(c.Website) != ""
		hasGoogleProfile := strings.TrimSpace(c.GoogleProfileURL) != ""

		// Filter out records with zero contact channels and zero web/profile presence
		if !hasValidPhone && !hasValidEmail && !hasWebsite && !hasGoogleProfile {
			continue
		}

		if hasValidPhone {
			c.Phone = cleanedPhone
		}

		candidates = append(candidates, c)
	}

	logger.Printf("Gatekeeping passed: %d candidates retained (dropped %d invalid/empty records).\n",
		len(candidates),
		len(rawCompanies)-len(candidates),
	)

	// Enforce target max of 200 clients
	if len(candidates) > targetMaxClients {
		logger.Printf("Applying client limit: capping candidates to requested maximum of %d clients.\n", targetMaxClients)
		candidates = candidates[:targetMaxClients]
	}

	// Step 3: Concurrent Digital Auditing & AI Sales Qualification
	logger.Printf("Step 3: Auditing presence, measuring technical metrics & applying AI lead evaluation for %d candidates...\n", len(candidates))
	var salesLeads []domain.SalesLead
	var mu sync.Mutex

	concurrency := 12
	jobs := make(chan domain.Company, len(candidates))
	for _, c := range candidates {
		jobs <- c
	}
	close(jobs)

	var wg sync.WaitGroup
	ctx, cancel := context.WithTimeout(context.Background(), 360*time.Second)
	defer cancel()

	processedCount := 0
	for i := 0; i < concurrency; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for comp := range jobs {
				audit := websiteAuditor.Audit(ctx, comp)

				// Enrich company with discovered emails if original was blank
				if comp.Email == "" && len(audit.FoundEmails) > 0 {
					comp.Email = audit.FoundEmails[0]
				}

				cleanedPhone, hasPhone := cleanAndValidatePhone(comp.Phone)
				hasEmail := isValidEmailAddress(comp.Email)

				if hasPhone {
					comp.Phone = cleanedPhone
				}

				// Assign decision maker contact
				contactName := "Management / Business Owner"
				contact := &domain.Contact{
					ID:            fmt.Sprintf("cnt_%s", strings.ReplaceAll(comp.ID, "/", "_")),
					CompanyID:     comp.ID,
					Name:          contactName,
					Role:          "Decision Maker / Business Owner",
					Email:         comp.Email,
					EmailVerified: hasEmail,
				}

				// Run commercial qualification and Gemini sales intelligence
				salesLead := qualificationService.QualifyCommercialLead(ctx, comp, contact, audit)

				mu.Lock()
				salesLeads = append(salesLeads, salesLead)
				processedCount++
				if processedCount%25 == 0 || processedCount == len(candidates) {
					logger.Printf("  Evaluation progress: %d/%d leads processed...\n", processedCount, len(candidates))
				}
				mu.Unlock()
			}
		}()
	}

	wg.Wait()

	// Step 4: Sort leads by Opportunity Score descending
	sort.Slice(salesLeads, func(i, j int) bool {
		return salesLeads[i].Qualification.Evaluation.OpportunityScore > salesLeads[j].Qualification.Evaluation.OpportunityScore
	})

	// Separate leads by Priority and Industry
	var tierA, tierB, tierC, tierD, tierReview []domain.SalesLead
	leadsByIndustry := make(map[string][]domain.SalesLead)

	for _, sl := range salesLeads {
		ind := strings.ToLower(sl.Identity.Industry + " " + sl.Identity.Name)
		category := "other"
		if strings.Contains(ind, "jewel") || strings.Contains(ind, "gold") || strings.Contains(ind, "diamond") {
			category = "jewellery"
		} else if strings.Contains(ind, "restaurant") || strings.Contains(ind, "cafe") || strings.Contains(ind, "bakery") || strings.Contains(ind, "food") || strings.Contains(ind, "dine") {
			category = "restaurants"
		} else if strings.Contains(ind, "clothes") || strings.Contains(ind, "boutique") || strings.Contains(ind, "gift") || strings.Contains(ind, "shop") || strings.Contains(ind, "ecommerce") || strings.Contains(ind, "saree") || strings.Contains(ind, "fashion") || strings.Contains(ind, "apparel") {
			category = "ecommerce"
		} else if strings.Contains(ind, "interior") || strings.Contains(ind, "decor") || strings.Contains(ind, "furniture") {
			category = "interior_decor"
		} else if strings.Contains(ind, "clinic") || strings.Contains(ind, "health") || strings.Contains(ind, "dental") || strings.Contains(ind, "spa") || strings.Contains(ind, "salon") || strings.Contains(ind, "gym") {
			category = "wellness_health"
		}
		leadsByIndustry[category] = append(leadsByIndustry[category], sl)

		switch sl.Qualification.Priority {
		case domain.PriorityA:
			tierA = append(tierA, sl)
		case domain.PriorityB:
			tierB = append(tierB, sl)
		case domain.PriorityC:
			tierC = append(tierC, sl)
		case domain.PriorityReview:
			tierReview = append(tierReview, sl)
		default:
			tierD = append(tierD, sl)
		}
	}

	fmt.Println("\n================================================================================")
	fmt.Println("             DIVERXEN GROWTH SYSTEM V1.0 - LEAD EVALUATION SUMMARY              ")
	fmt.Println("                 (Powered by Google Places New API Discovery)                   ")
	fmt.Println("================================================================================")
	fmt.Printf("Total Raw Discovered  : %d\n", len(rawCompanies))
	fmt.Printf("Normalized Candidates : %d\n", len(candidates))
	fmt.Printf("Total Evaluated Leads : %d\n", len(salesLeads))
	fmt.Printf("🔥 Priority A (High)  : %d (Score 75-100, Reachable, High Fit & Gap)\n", len(tierA))
	fmt.Printf("⚡ Priority B (Warm)  : %d (Score 60-74, Promising with 1 material gap)\n", len(tierB))
	fmt.Printf("📋 Priority C (Fair)  : %d (Score 45-59, Moderate opportunity / weak timing)\n", len(tierC))
	fmt.Printf("🔍 Priority Review    : %d (Contradictory / Confidence < 50 / Corporate branch)\n", len(tierReview))
	fmt.Printf("❌ Priority D (Low)   : %d (Score < 45, Weak fit or corporate branch)\n", len(tierD))
	fmt.Println("================================================================================")

	// Display sector-by-sector breakdown
	if len(leadsByIndustry["jewellery"]) > 0 {
		printIndustrySummary("JEWELLERY SHOWROOMS", leadsByIndustry["jewellery"])
	}
	if len(leadsByIndustry["ecommerce"]) > 0 {
		printIndustrySummary("BOUTIQUES & FASHION RETAIL", leadsByIndustry["ecommerce"])
	}
	if len(leadsByIndustry["restaurants"]) > 0 {
		printIndustrySummary("RESTAURANTS & CAFES", leadsByIndustry["restaurants"])
	}
	if len(leadsByIndustry["interior_decor"]) > 0 {
		printIndustrySummary("INTERIOR DESIGN & FURNITURE", leadsByIndustry["interior_decor"])
	}
	if len(leadsByIndustry["wellness_health"]) > 0 {
		printIndustrySummary("WELLNESS, CLINICS & HEALTHCARE", leadsByIndustry["wellness_health"])
	}

	// Step 5: Export complete lead record adhering to Section 11 of the framework
	// Recreate leads.csv removing all older records
	csvFile, err := os.Create("leads.csv")
	if err != nil {
		logger.Fatalf("failed to create csv file: %v", err)
	}
	defer csvFile.Close()

	writer := csv.NewWriter(csvFile)
	defer writer.Flush()

	header := []string{
		"Priority",
		"OpportunityScore",
		"OpportunityGap",
		"CommercialFit",
		"BuyingUrgency",
		"Contactability",
		"EvidenceConfidence",
		"DigitalMaturity",
		"CompanyName",
		"Industry",
		"OwnershipModel",
		"OperationalStatus",
		"Phone",
		"Email",
		"PresenceType",
		"OfficialWebsite",
		"InputWebsite",
		"GoogleProfileURL",
		"TechnicalSeverity",
		"DecisionMaker",
		"DecisionMakerRole",
		"PreferredChannel",
		"RecommendedService",
		"QuickWin",
		"LargerOpportunity",
		"ObservedIssue",
		"MeasuredEvidence",
		"BusinessImpact",
		"OutreachPitchAngle",
		"CommercialRationale",
		"NextAction",
		"Address",
		"SourceID",
	}
	if err := writer.Write(header); err != nil {
		logger.Fatalf("failed to write csv header: %v", err)
	}

	for _, sl := range salesLeads {
		eval := sl.Qualification.Evaluation
		record := []string{
			string(sl.Qualification.Priority),
			fmt.Sprintf("%.1f", eval.OpportunityScore),
			fmt.Sprintf("%d", eval.OpportunityGap),
			fmt.Sprintf("%d", eval.CommercialFit),
			fmt.Sprintf("%d", eval.BuyingUrgency),
			fmt.Sprintf("%d", eval.Contactability),
			fmt.Sprintf("%d", eval.EvidenceConfidence),
			fmt.Sprintf("%d", eval.DigitalMaturity),
			sl.Identity.Name,
			sl.Identity.Industry,
			string(sl.Identity.OwnershipModel),
			string(sl.Identity.OperationalStatus),
			sl.Identity.Phone,
			sl.Identity.Email,
			string(sl.Identity.PresenceType),
			sl.Identity.OfficialWebsite,
			sl.Identity.Website,
			sl.Identity.GoogleProfileURL,
			string(sl.Digital.TechnicalSeverity),
			sl.Sales.DecisionMaker,
			sl.Sales.DecisionMakerRole,
			sl.Sales.PreferredChannel,
			sl.Sales.RecommendedService,
			sl.Sales.Diagnosis.QuickWin,
			sl.Sales.Diagnosis.LargerOpportunity,
			sl.Sales.Diagnosis.ObservedIssue,
			sl.Digital.MeasuredEvidence,
			sl.Sales.Diagnosis.BusinessImpact,
			sl.Sales.PitchAngle,
			sl.Sales.CommercialRationale,
			eval.NextAction,
			sl.Identity.Address,
			sl.Identity.SourceID,
		}
		if err := writer.Write(record); err != nil {
			logger.Fatalf("failed to write company to csv: %v", err)
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		logger.Fatalf("failed to flush csv writer: %v", err)
	}

	logger.Printf("Successfully exported %d evaluated commercial leads into leads.csv (all older records replaced).\n",
		len(salesLeads),
	)
}

func printIndustrySummary(title string, leads []domain.SalesLead) {
	fmt.Printf("\n--------------------------------------------------------------------------------\n")
	fmt.Printf(">>> SECTOR BREAKDOWN: %s (%d Leads Evaluated)\n", title, len(leads))
	fmt.Printf("--------------------------------------------------------------------------------\n")

	if len(leads) == 0 {
		fmt.Println("No qualified leads found for this sector.")
		return
	}

	var pA, pB, pC, pD, pRev int
	for _, l := range leads {
		switch l.Qualification.Priority {
		case domain.PriorityA:
			pA++
		case domain.PriorityB:
			pB++
		case domain.PriorityC:
			pC++
		case domain.PriorityReview:
			pRev++
		default:
			pD++
		}
	}

	fmt.Printf("Tier Distribution: Priority A: %d | Priority B: %d | Priority C: %d | Priority D: %d | Review: %d\n",
		pA, pB, pC, pD, pRev,
	)

	// Display top 3 leads in this sector
	showCount := 3
	if len(leads) < showCount {
		showCount = len(leads)
	}

	fmt.Printf("\nTop %d Evaluated Prospects in %s:\n", showCount, title)
	for i := 0; i < showCount; i++ {
		sl := leads[i]
		eval := sl.Qualification.Evaluation
		fmt.Printf("\n[%d] %s (Score: %.1f | Priority: %s | Model: %s)\n",
			i+1,
			sl.Identity.Name,
			eval.OpportunityScore,
			sl.Qualification.Priority,
			sl.Identity.OwnershipModel,
		)
		fmt.Printf("    Scores:              Gap: %d/100 | Fit: %d/100 | Urgency: %d/100 | Contact: %d/100 | Conf: %d/100\n",
			eval.OpportunityGap, eval.CommercialFit, eval.BuyingUrgency, eval.Contactability, eval.EvidenceConfidence,
		)
		fmt.Printf("    Contact:             Phone: %s | Email: %s\n", sl.Identity.Phone, sl.Identity.Email)
		fmt.Printf("    Presence Type:       %s (Official: %s)\n", sl.Identity.PresenceType, sl.Identity.OfficialWebsite)
		fmt.Printf("    Google Profile:      %s\n", sl.Identity.GoogleProfileURL)
		fmt.Printf("    Technical Severity:  %s (%s)\n", sl.Digital.TechnicalSeverity, sl.Digital.MeasuredEvidence)
		fmt.Printf("    Observed Issue:      %s\n", sl.Sales.Diagnosis.ObservedIssue)
		fmt.Printf("    Recommended Service: %s\n", sl.Sales.RecommendedService)
		fmt.Printf("    Quick Win:           %s\n", sl.Sales.Diagnosis.QuickWin)
		fmt.Printf("    Outreach Pitch:      %s\n", sl.Sales.PitchAngle)
		fmt.Printf("    Next Action:         %s\n", eval.NextAction)
	}
}

func cleanAndValidatePhone(raw string) (string, bool) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return "", false
	}

	// Fix common Kolkata OSM typo (+31 instead of +91)
	if strings.HasPrefix(raw, "+31 33") || strings.HasPrefix(raw, "+31-33") {
		raw = "+91 33" + raw[6:]
	}

	// If multiple numbers separated by delimiters, validate and clean each
	parts := strings.FieldsFunc(raw, func(r rune) bool {
		return r == ';' || r == '/' || r == ','
	})

	var validParts []string
	for _, p := range parts {
		p = strings.TrimSpace(p)
		var digits []rune
		for _, r := range p {
			if r >= '0' && r <= '9' {
				digits = append(digits, r)
			}
		}
		// Valid numbers must have between 8 and 15 numeric digits
		if len(digits) >= 8 && len(digits) <= 15 {
			validParts = append(validParts, p)
		}
	}

	if len(validParts) == 0 {
		return "", false
	}

	return strings.Join(validParts, " / "), true
}

func isValidEmailAddress(email string) bool {
	email = strings.TrimSpace(email)
	if email == "" {
		return false
	}
	return emailPattern.MatchString(email)
}
