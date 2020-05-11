package postgres

import (
	"context"

	"github.com/jackc/pgx/v4"
	"github.com/romain-h/inmotion/internal/inmotion"
	uuid "github.com/satori/go.uuid"
)

const getClip = `SELECT id, edition_id, ts, ts_end, montage_order
FROM clips
WHERE id = $1
`

func (r *Repo) GetClip(ctx context.Context, id string) (*inmotion.Clip, error) {
	var clip inmotion.Clip
	row := r.db.QueryRow(ctx, getClip, id)
	if err := row.Scan(&clip.ID, &clip.EditionID, &clip.Ts, &clip.TsEnd, &clip.Order); err != nil {
		return nil, err
	}

	return &clip, nil
}

const getByEditionId = `SELECT id, ts, ts_end, montage_order
FROM clips
WHERE edition_id = $1
ORDER BY montage_order`

func (r *Repo) GetClipsByEditionID(ctx context.Context, eid string) ([]*inmotion.Clip, error) {
	var clips []*inmotion.Clip

	rows, err := r.db.Query(ctx, getByEditionId, eid)
	defer rows.Close()

	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var clip inmotion.Clip
		_ = rows.Scan(&clip.ID, &clip.Ts, &clip.TsEnd, &clip.Order)
		clips = append(clips, &clip)
	}

	return clips, nil
}

const insertClip = `INSERT INTO clips (id, ts, ts_end, montage_order, edition_id)
VALUES ($1, $2, $3,(SELECT COALESCE(MAX(montage_order), -1)
FROM clips
WHERE edition_id = $4) + 1, $4)`

const getMontageOrder = `SELECT montage_order FROM clips WHERE id = $1`

func (r *Repo) CreateClip(ctx context.Context, input *inmotion.ClipInput) (*inmotion.Clip, error) {
	clip := &inmotion.Clip{
		ID:    uuid.NewV4().String(),
		Ts:    input.Ts,
		TsEnd: input.TsEnd,
	}
	if _, err := r.db.Exec(ctx, insertClip, clip.ID, input.Ts, input.TsEnd, input.Eid); err != nil {
		return nil, err
	}
	row := r.db.QueryRow(ctx, getMontageOrder, clip.ID)
	if err := row.Scan(&clip.Order); err != nil {
		return nil, err
	}
	return clip, nil
}

const updateHasPreview = `UPDATE clips SET has_previews = $1 WHERE id = $2`

func (r *Repo) SetClipHasPreview(ctx context.Context, id string, has bool) error {
	if _, err := r.db.Exec(ctx, updateHasPreview, has, id); err != nil {
		return err
	}

	return nil
}

const shiftMontageOrders = `
		UPDATE clips
		SET montage_order = montage_order + 1
		WHERE montage_order >= $2
			AND montage_order < (SELECT montage_order FROM clips WHERE id = $1)
`
const updateMontageOrder = `UPDATE clips SET montage_order = $2 WHERE id = $1`
const getClipEditionID = `SELECT edition_id FROM clips WHERE id = $1`

func (r *Repo) ReorderClips(ctx context.Context, id string, newIndex int64) ([]*inmotion.Clip, error) {
	batch := &pgx.Batch{}
	batch.Queue(shiftMontageOrders, id, newIndex)
	batch.Queue(updateMontageOrder, id, newIndex)
	batch.Queue(getClipEditionID, id)

	br := r.db.SendBatch(context.Background(), batch)
	defer br.Close()

	for i := 0; i < 2; i++ {
		_, err := br.Exec()
		if err != nil {
			return nil, err
		}
	}

	clip := inmotion.Clip{ID: id}
	if err := br.QueryRow().Scan(&clip.EditionID); err != nil {
		return nil, err
	}

	return r.GetClipsByEditionID(ctx, clip.EditionID)
}

const deleteClip = "DELETE FROM clips WHERE id = $1"

func (r *Repo) DeleteClip(ctx context.Context, id string) (bool, error) {
	if _, err := r.db.Exec(context.Background(), deleteClip, id); err != nil {
		return false, err
	}
	return true, nil
}
