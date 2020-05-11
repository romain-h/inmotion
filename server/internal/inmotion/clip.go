package inmotion

import "context"

type Clip struct {
	ID                string   `json:"id"`
	Ts                *float64 `json:"ts"`
	TsEnd             *float64 `json:"tsEnd"`
	EditionID         string   `json:"edition"`
	Src               *string  `json:"src"`
	Order             *int64   `json:"order"`
	ThumnailSignedUrl string   `json:"thumbnail"`
	HasPreviews       bool     `json:"has_previews"`
}

type ClipInput struct {
	Eid   string   `json:"eid"`
	Ts    *float64 `json:"ts"`
	TsEnd *float64 `json:"tsEnd"`
}

type ClipService interface {
	GetClip(ctx context.Context, id string) (*Clip, error)
	GetClipsByEditionID(ctx context.Context, eid string) ([]*Clip, error)
	CreateClip(ctx context.Context, input *ClipInput) (*Clip, error)
	SetClipHasPreview(ctx context.Context, id string, has bool) error
	ReorderClips(ctx context.Context, id string, newIndex int64) ([]*Clip, error)
	DeleteClip(ctx context.Context, id string) (bool, error)
}
