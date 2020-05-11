package transcript

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"path"

	"github.com/romain-h/inmotion/internal/config"
	"github.com/romain-h/inmotion/internal/storage"
)

func JSONMarshal(t interface{}) ([]byte, error) {
	buffer := &bytes.Buffer{}
	encoder := json.NewEncoder(buffer)
	encoder.SetEscapeHTML(false)
	err := encoder.Encode(t)
	return buffer.Bytes(), err
}

type Manuscript struct {
	cfg          config.Config
	storage      storage.Storage
	callbackPath string
}

func (m *Manuscript) Submit(vid string, audioFilePath string) (*string, error) {
	audioFileURL, err := m.storage.GetURL(audioFilePath, 15, nil)
	if err != nil {
		return nil, err
	}

	callbackURL, _ := url.Parse(m.cfg.BaseURL)
	callbackURL.Path = path.Join(callbackURL.Path, m.callbackPath)
	payload := submitPayload{Media: *audioFileURL, Metadata: vid, Callback: callbackURL.String()}
	payloadJson, _ := JSONMarshal(payload)

	t := bytes.NewBuffer(payloadJson)

	u, _ := url.Parse(m.cfg.RevAI.URL)
	u.Path = path.Join(u.Path, "speechtotext/v1/jobs")

	req, err := http.NewRequest("POST", u.String(), t)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", m.cfg.RevAI.Token))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		var r job
		json.NewDecoder(resp.Body).Decode(&r)
		return &r.ID, nil
	} else {
		return nil, errors.New("Bad request..")
	}
}

func (m *Manuscript) Get(j job) (*string, error) {
	u, _ := url.Parse(m.cfg.RevAI.URL)
	u.Path = path.Join(u.Path, "speechtotext/v1/jobs", j.ID, "transcript")

	req, err := http.NewRequest("GET", u.String(), nil)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", m.cfg.RevAI.Token))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", RevAIMime)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	bodyStr := string(body)
	if resp.StatusCode == 200 {
		return &bodyStr, nil
	} else {
		return nil, errors.New("Transcript.Get Error")
	}
}

func New(cfg config.Config, storage storage.Storage, path string) Transcripter {
	return &Manuscript{cfg: cfg, storage: storage, callbackPath: path}
}
