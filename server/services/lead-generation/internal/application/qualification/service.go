package qualification

import "lead-generation/internal/domain"

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func (s *Service) Evaluate(
	lead domain.Lead,
) domain.QualificationResult {
	qualification := lead.Qualification

	result := domain.QualificationResult{
		Score:            qualification,
		Total:            qualification.Total(),
		Priority:         qualification.Priority(),
		HasVisibleNeed:   lead.ObservedProblem != "",
		HasDecisionMaker: lead.ContactID != "",
		HasCapacity:      qualification.Capacity > 0,
	}

	result.EligibleForContact = result.IsEligible()

	return result
}
