package config

import (
	"bufio"
	"errors"
	"os"
	"strings"
)

type Config struct {
	GoogleMapsAPIKey   string
	GooglePlacesAPIKey string
}

// GetGooglePlacesAPIKey retrieves the Google Places / Maps API key from the environment or candidate .env files.
func GetGooglePlacesAPIKey() string {
	for _, envVar := range []string{"GOOGLE_MAPS_API_KEY", "GOOGLE_PLACES_API_KEY", "GOOGLE_API_KEY"} {
		if key := os.Getenv(envVar); key != "" {
			return key
		}
	}

	candidatePaths := []string{
		".env",
		"../../.env",
		"../../../.env",
		"f:/DEV/DIVERXEN/.env",
		"F:\\DEV\\DIVERXEN\\.env",
	}

	for _, path := range candidatePaths {
		if file, err := os.Open(path); err == nil {
			scanner := bufio.NewScanner(file)
			for scanner.Scan() {
				line := strings.TrimSpace(scanner.Text())
				if strings.HasPrefix(line, "#") || !strings.Contains(line, "=") {
					continue
				}
				parts := strings.SplitN(line, "=", 2)
				k := strings.TrimSpace(parts[0])
				v := strings.TrimSpace(parts[1])
				v = strings.Trim(v, `"'`)

				if k == "GOOGLE_MAPS_API_KEY" || k == "GOOGLE_PLACES_API_KEY" || k == "GOOGLE_API_KEY" {
					_ = file.Close()
					return v
				}
			}
			_ = file.Close()
		}
	}

	return ""
}

func Load() (Config, error) {
	googleMapsAPIKey := os.Getenv("GOOGLE_MAPS_API_KEY")
	if googleMapsAPIKey == "" {
		return Config{}, errors.New(
			"GOOGLE_MAPS_API_KEY environment variable is required",
		)
	}

	return Config{
		GoogleMapsAPIKey:   googleMapsAPIKey,
		GooglePlacesAPIKey: googleMapsAPIKey,
	}, nil
}
