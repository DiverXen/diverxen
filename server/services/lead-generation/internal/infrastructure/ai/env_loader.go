package ai

import (
	"bufio"
	"os"
	"strings"
)

// GetGeminiAPIKey retrieves the Gemini API key from environment or known .env files.
func GetGeminiAPIKey() string {
	// 1. Direct process environment
	if key := os.Getenv("GEMENI_API_KEY"); key != "" {
		return key
	}
	if key := os.Getenv("GEMINI_API_KEY"); key != "" {
		return key
	}

	// 2. Candidate .env paths
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

				if k == "GEMENI_API_KEY" || k == "GEMINI_API_KEY" {
					_ = file.Close()
					return v
				}
			}
			_ = file.Close()
		}
	}

	return ""
}
