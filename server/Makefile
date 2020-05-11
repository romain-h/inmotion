APP?=video-server


.PHONY: build
## build: build the application
build:
	@echo "Building..."
	@go build -o ${APP} cmd/video-server/main.go

.PHONY: run
## run: runs go run main.go
run:
	go run -race cmd/video-server/main.go

.PHONY: test
## test: runs go test with default values
test:
	go test -v -count=1 -race ./...

.PHONY: generate-gql
generate-gql:
	@printf "\nRegenerating gqlgen files\n"
	@go run -v github.com/99designs/gqlgen
	@printf "\nDone.\n\n"

.PHONY: db-migrate
db-migrate:
	@printf "Migrating DB\n"
	@migrate -database ${DATABASE_URL} -path internal/postgres/migrations up
	@printf "\nDone.\n\n"

.PHONY: setup
## setup: setup go modules
setup:
	@go mod init \
		&& go mod tidy \
		&& go mod vendor

.PHONY: help
## help: Prints this help message
help:
	@echo "Usage: \n"
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' |  sed -e 's/^/ /'
