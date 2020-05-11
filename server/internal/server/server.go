package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/romain-h/inmotion/internal/auth"
	"github.com/romain-h/inmotion/internal/config"
	"github.com/romain-h/inmotion/internal/dvr"
	"github.com/romain-h/inmotion/internal/handlers"
	"github.com/romain-h/inmotion/internal/inmotion"
	"github.com/romain-h/inmotion/internal/postgres"
	"github.com/romain-h/inmotion/internal/storage"
	"github.com/romain-h/inmotion/internal/transcript"
	cors "github.com/rs/cors/wrapper/gin"
)

const TranscriptCallbackPath = "/api/transcript/callback"

type Server struct {
	Config     config.Config
	Repository inmotion.Repository
	Server     *gin.Engine
}

func forceSSL(cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		if cfg.Production {
			if c.Request.Header.Get("x-forwarded-proto") != "https" {
				sslURL := "https://" + c.Request.Host + c.Request.RequestURI
				c.Redirect(http.StatusTemporaryRedirect, sslURL)
				return
			}
		}

		c.Next()
	}
}

func New() *Server {
	cfg := config.New()
	repo := postgres.NewDBStore(*cfg)
	storage := storage.New(*cfg)
	rec := dvr.New(*cfg, storage)
	trans := transcript.New(*cfg, storage, TranscriptCallbackPath)
	r := gin.Default()

	s := &Server{
		Config:     *cfg,
		Repository: repo,
		Server:     r,
	}

	// CORS settings
	corsOpts := cors.Options{
		AllowedOrigins:   []string{cfg.ClientURL},
		AllowedMethods:   []string{"GET", "HEAD", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	}
	c := cors.New(corsOpts)
	r.Use(c)
	r.Use(forceSSL(*cfg))

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
	r.POST(TranscriptCallbackPath, transcript.PostTranscriptCallback(trans, s.Repository))

	// GraphQL
	handler := handlers.GraphqlHandler(corsOpts, rec, s.Repository, trans, storage)
	r.GET("/graphql", handler)
	r.POST("/graphql", auth.CheckJWT(), handler)

	if !cfg.Production {
		r.GET("/graphql/playground", handlers.PlaygroundHandler("/graphql"))
	}

	return s
}

func (s *Server) Run() {
	s.Server.Run()
}
