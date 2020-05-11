package dvr

import (
	"fmt"
	"image"
	"image/color"
	"io/ioutil"
	"os"
	"os/exec"
	"strings"

	"github.com/disintegration/imaging"
	"github.com/romain-h/inmotion/internal/inmotion"
	"github.com/romain-h/inmotion/internal/storage"
)

func (dvr *DVR) GenerateClipThumbnails(video inmotion.Video, clip *inmotion.Clip) error {
	dir, err := ioutil.TempDir("", clip.ID)
	if err != nil {
		return err
	}
	defer os.RemoveAll(dir)

	outputs := dir + "/%03d.jpg"
	rate := 1 / ((*clip.TsEnd - *clip.Ts) / 3)

	args := []string{
		"-ss", fmt.Sprintf("%.2f", *clip.Ts),
		"-to", fmt.Sprintf("%.2f", *clip.TsEnd),
		"-i", "pipe:0",
		"-r", fmt.Sprintf("%.4f", rate),
		"-vf", "scale=-1:68", outputs}

	cmd := exec.Command("ffmpeg", args...)
	stdin, _ := cmd.StdinPipe()
	defer stdin.Close()

	err = cmd.Start()

	if err != nil {
		return err
	}

	err = dvr.storage.GetFile(video.Key, &storage.Writer{W: stdin})
	errWait := cmd.Wait()
	if errWait != nil {
		return errWait
	}

	img1, err := imaging.Open(dir + "/001.jpg")
	img2, err := imaging.Open(dir + "/002.jpg")
	img3, err := imaging.Open(dir + "/003.jpg")
	img4, err := imaging.Open(dir + "/004.jpg")
	img5, err := imaging.Open(dir + "/005.jpg")
	if err != nil {
		return err
	}
	total := img1.Bounds().Dx() + img2.Bounds().Dx() + img3.Bounds().Dx() + img4.Bounds().Dx() + img5.Bounds().Dx()
	dst := imaging.New(total, 68, color.NRGBA{0, 0, 0, 0})
	dst = imaging.Paste(dst, img1, image.Pt(0, 0))
	dst = imaging.Paste(dst, img2, image.Pt(img1.Bounds().Dx(), 0))
	dst = imaging.Paste(dst, img3, image.Pt(img1.Bounds().Dx()+img2.Bounds().Dx(), 0))
	dst = imaging.Paste(dst, img4, image.Pt(img1.Bounds().Dx()+img2.Bounds().Dx()+img3.Bounds().Dx(), 0))
	dst = imaging.Paste(dst, img5, image.Pt(img1.Bounds().Dx()+img2.Bounds().Dx()+img3.Bounds().Dx()+img4.Bounds().Dx(), 0))
	err = imaging.Save(dst, dir+"/out.jpg")

	file, _ := os.Open(dir + "/out.jpg")
	return dvr.storage.UploadFile(fmt.Sprintf("/clip-thumbnails/%s.jpg", clip.ID), file)
}

func (dvr *DVR) generateMainClip(video inmotion.Video, clip inmotion.Clip) error {
	clipPath := fmt.Sprintf("/clips/%s/main.mp4", clip.ID)

	// Here we do a copy therefore if we want to correctly set the moov at first we
	// need to use the +faststart that cannot be apply with a stream output. Therefore,
	// we need a tmp file on disk
	args := []string{
		"-ss", fmt.Sprintf("%.2f", *clip.Ts),
		"-to", fmt.Sprintf("%.2f", *clip.TsEnd),
		"-f", "mp4", "-i", "pipe:0",
		"-c:v", "copy", "-c:a", "copy",
		"-movflags", "+faststart",
		"-f", "mp4",
	}
	return dvr.storage.CmdPipeWithTmp("ffmpeg", args, video.Key, clipPath)
}

func (dvr *DVR) generatePart(video inmotion.Video, clip inmotion.Clip, filters []string, clipPath string) {
	args := []string{
		"-ss", fmt.Sprintf("%.2f", *clip.Ts),
		"-to", fmt.Sprintf("%.2f", *clip.TsEnd),
		"-f", "mp4", "-i", "pipe:0",
		"-filter_complex", strings.Join(filters, "; "),
		"-map", "[outv]", "-map", "[outa]",
		"-c:v", "libx264", "-c:a", "aac",
		"-s", fmt.Sprintf("%dx%d", *video.Width, *video.Height),
		"-bsf:v", "h264_mp4toannexb",
		"-f", "mpegts", "pipe:1",
	}

	dvr.storage.CmdPipe("ffmpeg", args, video.Key, clipPath)
}

func (dvr *DVR) GenerateClipVideos(video inmotion.Video, clip inmotion.Clip) error {
	duration := *clip.TsEnd - *clip.Ts

	go func() {
		dvr.generateMainClip(video, clip)
	}()

	delayDuration := blackTransitionDuration / 2 * 1000
	delay := fmt.Sprintf("%f", delayDuration)

	// TODO latest version of FFmpeg support adelay=delays=12s:all=1 instead of
	// specifying delay for each channel
	if *video.AudioChannelLayout == "stereo" {
		delay += fmt.Sprintf("|%f", delayDuration)
	}

	go func() {
		clipPath := fmt.Sprintf("/clips/%s/beg.ts", clip.ID)

		filters := []string{}
		filters = append(filters, fmt.Sprintf("color=black:%[1]dx%[2]d:d=%[3]f[blackOUT0]", *video.Width, *video.Height, blackTransitionDuration/2))
		filters = append(filters, fmt.Sprintf("[0:a]apad=pad_dur=%f[outa]", blackTransitionDuration/2))
		filters = append(filters, fmt.Sprintf("[0:v]setpts=PTS-STARTPTS, fade=out:st=%[1]f:d=%[2]f[v0Base]", duration-fadeDuration, fadeDuration))
		filters = append(filters, "[v0Base][blackOUT0]concat=n=2[outv]")

		dvr.generatePart(video, clip, filters, clipPath)
	}()

	go func() {
		clipPath := fmt.Sprintf("/clips/%s/end.ts", clip.ID)

		filters := []string{}
		filters = append(filters, fmt.Sprintf("color=black:%[1]dx%[2]d:d=%[3]f[blackOUT0]", *video.Width, *video.Height, blackTransitionDuration/2))
		filters = append(filters, fmt.Sprintf("[0:a]adelay=%s[outa]", delay))
		filters = append(filters, fmt.Sprintf("[0:v]setpts=PTS-STARTPTS, fade=in:st=0:d=%[1]f[v0Base]", fadeDuration))
		filters = append(filters, "[blackOUT0][v0Base]concat=n=2[outv]")

		dvr.generatePart(video, clip, filters, clipPath)
	}()

	go func() {
		clipPath := fmt.Sprintf("/clips/%s/mid.ts", clip.ID)

		filters := []string{}
		filters = append(filters, fmt.Sprintf("color=black:%[1]dx%[2]d:d=%[3]f,split=2[blackOUT0][blackOUT1]", *video.Width, *video.Height, blackTransitionDuration/2))
		filters = append(filters, fmt.Sprintf("[0:a]apad=pad_dur=%[1]f, adelay=%[2]s[outa]", blackTransitionDuration/2, delay))
		filters = append(filters, fmt.Sprintf("[0:v]setpts=PTS-STARTPTS, fade=in:st=0:d=%[1]f, fade=out:st=%[2]f:d=%[3]f [v0Base]", fadeDuration, duration-fadeDuration, fadeDuration))
		filters = append(filters, "[blackOUT0][v0Base][blackOUT1]concat=n=3[outv]")

		dvr.generatePart(video, clip, filters, clipPath)
	}()

	return nil
}

func (dvr *DVR) DeleteClipVideos(id string) error {
	return dvr.storage.DeleteFiles([]string{
		fmt.Sprintf("/clips/%s/main.mp4", id),
		fmt.Sprintf("/clips/%s/beg.ts", id),
		fmt.Sprintf("/clips/%s/mid.ts", id),
		fmt.Sprintf("/clips/%s/end.ts", id),
	})
}

func (dvr *DVR) GetClipThumbnailsURL(id string) (*string, error) {
	key := fmt.Sprintf("/clip-thumbnails/%s.jpg", id)
	return dvr.storage.GetURL(key, 45, nil)
}

func (dvr *DVR) DeleteClipThumbnails(id string) error {
	key := fmt.Sprintf("/clip-thumbnails/%s.jpg", id)
	return dvr.storage.DeleteFile(key)
}
