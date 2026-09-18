package domain

type SearchCriteria struct {
	Industries     []string
	Locations      []string
	BusinessModels []string

	MinEmployees int
	MaxEmployees int

	RequiredTriggers []TriggerType

	ExcludedIndustries []string
	ExcludedCompanies  []string

	MinimumProjectValue float64
}
