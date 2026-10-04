package googleplaces

type textSearchRequest struct {
	TextQuery    string `json:"textQuery"`
	PageSize     int    `json:"pageSize,omitempty"`
	PageToken    string `json:"pageToken,omitempty"`
	LanguageCode string `json:"languageCode,omitempty"`
	RegionCode   string `json:"regionCode,omitempty"`
}

type textSearchResponse struct {
	Places        []place `json:"places"`
	NextPageToken string  `json:"nextPageToken,omitempty"`
}

type place struct {
	ID                       string       `json:"id"`
	DisplayName              *displayName `json:"displayName,omitempty"`
	FormattedAddress         string       `json:"formattedAddress,omitempty"`
	WebsiteURI               string       `json:"websiteUri,omitempty"`
	NationalPhoneNumber     string       `json:"nationalPhoneNumber,omitempty"`
	InternationalPhoneNumber string       `json:"internationalPhoneNumber,omitempty"`
	PrimaryType              string       `json:"primaryType,omitempty"`
	Types                    []string     `json:"types,omitempty"`
	GoogleMapsURI            string       `json:"googleMapsUri,omitempty"`
	Location                 *location    `json:"location,omitempty"`
	Rating                   float64      `json:"rating,omitempty"`
	UserRatingCount          int          `json:"userRatingCount,omitempty"`
}

type displayName struct {
	Text         string `json:"text"`
	LanguageCode string `json:"languageCode,omitempty"`
}

type location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}
