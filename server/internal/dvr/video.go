package dvr

import "github.com/romain-h/inmotion/internal/inmotion"

func (dvr *DVR) GenerateVideoUploaderURL(video *inmotion.Video) (*string, error) {
	url, err := dvr.storage.GetPutURL(video.Key, video.MimeType)
	if err != nil {
		return nil, err
	}
	return url, nil
}
