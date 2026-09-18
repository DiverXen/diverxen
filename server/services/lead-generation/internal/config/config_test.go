package config

import (
	"os"
	"testing"
)

func TestLoad_Success(t *testing.T) {
	t.Setenv("GOOGLE_MAPS_API_KEY", "test-api-key")

	cfg, err := Load()

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.GoogleMapsAPIKey != "test-api-key" {
		t.Fatalf(
			"expected API key %q, got %q",
			"test-api-key",
			cfg.GoogleMapsAPIKey,
		)
	}
}

func TestLoad_MissingGoogleMapsAPIKey(t *testing.T) {
	_ = os.Unsetenv("GOOGLE_MAPS_API_KEY")

	_, err := Load()

	if err == nil {
		t.Fatal("expected error, got nil")
	}
}
