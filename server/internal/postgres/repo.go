package postgres

import (
	"context"
	"log"

	"github.com/jackc/pgx/v4/pgxpool"

	"github.com/romain-h/inmotion/internal/config"
	"github.com/romain-h/inmotion/internal/inmotion"
)

type Repo struct {
	cfg config.Config
	db  SQLDB
}

func NewDBStore(cfg config.Config) inmotion.Repository {
	db, err := pgxpool.Connect(context.Background(), cfg.Database.URL)
	if err != nil {
		log.Fatal(err)
	}

	return &Repo{db: db, cfg: cfg}
}
