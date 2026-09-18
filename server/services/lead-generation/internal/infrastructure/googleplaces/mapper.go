package googleplaces

import (
	"lead-generation/internal/domain"
)

func mapPlaceToCompany(place place) domain.Company {
	name := ""

	if place.DisplayName != nil {
		name = place.DisplayName.Text
	}

	industry := place.PrimaryType

	if industry == "" && len(place.Types) > 0 {
		industry = place.Types[0]
	}

	return domain.Company{
		ID:            place.ID,
		Name:          name,
		Website:       place.WebsiteURI,
		Industry:      industry,
		Location:      place.FormattedAddress,
		EmployeeCount: 0,
		BusinessModel: "",
		Source:        "google_places",
		SourceID:      place.ID,
	}
}
