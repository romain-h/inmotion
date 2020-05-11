package dvr

import (
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"strings"
	"sync"

	"github.com/romain-h/inmotion/internal/inmotion"
)

func (dvr *DVR) GeneratePreview(editionID string, clips []*inmotion.Clip) (*string, error) {
	// Case where one we can return the clip straight away:
	if len(clips) == 1 {
		mainClipKey := fmt.Sprintf("/clips/%s/main.mp4", clips[0].ID)
		if err := dvr.storage.WaitUntilFileExists(mainClipKey); err != nil {
			return nil, err
		}
		return &mainClipKey, nil
	}

	dir, _ := ioutil.TempDir("", editionID)
	defer os.RemoveAll(dir)

	concat := "concat:"
	intFiles := []string{}
	wg := sync.WaitGroup{}
	wg.Add(len(clips))

	// Collect all clips parts and store to disk.
	for i, c := range clips {
		var input string
		var output string
		if i == 0 {
			input = fmt.Sprintf("/clips/%s/beg.ts", c.ID)
			output = fmt.Sprintf("/%s.ts", c.ID)
		} else if i == len(clips)-1 {
			input = fmt.Sprintf("/clips/%s/end.ts", c.ID)
			output = fmt.Sprintf("/%s.ts", c.ID)
		} else {
			input = fmt.Sprintf("/clips/%s/mid.ts", c.ID)
			output = fmt.Sprintf("/%s.ts", c.ID)
		}
		intFiles = append(intFiles, dir+output)

		go func() {
			f, err := os.Create(dir + output)
			if err != nil {
				fmt.Println("cannot create file", err)
			}
			defer f.Close()
			defer wg.Done()
			// Wait for the file to be there before to continue
			err = dvr.storage.GetFileUntilExists(input, f)
			if err != nil {
				fmt.Println(err)
			}
		}()
	}

	previewKey := fmt.Sprintf("/previews/%s.mp4", editionID)
	outputFile := dir + "/output.mp4"
	wg.Wait()

	args := []string{
		"-i", concat + strings.Join(intFiles, "|"),
		"-c", "copy",
		"-bsf:a", "aac_adtstoasc",
		"-f", "mp4", outputFile,
	}

	cmd := exec.Command("ffmpeg", args...)
	cmd.Run()

	file, _ := os.Open(outputFile)
	defer file.Close()
	err := dvr.storage.UploadFile(previewKey, file)
	if err != nil {
		return nil, err
	}
	return &previewKey, nil
}
