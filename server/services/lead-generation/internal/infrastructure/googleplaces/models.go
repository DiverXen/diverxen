package googleplaces

type textSearchRequest struct {
	TextQuery    string `json:"textQuery"`
	PageSize     int    `json:"pageSize,omitempty"`
	LanguageCode string `json:"languageCode,omitempty"`
	RegionCode   string `json:"regionCode,omitempty"`
}

type textSearchResponse struct {
	Places []place `json:"places"`
}

type place struct {
	ID               string       `json:"id"`
	DisplayName      *displayName `json:"displayName,omitempty"`
	FormattedAddress string       `json:"formattedAddress,omitempty"`
	WebsiteURI       string       `json:"websiteUri,omitempty"`
	PrimaryType      string       `json:"primaryType,omitempty"`
	Types            []string     `json:"types,omitempty"`
	GoogleMapsURI    string       `json:"googleMapsUri,omitempty"`
	Location         *location    `json:"location,omitempty"`
}

type displayName struct {
	Text         string `json:"text"`
	LanguageCode string `json:"languageCode,omitempty"`
}

type location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}
