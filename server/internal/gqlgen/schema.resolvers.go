// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
package gqlgen

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/romain-h/inmotion/internal/auth"
	"github.com/romain-h/inmotion/internal/inmotion"
)

func (r *clipResolver) Edition(ctx context.Context, obj *inmotion.Clip) (*inmotion.Edition, error) {
	return r.Repository.GetEdition(ctx, obj.EditionID)
}

func (r *clipResolver) Thumbnail(ctx context.Context, obj *inmotion.Clip) (*string, error) {
	return r.DVR.GetClipThumbnailsURL(obj.ID)
}

func (r *editionResolver) Video(ctx context.Context, obj *inmotion.Edition) (*inmotion.Video, error) {
	return r.Repository.GetVideo(ctx, obj.VideoID)
}

func (r *editionResolver) Clips(ctx context.Context, obj *inmotion.Edition) ([]*inmotion.Clip, error) {
	return r.Repository.GetClipsByEditionID(ctx, obj.ID)
}

func (r *editionResolver) PreviewURL(ctx context.Context, obj *inmotion.Edition) (*string, error) {
	if obj.PreviewKey == nil {
		return nil, nil
	}
	return r.Storage.GetURL(*obj.PreviewKey, 30, nil)
}

func (r *editionResolver) ExportURL(ctx context.Context, obj *inmotion.Edition) (*string, error) {
	if obj.PreviewKey == nil {
		return nil, nil
	}

	video, err := r.Repository.GetVideoByEditionID(ctx, obj.ID)
	if err != nil {
		return nil, err
	}

	title := strings.Replace(strings.ToLower(video.Title), " ", "-", -1)
	contentDisposition := fmt.Sprintf("attachment; filename=\"%s.mp4\"", title)
	return r.Storage.GetURL(*obj.PreviewKey, 30, &contentDisposition)
}

func (r *mutationResolver) UpdateVideoTitle(ctx context.Context, id string, title string) (*inmotion.Video, error) {
	if err := r.Repository.UpdateVideoTitle(ctx, id, title); err != nil {
		return nil, err
	}

	return r.Repository.GetVideo(ctx, id)
}

func (r *mutationResolver) CreateClip(ctx context.Context, input *inmotion.ClipInput) (*inmotion.Clip, error) {
	r.ResetPreview(ctx, input.Eid)
	clip, err := r.Repository.CreateClip(ctx, input)
	if err != nil {
		return nil, err
	}

	video, err := r.Repository.GetVideoByEditionID(ctx, input.Eid)
	if err != nil {
		return nil, err
	}

	if err := r.DVR.GenerateClipThumbnails(*video, clip); err != nil {
		return nil, err
	}

	go func() {
		bg := context.Background()
		if err := r.DVR.GenerateClipVideos(*video, *clip); err != nil {
			fmt.Println(err)
		}
		r.Repository.SetClipHasPreview(bg, clip.ID, true)
		r.GeneratePreview(bg, input.Eid, nil)
	}()

	return clip, nil
}

func (r *mutationResolver) CreateEdition(ctx context.Context, input *inmotion.EditionInput) (*inmotion.Edition, error) {
	video, err := r.Repository.GetVideo(ctx, input.Vid)
	if err != nil {
		return nil, err
	}
	isReady, err := r.Storage.IsUploaded(video.Key, *video.FileSize)
	if !isReady || err != nil {
		return nil, errors.New("Something went wrong. Please make sure your file has been uploaded")
	}
	go func() {
		// 0 - Grab Meta
		meta, err := r.DVR.GrabVideoMeta(video.ID, video.Key)
		if err != nil {
			fmt.Println(fmt.Errorf("GrabVideoMeta: %v", err))
		}
		err = r.Repository.UpdateVideoMeta(context.Background(), video.ID, *meta)
		if err != nil {
			fmt.Println(fmt.Errorf("UpdateVideoMeta: %v", err))
		}

		// 1 - Extract Audio
		audioFilePath, err := r.DVR.ExtractAudio(video.ID, video.Key)
		if err != nil {
			fmt.Println(fmt.Errorf("ExtractAudio: %v", err))
		}

		// 2- Submit file
		jobID, err := r.Transcript.Submit(video.ID, *audioFilePath)
		if err != nil {
			fmt.Println(fmt.Errorf("Submitting transcript: %v", err))
			return
		}
		// ... and store job id
		if err := r.Repository.SetTranscriptJob(context.Background(), video.ID, *jobID); err != nil {
			fmt.Println(err)
		}
	}()

	return r.Repository.CreateEdition(ctx, input)
}

func (r *mutationResolver) ReorderClip(ctx context.Context, eid string, id string, newIndex int64) ([]*inmotion.Clip, error) {
	r.ResetPreview(ctx, eid)
	clips, err := r.Repository.ReorderClips(ctx, id, newIndex)
	if err != nil {
		return nil, err
	}

	go func() {
		bg := context.Background()
		r.GeneratePreview(bg, eid, nil)
	}()

	return clips, nil
}

func (r *mutationResolver) RemoveClip(ctx context.Context, eid string, id *string) (bool, error) {
	r.ResetPreview(ctx, eid)
	go func() {
		r.DVR.DeleteClipThumbnails(*id)
		r.DVR.DeleteClipVideos(*id)
	}()

	isDeleted, err := r.Repository.DeleteClip(ctx, *id)
	if err != nil {
		return false, err
	}
	go func() {
		bg := context.Background()
		r.GeneratePreview(bg, eid, nil)
	}()
	return isDeleted, err
}

func (r *mutationResolver) GenerateVideoUploadURL(ctx context.Context, name string, typeArg string, size int64) (*GeneratedUploader, error) {
	userID := auth.ForContext(ctx)
	video, err := r.Repository.CreateVideo(ctx, name, typeArg, size, userID)
	if err != nil {
		return nil, err
	}
	url, err := r.DVR.GenerateVideoUploaderURL(video)
	if err != nil {
		return nil, err
	}

	return &GeneratedUploader{ID: video.ID, URL: *url}, nil
}

func (r *queryResolver) Videos(ctx context.Context) ([]*inmotion.Video, error) {
	userID := auth.ForContext(ctx)
	// TODO use acl.Video.enforceReadPerm(videos, userID)
	// https://graphql.org/learn/authorization/
	// "We recommend passing a fully-hydrated User object instead of an opaque token or API key to your business logic layer."
	// So it might be worth hydrating the user in ctx
	// https://gqlgen.com/recipes/authentication/
	return r.Repository.GetVideos(ctx, userID)
}

func (r *queryResolver) Video(ctx context.Context, id string) (*inmotion.Video, error) {
	return r.Repository.GetVideo(ctx, id)
}

func (r *queryResolver) Edition(ctx context.Context, id string) (*inmotion.Edition, error) {
	return r.Repository.GetEdition(ctx, id)
}

func (r *subscriptionResolver) PreviewUpdate(ctx context.Context, eid string) (<-chan *Preview, error) {
	// TODO Check JWT valid in CTX before returning Status
	// TODO check current user has access to the edition

	prevCh := make(chan *Preview, 1)
	r.mu.Lock()
	r.PreviewBroker[eid] = prevCh
	r.mu.Unlock()

	go func() {
		edition, _ := r.Repository.GetEdition(context.Background(), eid)
		if edition.PreviewKey == nil {
			return
		}
		url, _ := r.Storage.GetURL(*edition.PreviewKey, 30, nil)

		r.mu.Lock()
		if r.PreviewBroker[eid] != nil {
			r.PreviewBroker[eid] <- &Preview{Loading: false, URL: url}
		}
		r.mu.Unlock()
	}()

	go func() {
		<-ctx.Done()
		r.mu.Lock()
		delete(r.PreviewBroker, eid)
		r.mu.Unlock()
	}()

	return prevCh, nil
}

func (r *videoResolver) Src(ctx context.Context, obj *inmotion.Video) (string, error) {
	url, err := r.Storage.GetURL(obj.Key, 45, nil)
	if err != nil {
		return "NOT_FOUND", err
	}
	return *url, nil
}

func (r *videoResolver) Editions(ctx context.Context, obj *inmotion.Video) ([]*inmotion.Edition, error) {
	return r.Repository.GetEditionsByVideoID(ctx, obj.ID)
}

func (r *videoResolver) IsTranscriptReady(ctx context.Context, obj *inmotion.Video) (bool, error) {
	return obj.Transcript != nil, nil
}

func (r *Resolver) Clip() ClipResolver                 { return &clipResolver{r} }
func (r *Resolver) Edition() EditionResolver           { return &editionResolver{r} }
func (r *Resolver) Mutation() MutationResolver         { return &mutationResolver{r} }
func (r *Resolver) Query() QueryResolver               { return &queryResolver{r} }
func (r *Resolver) Subscription() SubscriptionResolver { return &subscriptionResolver{r} }
func (r *Resolver) Video() VideoResolver               { return &videoResolver{r} }

type clipResolver struct{ *Resolver }
type editionResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type subscriptionResolver struct{ *Resolver }
type videoResolver struct{ *Resolver }
