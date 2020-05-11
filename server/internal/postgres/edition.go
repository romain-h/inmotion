package postgres

import (
	"context"

	"cirello.io/goherokuname"
	"github.com/romain-h/inmotion/internal/inmotion"
	uuid "github.com/satori/go.uuid"
)

const getEdition = `SELECT id, title, video_id, preview_key FROM editions WHERE id = $1`

func (r *Repo) GetEdition(ctx context.Context, id string) (*inmotion.Edition, error) {
	var edition inmotion.Edition
	row := r.db.QueryRow(ctx, getEdition, id)
	if err := row.Scan(&edition.ID, &edition.Title, &edition.VideoID, &edition.PreviewKey); err != nil {
		return nil, err
	}

	return &edition, nil
}

const getByVID = `SELECT id, title FROM editions WHERE video_id = $1`

func (r *Repo) GetEditionsByVideoID(ctx context.Context, vid string) ([]*inmotion.Edition, error) {
	var editions []*inmotion.Edition
	rows, err := r.db.Query(context.Background(), getByVID, vid)
	if err != nil {
		return editions, err
	}
	defer rows.Close()

	for rows.Next() {
		var edition inmotion.Edition
		_ = rows.Scan(&edition.ID, &edition.Title)
		editions = append(editions, &edition)
	}

	return editions, nil
}

const insertEdition = `INSERT INTO editions (id, video_id, title) VALUES ($1, $2, $3)`

func (r *Repo) CreateEdition(ctx context.Context, input *inmotion.EditionInput) (*inmotion.Edition, error) {
	id := uuid.NewV4().String()
	if _, err := r.db.Exec(ctx, insertEdition, id, input.Vid, goherokuname.Haikunate()); err != nil {
		return nil, err
	}
	return r.GetEdition(ctx, id)
}

const updatePreviewKey = `UPDATE editions SET preview_key = $1 WHERE id = $2`

func (r *Repo) SetEditionPreviewKey(ctx context.Context, id string, previewKey *string) error {
	if _, err := r.db.Exec(ctx, updatePreviewKey, previewKey, id); err != nil {
		return err
	}

	return nil
}
