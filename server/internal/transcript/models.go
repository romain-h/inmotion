package transcript

const RevAIMime = "application/vnd.rev.transcript.v1.0+json"

type Transcripter interface {
	Submit(string, string) (*string, error)
	Get(job) (*string, error)
}

type submitPayload struct {
	Callback string `json:"callback_url"`
	Media    string `json:"media_url"`
	Metadata string `json:"metadata"`
}

type job struct {
	ID       string `json:"id"`
	Status   string `json:"status"`
	Metadata string `json:"metadata"`
}

type transcriptCallbackBody struct {
	Job job `json:"job"`
}
