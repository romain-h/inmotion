package main

import (
	"github.com/romain-h/inmotion/internal/server"
)

func main() {
	server.New().Run() // listen and serve on 0.0.0.0:8080
}
