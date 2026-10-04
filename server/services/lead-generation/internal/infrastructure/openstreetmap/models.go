package openstreetmap

type overpassResponse struct {
	Elements []element `json:"elements"`
}

type element struct {
	Type   string            `json:"type"`
	ID     int64             `json:"id"`
	Lat    float64           `json:"lat,omitempty"`
	Lon    float64           `json:"lon,omitempty"`
	Center *center           `json:"center,omitempty"`
	Tags   map[string]string `json:"tags,omitempty"`
}

type center struct {
	Lat float64 `json:"lat"`
	Lon float64 `json:"lon"`
}
