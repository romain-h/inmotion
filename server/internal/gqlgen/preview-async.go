package gqlgen

import (
	"context"

	"github.com/romain-h/inmotion/internal/inmotion"
)

func (r *mutationResolver) ResetPreview(ctx context.Context, eid string) {
	r.Repository.SetEditionPreviewKey(ctx, eid, nil)
	r.mu.Lock()
	if r.PreviewBroker[eid] != nil {
		r.PreviewBroker[eid] <- &Preview{Loading: true, URL: nil}
	}
	r.mu.Unlock()
}

func (r *mutationResolver) GeneratePreview(ctx context.Context, eid string, clips []*inmotion.Clip) {
	if clips == nil {
		clips, _ = r.Repository.GetClipsByEditionID(ctx, eid)
	}

	if len(clips) == 0 {
		return
	}

	previewKey, _ := r.DVR.GeneratePreview(eid, clips)
	r.Repository.SetEditionPreviewKey(ctx, eid, previewKey)
	url, _ := r.Storage.GetURL(*previewKey, 30, nil)

	r.mu.Lock()
	if r.PreviewBroker[eid] != nil {
		r.PreviewBroker[eid] <- &Preview{Loading: false, URL: url}
	}
	r.mu.Unlock()
}
