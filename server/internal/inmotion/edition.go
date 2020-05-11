package inmotion

import "context"

type Edition struct {
	ID         string  `json:"id"`
	VideoID    string  `json:"video"`
	Title      string  `json:"title"`
	PreviewKey *string `json:"preview_key"`
}

type EditionInput struct {
	Vid string `json:"vid"`
}

type EditionService interface {
	GetEdition(ctx context.Context, id string) (*Edition, error)
	GetEditionsByVideoID(ctx context.Context, vid string) ([]*Edition, error)
	CreateEdition(ctx context.Context, input *EditionInput) (*Edition, error)
	SetEditionPreviewKey(ctx context.Context, id string, previewKey *string) error
}
