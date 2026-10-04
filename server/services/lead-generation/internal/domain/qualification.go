package domain

import "errors"

type Qualification struct {
	BusinessFit int
	VisibleNeed int
	Trigger     int
	Authority   int
	Capacity    int
	Timing      int
}

type Priority string

const (
	PriorityA      Priority = "A"
	PriorityB      Priority = "B"
	PriorityC      Priority = "C"
	PriorityD      Priority = "D"
	PriorityReview Priority = "Review"
	PriorityReject Priority = "reject"
)

func (q Qualification) Validate() error {
	scores := map[string]int{
		"business fit": q.BusinessFit,
		"visible need": q.VisibleNeed,
		"trigger":      q.Trigger,
		"authority":    q.Authority,
		"capacity":     q.Capacity,
		"timing":       q.Timing,
	}

	for name, score := range scores {
		if score < 0 || score > 2 {
			return errors.New(name + " score must be between 0 and 2")
		}
	}

	return nil
}

func (q Qualification) Total() int {
	return q.BusinessFit +
		q.VisibleNeed +
		q.Trigger +
		q.Authority +
		q.Capacity +
		q.Timing
}

func (q Qualification) Priority() Priority {
	total := q.Total()

	switch {
	case total >= 10:
		return PriorityA

	case total >= 7:
		return PriorityB

	case total >= 4:
		return PriorityC

	default:
		return PriorityReject
	}
}

type QualificationResult struct {
	Score Qualification

	Total    int
	Priority Priority

	HasVisibleNeed   bool
	HasDecisionMaker bool
	HasCapacity      bool

	EligibleForContact bool
}

func (r QualificationResult) IsEligible() bool {
	return r.HasVisibleNeed &&
		r.HasDecisionMaker &&
		r.HasCapacity
}
