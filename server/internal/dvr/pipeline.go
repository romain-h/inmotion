package dvr

import (
	"fmt"
	"io/ioutil"
	"os/exec"

	"github.com/romain-h/inmotion/internal/storage"
)

// TODO:
// 2 options here:
// - Fetch only beginning OR end of the file and detect moov atom from MP4. S3 client supports Range param
// http://atomicparsley.sourceforge.net/mpeg-4files.html
// https://rigor.com/blog/optimizing-mp4-video-for-fast-streaming
// https://stackoverflow.com/a/56963953/2259520
// - DL the entire file on disk and work from there. Pb: Ephemeral storage on Heroku + load..
func (dvr *DVR) MoveFastStart(vid string, tmpFile string) (*string, error) {
	file := fmt.Sprintf("/raw-videos/%s.mp4", vid)
	// args := []string{"-i", "pipe:0", "-c", "copy", "-movflags", "+faststart", "pipe:1"}
	args := []string{"-f", "mp4", "-i", "pipe:0", "-vcodec", "copy", "-f", "mp4", "-movflags", "frag_keyframe+empty_moov", "pipe:1"}
	err := dvr.storage.CmdPipe("ffmpeg", args, tmpFile, file)
	if err != nil {
		return nil, err
	}

	return &file, nil
}

func (dvr *DVR) GrabVideoMeta(vid, filePath string) (*string, error) {
	args := []string{
		"-i", "pipe:0",
		"-v", "quiet",
		"-print_format", "json", "-show_format", "-show_streams",
	}

	cmd := exec.Command("ffprobe", args...)
	stdin, _ := cmd.StdinPipe()
	stdout, _ := cmd.StdoutPipe()
	defer stdin.Close()
	err := cmd.Start()

	if err != nil {
		return nil, err
	}

	err = dvr.storage.GetFile(filePath, &storage.Writer{W: stdin})
	meta, _ := ioutil.ReadAll(stdout)

	errWait := cmd.Wait()
	if errWait != nil {
		return nil, errWait
	}

	metaString := string(meta)
	return &metaString, nil
}

func (dvr *DVR) ExtractAudio(vid, filePath string) (*string, error) {
	audioFilePath := fmt.Sprintf("/wav/%s.wav", vid)
	// args := []string{"-f", "mp4", "-i", "pipe:0", "-vn", "-acodec", "copy", "-f", "adts", "pipe:1"}
	args := []string{"-f", "mp4", "-i", "pipe:0",
		"-vn", "-acodec", "pcm_s16le", "-ac", "1", "-ar", "16000", "-af", "lowpass=3000,highpass=200",
		"-f", "wav", "pipe:1"}
	err := dvr.storage.CmdPipe("ffmpeg", args, filePath, audioFilePath)
	if err != nil {
		return nil, err
	}

	return &audioFilePath, nil
}
