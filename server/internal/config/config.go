package config

import (
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type database struct {
	URL string
}

type aws struct {
	AccessID         string
	BucketName       string
	DisableSSL       bool
	Region           string
	S3Endpoint       string
	S3ForcePathStyle bool
	SecretKey        string
}

type auth0 struct {
	Domain   string
	Audience string
}

type revAI struct {
	URL   string
	Token string
}

type Config struct {
	AWS        aws
	Auth0      auth0
	BaseURL    string
	ClientURL  string
	Database   database
	Production bool
	RevAI      revAI
}

func New() *Config {
	godotenv.Load()

	production := gin.Mode() == gin.ReleaseMode

	return &Config{
		AWS: aws{
			AccessID:         os.Getenv("AWS_ACCESS_KEY_ID"),
			BucketName:       os.Getenv("AWS_S3_BUCKET"),
			DisableSSL:       !production,
			Region:           os.Getenv("AWS_REGION"),
			S3Endpoint:       os.Getenv("AWS_S3_ENDPOINT"),
			S3ForcePathStyle: !production,
			SecretKey:        os.Getenv("AWS_SECRET_ACCESS_KEY"),
		},
		Auth0: auth0{
			Domain:   os.Getenv("AUTH0_DOMAIN"),
			Audience: os.Getenv("AUTH0_AUDIENCE"),
		},
		BaseURL:    os.Getenv("APP_URL"),
		ClientURL:  os.Getenv("CLIENT_URL"),
		Database:   database{URL: os.Getenv("DATABASE_URL")},
		Production: production,
		RevAI: revAI{
			URL:   "https://api.rev.ai",
			Token: os.Getenv("REVAI_TOKEN"),
		},
	}
}
