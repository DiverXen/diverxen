package ports

import (
	"context"
	"time"

	"lead-generation/internal/domain"
)

type AuditResult struct {
	WebsiteAccessible bool
	StatusCode        int
	HasHTTPS          bool
	ResponseTimeMs    int64
	IsMobileFriendly  bool
	MobileReadiness   int // 0-10
	FoundEmails       []string
	FoundPhones       []string
	SocialLinks       map[string]string
	ObservedProblem   string
	PitchAngle        string

	// Growth Framework v1.0 additions
	PresenceType      domain.PresenceType
	OfficialDomain    string
	GoogleProfileURL  string
	TechnicalSeverity domain.TechnicalSeverity
	MeasuredEvidence  string
	AuditError        string
	AuditTimestamp    time.Time
}

type WebsiteAuditor interface {
	Audit(ctx context.Context, company domain.Company) AuditResult
}
