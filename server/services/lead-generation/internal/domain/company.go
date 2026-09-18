package domain

import "errors"

type Company struct {
	ID            string
	Name          string
	Website       string
	Industry      string
	Location      string
	EmployeeCount int
	BusinessModel string
	Source        string
	SourceID      string
}

func (c Company) Validate() error {
	if c.ID == "" {
		return errors.New("company ID is required")
	}

	if c.Name == "" {
		return errors.New("company name is required")
	}

	return nil
}
