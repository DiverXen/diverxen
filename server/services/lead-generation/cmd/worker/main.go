package main

import (
	"context"
	"encoding/csv"
	"fmt"
	"log"
	"math"
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
	googlePlacesKey := config.GetGooglePlacesAPIKey()
	if googlePlacesKey == "" {
		logger.Fatalf("Google Places API key not found in .env or environment variables.")
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
		"gold diamond jewellery shop in Kolkata, West Bengal",
		"designer boutique clothing store in Kolkata, West Bengal",
		"bridal sarees and lehengas in Kolkata, West Bengal",
		"ethnic wear boutique in Kolkata, West Bengal",
		"independent cafe in Kolkata, West Bengal",
		"bistro and bakery in Kolkata, West Bengal",
		"local restaurant in Kolkata, West Bengal",
		"rooftop cafe in Kolkata, West Bengal",
		"interior design studio in Kolkata, West Bengal",
		"furniture showroom in Kolkata, West Bengal",
		"home decor showroom in Kolkata, West Bengal",
		"beauty salon and spa in Kolkata, West Bengal",
		"dental clinic in Kolkata, West Bengal",
		"diagnostic center and healthcare clinic in Kolkata, West Bengal",
		"gym and fitness studio in Kolkata, West Bengal",
		"catering and banquet services in Kolkata, West Bengal",
	}

	logger.Printf("Step 1: Discovering genuine local commercial businesses in %s (Target: %d clients)...\n",
		location,
		targetMaxClients,
	)

	var rawCompanies []domain.Company
	seenIDs := make(map[string]bool)

	for _, query := range searchQueries {
		if len(rawCompanies) >= targetMaxClients+80 {
			break
		}

		criteria := domain.SearchCriteria{
			Industries: []string{query},
			Locations:  []string{location},
		}

		comps, err := discoveryService.DiscoverCompanies(context.Background(), criteria)
		if err != nil {
			logger.Printf("  Warning: query %q encountered issue: %v\n", query, err)
			continue
		}

		addedCount := 0
		for _, c := range comps {
			if seenIDs[c.ID] {
				continue
			}

			// Filter out corporate conglomerates, luxury hotel branches, and mega-chains
			if isCorporateOrChain(c.Name, c.Website) {
				continue
			}

			seenIDs[c.ID] = true
			rawCompanies = append(rawCompanies, c)
			addedCount++
		}

		logger.Printf("  Query %q -> added %d independent businesses (total raw: %d).\n",
			query, addedCount, len(rawCompanies),
		)
	}

	logger.Printf("Discovery completed. Found %d raw local businesses via Google Places API.\n", len(rawCompanies))

	// Step 2: Gatekeeping - Normalize, validate contactability, and deduplicate records
	logger.Println("Step 2: Normalizing names, validating phone numbers, and filtering duplicates...")
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

		// Require at least one reliable communication channel or web/profile presence
		if !hasValidPhone && !hasValidEmail && !hasWebsite && !hasGoogleProfile {
			continue
		}

		if hasValidPhone {
			c.Phone = cleanedPhone
		}

		candidates = append(candidates, c)
	}

	logger.Printf("Gatekeeping passed: %d high-quality local prospects retained.\n", len(candidates))

	// Enforce target max of 200 clients
	if len(candidates) > targetMaxClients {
		logger.Printf("Capping candidate pool to top %d clients as requested.\n", targetMaxClients)
		candidates = candidates[:targetMaxClients]
	}

	// Step 3: Concurrent Digital Auditing & AI Sales Qualification
	logger.Printf("Step 3: Auditing presence, measuring technical health & evaluating opportunities for %d clients...\n", len(candidates))
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

				if comp.Email == "" && len(audit.FoundEmails) > 0 {
					comp.Email = audit.FoundEmails[0]
				}

				cleanedPhone, hasPhone := cleanAndValidatePhone(comp.Phone)
				hasEmail := isValidEmailAddress(comp.Email)

				if hasPhone {
					comp.Phone = cleanedPhone
				}

				contact := &domain.Contact{
					ID:            fmt.Sprintf("cnt_%s", strings.ReplaceAll(comp.ID, "/", "_")),
					CompanyID:     comp.ID,
					Name:          "Management / Business Owner",
					Role:          "Decision Maker / Business Owner",
					Email:         comp.Email,
					EmailVerified: hasEmail,
				}

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

	// Separate leads by Priority
	var tierHigh, tierWarm, tierModerate int
	for _, sl := range salesLeads {
		switch sl.Qualification.Priority {
		case domain.PriorityA:
			tierHigh++
		case domain.PriorityB:
			tierWarm++
		default:
			tierModerate++
		}
	}

	fmt.Println("\n================================================================================")
	fmt.Println("             DIVERXEN GROWTH SYSTEM - LOCAL LEAD EVALUATION SUMMARY             ")
	fmt.Println("================================================================================")
	fmt.Printf("Total Raw Discovered  : %d\n", len(rawCompanies))
	fmt.Printf("Normalized Candidates : %d\n", len(candidates))
	fmt.Printf("Total Exported Leads  : %d\n", len(salesLeads))
	fmt.Printf("🔥 High Priority      : %d (Immediate need: broken site, insecure SSL, missing website)\n", tierHigh)
	fmt.Printf("⚡ Warm Priority      : %d (Good opportunity: static site needing modern web app / CRO)\n", tierWarm)
	fmt.Printf("📋 Moderate Priority  : %d\n", tierModerate)
	fmt.Println("================================================================================")

	// Step 5: Export clean, business-facing CSV file
	csvFile, err := os.Create("leads.csv")
	if err != nil {
		logger.Fatalf("failed to create csv file: %v", err)
	}
	defer csvFile.Close()

	writer := csv.NewWriter(csvFile)
	defer writer.Flush()

	// Clean, plain-text, non-technical headers
	header := []string{
		"Company Name",
		"Category",
		"Priority",
		"Score",
		"Phone",
		"Email",
		"Website",
		"Google Maps Link",
		"Address",
		"Digital Status",
		"Service Needed",
		"Sales Pitch",
	}

	if err := writer.Write(header); err != nil {
		logger.Fatalf("failed to write csv header: %v", err)
	}

	for _, sl := range salesLeads {
		eval := sl.Qualification.Evaluation
		category := mapCategory(sl.Identity.Industry, sl.Identity.Name)
		priorityLabel := mapPriorityLabel(sl.Qualification.Priority)
		cleanScore := fmt.Sprintf("%d", int(math.Round(eval.OpportunityScore)))

		// Clean website URL
		cleanWebsite := sl.Identity.OfficialWebsite
		if cleanWebsite == "" {
			cleanWebsite = sl.Identity.Website
		}
		if cleanWebsite == "" || strings.Contains(cleanWebsite, "maps.google") || strings.Contains(cleanWebsite, "g.co") {
			cleanWebsite = "No Owned Website"
		}

		digitalStatus := formatDigitalStatus(sl)
		serviceNeeded := formatServiceNeeded(digitalStatus, category)
		salesPitch := formatSalesPitch(sl.Identity.Name, digitalStatus, serviceNeeded, category)

		record := []string{
			sl.Identity.Name,
			category,
			priorityLabel,
			cleanScore,
			sl.Identity.Phone,
			sl.Identity.Email,
			cleanWebsite,
			sl.Identity.GoogleProfileURL,
			sl.Identity.Address,
			digitalStatus,
			serviceNeeded,
			salesPitch,
		}

		if err := writer.Write(record); err != nil {
			logger.Fatalf("failed to write company to csv: %v", err)
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		logger.Fatalf("failed to flush csv writer: %v", err)
	}

	logger.Printf("Successfully exported %d clean, business-facing leads into leads.csv.\n", len(salesLeads))
}

// isCorporateOrChain detects corporate conglomerate hotel chains, fast food franchises, and national mega-retailers.
func isCorporateOrChain(name string, website string) bool {
	lowerName := strings.ToLower(name)
	lowerURL := strings.ToLower(website)

	corporateDomains := []string{
		"tajhotels.com", "marriott.com", "hyatt.com", "hyattrestaurants.com", "itchotels.com",
		"itchotels.in", "oberoihotels.com", "radissonhotels.com", "novotel.com", "accor.com",
		"hilton.com", "ihg.com", "holidayinn.com", "starwoodhotels.com",
		"tanishq.co.in", "bluestone.com", "caratlane.com", "kalyanjewellers.net",
		"malabargoldanddiamonds.com", "joyalukkas.com", "pcchandraindia.com", "sencogoldanddiamonds.com",
		"mcdonaldsindia.com", "dominos.co.in", "kfc.com", "pizzahut.co.in", "starbucks.in",
		"subway.com", "burgerking.in", "speciality.co.in", "barbequenation.com", "mainlandchina.com",
		"zara.com", "hm.com", "pantaloons.com", "shoppersstop.com", "westside.com",
		"relianceretail.com", "tatacliq.com", "myntra.com", "amazon.in", "flipkart.com", "bata.in",
	}

	for _, d := range corporateDomains {
		if strings.Contains(lowerURL, d) {
			return true
		}
	}

	corporateNames := []string{
		"taj bengal", "taj city centre", "jw marriott", "the westin", "westin kolkata",
		"itc sonar", "itc royal bengal", "the oberoi grand", "oberoi grand", "novotel", "radisson blu",
		"mcdonald's", "mcdonalds", "burger king", "kfc", "subway", "domino's", "pizza hut",
		"starbucks", "tanishq", "bluestone", "caratlane", "kalyan jewellers",
		"malabar gold", "joyalukkas", "zara", "h&m", "forever 21", "pantaloons", "shoppers stop", "westside",
		"mainland china", "barbeque nation",
	}

	for _, cn := range corporateNames {
		if strings.Contains(lowerName, cn) {
			return true
		}
	}

	return false
}

func mapCategory(industry string, name string) string {
	combined := strings.ToLower(industry + " " + name)
	switch {
	case strings.Contains(combined, "jewel") || strings.Contains(combined, "gold") || strings.Contains(combined, "diamond") || strings.Contains(combined, "silver"):
		return "Jewellery Showroom"
	case strings.Contains(combined, "boutique") || strings.Contains(combined, "saree") || strings.Contains(combined, "lehenga") || strings.Contains(combined, "clothing") || strings.Contains(combined, "apparel") || strings.Contains(combined, "fashion"):
		return "Boutique & Fashion"
	case strings.Contains(combined, "cafe") || strings.Contains(combined, "bakery") || strings.Contains(combined, "coffee") || strings.Contains(combined, "cake"):
		return "Cafe & Bakery"
	case strings.Contains(combined, "restaurant") || strings.Contains(combined, "dine") || strings.Contains(combined, "dining") || strings.Contains(combined, "bistro") || strings.Contains(combined, "bar"):
		return "Restaurant & Dining"
	case strings.Contains(combined, "interior") || strings.Contains(combined, "decor") || strings.Contains(combined, "furniture") || strings.Contains(combined, "architect"):
		return "Interior Design & Furniture"
	case strings.Contains(combined, "clinic") || strings.Contains(combined, "dental") || strings.Contains(combined, "dentist") || strings.Contains(combined, "health") || strings.Contains(combined, "diagnostic") || strings.Contains(combined, "hospital"):
		return "Healthcare & Clinic"
	case strings.Contains(combined, "salon") || strings.Contains(combined, "spa") || strings.Contains(combined, "beauty") || strings.Contains(combined, "wellness") || strings.Contains(combined, "makeup"):
		return "Beauty & Wellness"
	case strings.Contains(combined, "gym") || strings.Contains(combined, "fitness") || strings.Contains(combined, "workout"):
		return "Fitness & Gym"
	case strings.Contains(combined, "banquet") || strings.Contains(combined, "cater"):
		return "Catering & Events"
	case strings.Contains(combined, "electronic") || strings.Contains(combined, "appliance") || strings.Contains(combined, "optician"):
		return "Specialty Retail"
	default:
		return "Local Business"
	}
}

func mapPriorityLabel(p domain.Priority) string {
	switch p {
	case domain.PriorityA:
		return "High"
	case domain.PriorityB:
		return "Warm"
	default:
		return "Moderate"
	}
}

func formatDigitalStatus(sl domain.SalesLead) string {
	pres := sl.Identity.PresenceType
	sev := sl.Digital.TechnicalSeverity
	ev := sl.Digital.MeasuredEvidence

	if pres == domain.PresenceGoogleProfile || (sl.Identity.Website == "" && sl.Identity.GoogleProfileURL != "") {
		return "No Website (Active on Google Maps only)"
	}
	if pres == domain.PresenceSocialPage {
		return "No Owned Website (Relying only on Social Media)"
	}
	if pres == domain.PresenceNone || sl.Identity.Website == "" {
		return "No Official Website Found"
	}
	if sev == domain.SeverityCritical {
		if strings.Contains(ev, "402") {
			return "Website Down (Expired Domain / Billing Issue)"
		}
		if strings.Contains(ev, "404") {
			return "Website Broken (Page Not Found / Dead Link)"
		}
		if strings.Contains(ev, "403") {
			return "Website Blocked (Server Misconfigured)"
		}
		if strings.Contains(ev, "timeout") || strings.Contains(ev, "deadline") {
			return "Website Offline (Server Timeout)"
		}
		return "Website Offline / Broken Link"
	}
	if strings.Contains(ev, "HTTPS: false") || strings.Contains(sl.Sales.Diagnosis.ObservedIssue, "Insecure HTTP") {
		return "Insecure Website (Missing SSL Certificate)"
	}
	if strings.Contains(ev, "MobileViewport: false") {
		return "Poor Mobile View (Not Optimized for Phones)"
	}
	return "Outdated Website (Needs Modern Web App & UX Upgrade)"
}

func formatServiceNeeded(status string, category string) string {
	switch {
	case strings.Contains(status, "Social Media"):
		return "Custom Brand Web Storefront & Social Commerce Portal"
	case strings.Contains(status, "No Website") || strings.Contains(status, "No Official Website"):
		if category == "Jewellery Showroom" {
			return "Bespoke Digital Showroom & VIP Consultation Portal"
		} else if category == "Restaurant & Dining" || category == "Cafe & Bakery" {
			return "Direct Online Ordering & Table Booking Web App"
		} else if strings.Contains(category, "Boutique") {
			return "Digital Lookbook & E-Commerce Web Store"
		}
		return "Custom Web Application & Digital Storefront"
	case strings.Contains(status, "Website Broken") || strings.Contains(status, "Website Down") || strings.Contains(status, "Website Offline") || strings.Contains(status, "Website Blocked"):
		return "Emergency Website Rebuild & Cloud Migration"
	case strings.Contains(status, "Insecure"):
		return "SSL Security Installation & Full-Stack Modernization"
	case strings.Contains(status, "Mobile"):
		return "Mobile-First Responsive Redesign (PWA)"
	default:
		if category == "Restaurant & Dining" || category == "Cafe & Bakery" {
			return "Commission-Free Direct Online Ordering Portal"
		}
		return "Conversion Optimization & Interactive Web Redesign"
	}
}

func formatSalesPitch(compName string, status string, service string, category string) string {
	switch {
	case strings.Contains(status, "Social Media"):
		return "Your business currently relies solely on social media without an owned website domain. We can launch a high-converting web storefront to turn your followers and local searches into direct sales."
	case strings.Contains(status, "No Website") || strings.Contains(status, "No Official Website"):
		if category == "Jewellery Showroom" {
			return "Showcase your exclusive jewellery collections online with an elegant digital catalog so high-intent buyers can browse designs and book private showroom visits."
		} else if category == "Restaurant & Dining" || category == "Cafe & Bakery" {
			return "Launch a direct online menu and table booking system so your diners can order directly without paying 25%+ commission to Swiggy/Zomato."
		} else if strings.Contains(category, "Boutique") {
			return "Turn your local footfall and social followers into 24/7 buyers with a fast, modern digital boutique store that lets customers buy directly via WhatsApp or online."
		}
		return "Your business has a strong presence on Google, but no official website. We can launch a high-speed custom web portal to capture local searches directly."
	case strings.Contains(status, "Website Broken") || strings.Contains(status, "Website Down") || strings.Contains(status, "Website Offline") || strings.Contains(status, "Website Blocked"):
		return "Your official website link is currently broken and showing an error to visitors. We can rapidly restore your web presence and migrate it to high-performance zero-downtime hosting."
	case strings.Contains(status, "Insecure"):
		return "Your website is currently displaying 'Not Secure' warnings in Google Chrome, driving potential buyers away. We can install SSL certificates and upgrade your store so visitors trust your brand."
	case strings.Contains(status, "Mobile"):
		return "Over 70% of local Kolkata customers browse on smartphones, but your website isn't optimized for mobile screens. We can give your site a fluid, modern smartphone interface."
	default:
		return "Your current website is static and lacks modern lead capture. We can upgrade it with interactive inquiry flows, instant WhatsApp chat, and modern design to double your customer inquiries."
	}
}

func cleanAndValidatePhone(raw string) (string, bool) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return "", false
	}

	if strings.HasPrefix(raw, "+31 33") || strings.HasPrefix(raw, "+31-33") {
		raw = "+91 33" + raw[6:]
	}

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
