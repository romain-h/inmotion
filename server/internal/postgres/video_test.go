package postgres

import (
	"context"
	"fmt"
	"testing"

	"github.com/romain-h/inmotion/internal/config"
)

type MockRepo struct{}

func TestGetVideo(t *testing.T) {
	db := &MockDB{}
	repo := Repo{db: db, cfg: config.Config{}}

	repo.GetVideo(context.Background(), "abc-2139")

	fmt.Println(db.CalledWith())
}
