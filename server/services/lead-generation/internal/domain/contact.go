package domain

import "errors"

type Contact struct {
	ID            string
	CompanyID     string
	Name          string
	Role          string
	LinkedInURL   string
	Email         string
	EmailVerified bool
}

func (c Contact) Validate() error {
	if c.ID == "" {
		return errors.New("contact ID is required")
	}

	if c.CompanyID == "" {
		return errors.New("company ID is required")
	}

	if c.Name == "" {
		return errors.New("contact name is required")
	}

	return nil
}
