package inmotion

import (
	"context"
	"time"
)

type Monologue struct {
	Speaker  *int64              `json:"speaker"`
	Elements []*MonologueElement `json:"elements"`
}

type MonologueElement struct {
	Type  string   `json:"type"`
	Value string   `json:"value"`
	Ts    *float64 `json:"ts"`
	TsEnd *float64 `json:"end_ts"`
}

type Transcript struct {
	Monologues []*Monologue `json:"monologues"`
}

type Video struct {
	ID                 string      `json:"id"`
	Title              string      `json:"title"`
	PresignedURL       string      `json:"src"`
	MimeType           string      `json:"mime_type"`
	Key                string      `json:"key"`
	FileSize           *int64      `json:"file_size"`
	Width              *int        `json:"width"`
	Height             *int        `json:"height"`
	AudioSampleRate    *int64      `json:"audio_sample_rate"`
	AudioChannelLayout *string     `json:"audio_channel_layout"`
	Transcript         *Transcript `json:"transcript"`
	CreatedAt          time.Time   `json:"created_at"`
	UpdatedAt          time.Time   `json:"updated_at"`
	OwnerID            string      `json:"owner_id"`
}

type VideoService interface {
	CreateVideo(context.Context, string, string, int64, string) (*Video, error)
	GetVideo(context.Context, string) (*Video, error)
	GetVideoByEditionID(context.Context, string) (*Video, error)
	GetVideos(context.Context, string) ([]*Video, error)
	UpdateVideoKey(context.Context, string, string) error
	UpdateVideoTitle(context.Context, string, string) error
	SetTranscriptJob(context.Context, string, string) error
	UpdateVideoTranscript(context.Context, string, string) error
	GetTranscriptJob(context.Context, string, string) (*string, error)
	UpdateVideoMeta(context.Context, string, string) error
}
