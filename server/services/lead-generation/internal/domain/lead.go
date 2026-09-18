package domain

import (
	"errors"
	"time"
)

type Stage string

const (
	StageIdentified  Stage = "identified"
	StageQualified   Stage = "qualified"
	StageContacted   Stage = "contacted"
	StageResponded   Stage = "responded"
	StageDiscovery   Stage = "discovery"
	StageOpportunity Stage = "opportunity"
	StageProposal    Stage = "proposal"
	StageNegotiation Stage = "negotiation"
	StageWon         Stage = "won"
	StageLost        Stage = "lost"
	StageNurture     Stage = "nurture"
)

type Lead struct {
	ID string

	CompanyID string
	ContactID string

	Trigger *Trigger

	ObservedProblem string

	Qualification Qualification
	Priority      Priority

	Stage Stage

	EstimatedValue float64

	OwnerID string

	LastAction   string
	NextAction   string
	NextActionAt *time.Time

	CreatedAt time.Time
	UpdatedAt time.Time
}

func (l Lead) Validate() error {
	if l.ID == "" {
		return errors.New("lead ID is required")
	}

	if l.CompanyID == "" {
		return errors.New("company ID is required")
	}

	if l.ContactID == "" {
		return errors.New("contact ID is required")
	}

	if l.Stage == "" {
		return errors.New("lead stage is required")
	}

	if err := l.Qualification.Validate(); err != nil {
		return err
	}

	return nil
}

func (l *Lead) Touch(now time.Time) {
	l.UpdatedAt = now
}
