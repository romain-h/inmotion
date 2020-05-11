package transcript

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/romain-h/inmotion/internal/inmotion"
)

func PostTranscriptCallback(t Transcripter, repo inmotion.Repository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var job transcriptCallbackBody
		if err := c.ShouldBindJSON(&job); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if job.Job.Status == "transcribed" {
			go func() {
				transcript, err := t.Get(job.Job)
				if err != nil {
					fmt.Println(err)
				}

				if err = repo.UpdateVideoTranscript(c, job.Job.Metadata, *transcript); err != nil {
					fmt.Println(err)
				}
			}()
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	}
}
