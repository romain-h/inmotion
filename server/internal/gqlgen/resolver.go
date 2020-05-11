// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.
package gqlgen

import (
	"sync"

	"github.com/romain-h/inmotion/internal/dvr"
	"github.com/romain-h/inmotion/internal/inmotion"
	"github.com/romain-h/inmotion/internal/storage"
	"github.com/romain-h/inmotion/internal/transcript"
)

type Resolver struct {
	DVR           dvr.Recorder
	Storage       storage.Storage
	Repository    inmotion.Repository
	Transcript    transcript.Transcripter
	PreviewBroker map[string]chan *Preview
	mu            sync.Mutex
}
