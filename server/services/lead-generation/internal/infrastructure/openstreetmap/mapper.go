package openstreetmap

import (
	"fmt"
	"strings"

	"lead-generation/internal/domain"
)

func mapElementToCompany(element element) domain.Company {
	name := element.Tags["name"]

	phone := extractPhone(element.Tags)
	email := extractEmail(element.Tags)

	website := element.Tags["website"]
	if website == "" {
		website = element.Tags["contact:website"]
	}
	if website == "" {
		website = element.Tags["url"]
	}

	industry := determineIndustry(element.Tags)

	location := buildLocation(element.Tags)

	sourceID := fmt.Sprintf(
		"%s/%d",
		element.Type,
		element.ID,
	)

	return domain.Company{
		ID:            sourceID,
		Name:          name,
		Phone:         phone,
		Email:         email,
		Website:       website,
		Industry:      industry,
		Location:      location,
		EmployeeCount: 0,
		BusinessModel: "",
		Source:        "openstreetmap",
		SourceID:      sourceID,
	}
}

func extractEmail(tags map[string]string) string {
	for _, key := range []string{
		"email",
		"contact:email",
	} {
		if value := strings.TrimSpace(tags[key]); value != "" {
			return value
		}
	}

	return ""
}

func extractPhone(tags map[string]string) string {
	for _, key := range []string{
		"phone",
		"contact:phone",
		"contact:mobile",
		"mobile",
		"phone:mobile",
	} {
		if value := strings.TrimSpace(tags[key]); value != "" {
			return value
		}
	}

	return ""
}

func determineIndustry(tags map[string]string) string {
	for _, key := range []string{
		"shop",
		"amenity",
		"office",
		"craft",
		"tourism",
		"healthcare",
	} {
		if value := tags[key]; value != "" {
			return value
		}
	}

	return ""
}

func buildLocation(tags map[string]string) string {
	parts := []string{}

	for _, key := range []string{
		"addr:housenumber",
		"addr:street",
		"addr:suburb",
		"addr:city",
		"addr:state",
		"addr:postcode",
		"addr:country",
	} {
		if value := strings.TrimSpace(tags[key]); value != "" {
			parts = append(parts, value)
		}
	}

	return strings.Join(parts, ", ")
}
