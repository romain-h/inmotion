package storage

import "io"

type Reader struct {
	R io.Reader
}

func (r *Reader) Read(p []byte) (int, error) {
	return r.R.Read(p)
}
