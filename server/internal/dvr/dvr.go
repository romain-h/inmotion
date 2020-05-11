package dvr

import (
	"github.com/romain-h/inmotion/internal/config"
	"github.com/romain-h/inmotion/internal/inmotion"
	"github.com/romain-h/inmotion/internal/storage"
)

const fadeDuration = 0.25
const blackTransitionDuration = 0.15

type Recorder interface {
	GenerateVideoUploaderURL(*inmotion.Video) (*string, error)
	GenerateClipThumbnails(inmotion.Video, *inmotion.Clip) error
	GenerateClipVideos(inmotion.Video, inmotion.Clip) error
	DeleteClipVideos(string) error
	GetClipThumbnailsURL(string) (*string, error)
	DeleteClipThumbnails(string) error
	GeneratePreview(editionID string, clips []*inmotion.Clip) (*string, error)
	GrabVideoMeta(string, string) (*string, error)
	MoveFastStart(string, string) (*string, error)
	ExtractAudio(string, string) (*string, error)
}

type DVR struct {
	cfg     config.Config
	storage storage.Storage
}

func New(cfg config.Config, storage storage.Storage) Recorder {
	return &DVR{cfg: cfg, storage: storage}
}
