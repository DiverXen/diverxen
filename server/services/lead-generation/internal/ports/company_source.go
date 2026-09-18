package ports

import (
	"context"
	"lead-generation/internal/domain"
)

type CompanySource interface {
	SearchCompanies(
		ctx context.Context,
		criteria domain.SearchCriteria,
	) ([]domain.Company, error)
}
