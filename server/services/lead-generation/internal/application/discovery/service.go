package discovery

import (
	"context"
	"lead-generation/internal/domain"
	"lead-generation/internal/ports"
)

type Service struct {
	source ports.CompanySource
}

func NewService(source ports.CompanySource) *Service {
	return &Service{
		source: source,
	}
}

func (s *Service) DiscoverCompanies(
	ctx context.Context,
	criteria domain.SearchCriteria,
) ([]domain.Company, error) {
	return s.source.SearchCompanies(ctx, criteria)
}
