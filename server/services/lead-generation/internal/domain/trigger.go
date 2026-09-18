package domain

import (
	"errors"
	"time"
)

type TriggerType string

const (
	TriggerFunding       TriggerType = "funding"
	TriggerLaunch        TriggerType = "launch"
	TriggerHiring        TriggerType = "hiring"
	TriggerExpansion     TriggerType = "expansion"
	TriggerAdvertising   TriggerType = "advertising"
	TriggerRepositioning TriggerType = "repositioning"
)

type Trigger struct {
	Type        TriggerType
	Description string
	SourceURL   string
	ObservedAt  time.Time
	Verified    bool
}

func (t Trigger) Validate() error {
	if t.Type == "" {
		return errors.New("trigger type is required")
	}

	if t.Description == "" {
		return errors.New("trigger description is required")
	}

	return nil
}
