# Build the Go API
FROM golang:1.13-alpine AS builder
RUN apk add --no-cache --update make
ADD . /app
WORKDIR /app/server
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 APP=/video-server make build

FROM jrottenberg/ffmpeg:4.2-alpine as ffmpeg

# Final stage build, this will be the container
# that we will deploy to production
FROM alpine:3.11
RUN apk add --no-cache --update libgcc libstdc++ ca-certificates libgomp expat
COPY --from=ffmpeg /usr/local /usr/local
COPY --from=builder /video-server ./
RUN chmod +x ./video-server
EXPOSE 8080
CMD ./video-server
