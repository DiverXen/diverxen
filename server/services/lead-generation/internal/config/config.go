package config

import (
	"errors"
	"os"
)

type Config struct {
	GoogleMapsAPIKey string
}

func Load() (Config, error) {
	googleMapsAPIKey := os.Getenv("GOOGLE_MAPS_API_KEY")

	if googleMapsAPIKey == "" {
		return Config{}, errors.New(
			"GOOGLE_MAPS_API_KEY environment variable is required",
		)
	}

	return Config{
		GoogleMapsAPIKey: googleMapsAPIKey,
	}, nil
}
