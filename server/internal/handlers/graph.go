package handlers

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/romain-h/inmotion/internal/auth"
	"github.com/romain-h/inmotion/internal/dvr"
	"github.com/romain-h/inmotion/internal/gqlgen"
	"github.com/romain-h/inmotion/internal/inmotion"
	"github.com/romain-h/inmotion/internal/storage"
	"github.com/romain-h/inmotion/internal/transcript"
	"github.com/rs/cors"
)

// Same as default server set by gqlgen
// Customization on Websocket Upgrader to support CORS
func NewServer(es graphql.ExecutableSchema, corsOpts cors.Options) *handler.Server {
	srv := handler.New(es)

	srv.AddTransport(transport.Websocket{
		KeepAlivePingInterval: 10 * time.Second,
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				origin := r.Header.Get("Origin")
				origin = strings.ToLower(origin)

				for _, o := range corsOpts.AllowedOrigins {
					if o == origin {
						return true
					}
				}
				return false
			},
		},

		InitFunc: func(ctx context.Context, initPayload transport.InitPayload) (context.Context, error) {
			token := initPayload["authToken"]
			if token == nil {
				return ctx, errors.New("Unauthorized")
			}
			parsedToken, err := auth.ParseAndValidateJWT(token.(string))
			if err != nil {
				return ctx, errors.New("Unauthorized")
			}
			authCtx := auth.SetUserContext(ctx, *parsedToken)
			return authCtx, nil
		},
	})
	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})
	srv.AddTransport(transport.MultipartForm{})

	srv.SetQueryCache(lru.New(1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New(100),
	})

	return srv
}

// GraphqlHandler defines the GQLGen GraphQL server handler
func GraphqlHandler(corsOpts cors.Options, dvr dvr.Recorder, repo inmotion.Repository, transcript transcript.Transcripter, storage storage.Storage) gin.HandlerFunc {
	// NewExecutableSchema and Config are in the generated.go file
	c := gqlgen.Config{
		Resolvers: &gqlgen.Resolver{
			DVR:           dvr,
			Repository:    repo,
			Storage:       storage,
			Transcript:    transcript,
			PreviewBroker: make(map[string]chan *gqlgen.Preview),
		},
	}

	h := NewServer(gqlgen.NewExecutableSchema(c), corsOpts)

	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}

// PlaygroundHandler defines a handler to expose the Playground
func PlaygroundHandler(path string) gin.HandlerFunc {
	h := playground.Handler("Go GraphQL Server", path)

	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}
