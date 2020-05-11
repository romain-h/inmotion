package storage

import "io"

type Writer struct {
	W io.Writer
}

func (w *Writer) WriteAt(p []byte, offset int64) (int, error) {
	// ignore 'offset' because we forced sequential downloads
	return w.W.Write(p)
}
