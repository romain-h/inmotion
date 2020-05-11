package postgres

import (
	"context"
	"encoding/json"
	"fmt"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/romain-h/inmotion/internal/inmotion"
	uuid "github.com/satori/go.uuid"
)

const insertVideo = `INSERT INTO videos (id, title, mime_type, file_size, width, height, key, owner_id, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`

func (r *Repo) CreateVideo(ctx context.Context, filename string, mimeType string, fileSize int64, userID string) (*inmotion.Video, error) {
	id := uuid.NewV4().String()
	now := time.Now()

	// Extract file extension and filename
	ext := filepath.Ext(filename)
	title := strings.TrimSuffix(filename, ext)

	video := inmotion.Video{
		ID:        id,
		Title:     title,
		MimeType:  mimeType,
		FileSize:  &fileSize,
		Key:       fmt.Sprintf("/raw-videos/%s%s", id, ext),
		CreatedAt: now.UTC(),
		UpdatedAt: now.UTC(),
		OwnerID:   userID,
		Width:     new(int),
		Height:    new(int),
	}

	if _, err := r.db.Exec(ctx, insertVideo,
		video.ID, video.Title, video.MimeType, video.FileSize, video.Width, video.Height, video.Key,
		video.OwnerID, video.CreatedAt, video.UpdatedAt,
	); err != nil {
		return nil, err
	}

	return &video, nil
}

const selectVideo = `SELECT title, transcript, mime_type, file_size,
width, height, audio_sample_rate, audio_channel_layout,
key, owner_id FROM videos WHERE id = $1`

func (r *Repo) GetVideo(ctx context.Context, id string) (*inmotion.Video, error) {
	video := inmotion.Video{ID: id}

	row := r.db.QueryRow(ctx, selectVideo, id)
	if err := row.Scan(
		&video.Title, &video.Transcript, &video.MimeType, &video.FileSize,
		&video.Width, &video.Height, &video.AudioSampleRate, &video.AudioChannelLayout,
		&video.Key, &video.OwnerID,
	); err != nil {
		return nil, err
	}

	return &video, nil
}

const getVideoByEid = `SELECT id, title, transcript, mime_type, file_size,
width, height, audio_sample_rate, audio_channel_layout,
key, owner_id, created_at FROM videos WHERE id = (SELECT video_id FROM editions WHERE id = $1)
ORDER BY created_at DESC`

func (r *Repo) GetVideoByEditionID(ctx context.Context, eid string) (*inmotion.Video, error) {
	video := inmotion.Video{}

	row := r.db.QueryRow(ctx, getVideoByEid, eid)
	if err := row.Scan(
		&video.ID, &video.Title, &video.Transcript, &video.MimeType, &video.FileSize,
		&video.Width, &video.Height, &video.AudioSampleRate, &video.AudioChannelLayout,
		&video.Key, &video.OwnerID, &video.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &video, nil
}

const selectVideos = `SELECT id, title, transcript, mime_type, file_size,
width, height, audio_sample_rate, audio_channel_layout,
key, owner_id, created_at FROM videos WHERE owner_id = $1
ORDER BY created_at DESC`

func (r *Repo) GetVideos(ctx context.Context, userID string) ([]*inmotion.Video, error) {
	var videos []*inmotion.Video

	rows, err := r.db.Query(ctx, selectVideos, userID)
	defer rows.Close()

	if err != nil {
		return videos, err
	}

	for rows.Next() {
		var v inmotion.Video
		_ = rows.Scan(&v.ID, &v.Title, &v.Transcript, &v.MimeType, &v.FileSize,
			&v.Width, &v.Height, &v.AudioSampleRate, &v.AudioChannelLayout,
			&v.Key, &v.OwnerID, &v.CreatedAt)
		videos = append(videos, &v)
	}

	return videos, nil
}

const updateKey = `UPDATE videos SET key = $1 WHERE id = $2`

func (r *Repo) UpdateVideoKey(ctx context.Context, vid string, key string) error {
	if _, err := r.db.Exec(ctx, updateKey, key, vid); err != nil {
		return err
	}

	return nil
}

const updateTitle = `UPDATE videos SET title = $1 WHERE id = $2`

func (r *Repo) UpdateVideoTitle(ctx context.Context, vid string, title string) error {
	if _, err := r.db.Exec(ctx, updateTitle, title, vid); err != nil {
		return err
	}

	return nil
}

const insertJobID = `INSERT INTO video_transcript_jobs (video_id, transcript_job_id)
VALUES ($1, $2)`

func (r *Repo) SetTranscriptJob(ctx context.Context, vid string, jobID string) error {
	if _, err := r.db.Exec(ctx, insertJobID, vid, jobID); err != nil {
		return err
	}

	return nil
}

const updateTranscript = `UPDATE videos SET transcript = $1 WHERE id = $2`

func (r *Repo) UpdateVideoTranscript(ctx context.Context, vid string, transcript string) error {
	if _, err := r.db.Exec(ctx, updateTranscript, transcript, vid); err != nil {
		return err
	}

	return nil
}

const selectJobID = `SELECT transcript_job_id FROM video_transcript_jobs WHERE video_id = $1`

func (r *Repo) GetTranscriptJob(ctx context.Context, vid string, jobID string) (*string, error) {
	var videoID string
	row := r.db.QueryRow(ctx, selectJobID, vid)
	if err := row.Scan(&videoID); err != nil {
		return nil, err
	}

	return &videoID, nil
}

const updateVideoMeta = `UPDATE videos SET meta = $1, width = $2, height= $3,
audio_sample_rate = $4, audio_channel_layout = $5
WHERE id = $6`

type stream struct {
	Width         int
	Height        int
	ChannelLayout string `json:"channel_layout"`
	SampleRate    string `json:"sample_rate"`
}

type ffpMeta struct {
	Streams []stream
}

func (r *Repo) UpdateVideoMeta(ctx context.Context, vid string, meta string) error {
	var res ffpMeta
	json.Unmarshal([]byte(meta), &res)
	sampleRate, _ := strconv.ParseInt(res.Streams[1].SampleRate, 10, 64)

	if _, err := r.db.Exec(ctx, updateVideoMeta, meta, res.Streams[0].Width, res.Streams[0].Height,
		sampleRate, res.Streams[1].ChannelLayout,
		vid); err != nil {
		return err
	}

	return nil
}
