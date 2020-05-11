package storage

import (
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	awsS3 "github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/romain-h/inmotion/internal/config"
)

type Storage interface {
	GetURL(string, int, *string) (*string, error)
	GetPutURL(string, string) (*string, error)
	GetContentSize(string) (*int64, error)
	IsUploaded(string, int64) (bool, error)
	GetFile(string, io.WriterAt) error
	GetFileUntilExists(string, io.WriterAt) error
	UploadFile(string, io.Reader) error
	DeleteFile(string) error
	DeleteFiles([]string) error
	CmdPipe(string, []string, string, string) error
	CmdPipeWithTmp(string, []string, string, string) error
	WaitUntilFileExists(string) error
}

type s3 struct {
	cfg     config.Config
	client  *awsS3.S3
	session *session.Session
}

func (s3 *s3) GetURL(objectName string, min int, contentDisposition *string) (*string, error) {
	req, _ := s3.client.GetObjectRequest(&awsS3.GetObjectInput{
		Bucket:                     aws.String(s3.cfg.AWS.BucketName),
		Key:                        aws.String(objectName),
		ResponseContentDisposition: contentDisposition,
	})

	urlStr, err := req.Presign(45 * time.Minute)
	if err != nil {
		return nil, err
	}
	return &urlStr, nil
}

func (s3 *s3) GetPutURL(objectName string, objectType string) (*string, error) {
	req, _ := s3.client.PutObjectRequest(&awsS3.PutObjectInput{
		Bucket:      aws.String(s3.cfg.AWS.BucketName),
		Key:         aws.String(objectName),
		ContentType: aws.String(objectType),
	})

	// Send the request to touch the file on S3
	req.Send()

	req, _ = s3.client.PutObjectRequest(&awsS3.PutObjectInput{
		Bucket:      aws.String(s3.cfg.AWS.BucketName),
		Key:         aws.String(objectName),
		ContentType: aws.String(objectType),
	})
	urlStr, err := req.Presign(45 * time.Minute)
	if err != nil {
		return nil, err
	}
	return &urlStr, nil
}

func (s3 *s3) GetContentSize(objectName string) (*int64, error) {
	req, err := s3.client.HeadObject(&awsS3.HeadObjectInput{
		Bucket: aws.String(s3.cfg.AWS.BucketName),
		Key:    aws.String(objectName),
	})
	if err != nil {
		return nil, err
	}
	return req.ContentLength, nil
}

func (s3 *s3) IsUploaded(objectName string, fileSize int64) (bool, error) {
	size, err := s3.GetContentSize(objectName)
	if err != nil {
		return false, err
	}
	return *size == fileSize, nil
}

func (s3 *s3) GetFile(objectName string, content io.WriterAt) error {
	downloader := s3manager.NewDownloader(s3.session)
	downloader.Concurrency = 1

	// Write the contents of S3 Object to the file
	_, err := downloader.Download(content, &awsS3.GetObjectInput{
		Bucket: aws.String(s3.cfg.AWS.BucketName),
		Key:    aws.String(objectName),
	})

	return err
}

func (s3 *s3) WaitUntilFileExists(objectName string) error {
	return s3.client.WaitUntilObjectExists(&awsS3.HeadObjectInput{
		Bucket: aws.String(s3.cfg.AWS.BucketName),
		Key:    aws.String(objectName),
	})
}

func (s3 *s3) GetFileUntilExists(objectName string, content io.WriterAt) error {
	if err := s3.WaitUntilFileExists(objectName); err != nil {
		return err
	}
	return s3.GetFile(objectName, content)
}

func (s3 *s3) UploadFile(objectName string, content io.Reader) error {
	uploader := s3manager.NewUploaderWithClient(s3.client)
	upParams := &s3manager.UploadInput{
		Bucket: aws.String(s3.cfg.AWS.BucketName),
		Key:    aws.String(objectName),
		Body:   content,
	}

	// Perform an upload.
	if _, err := uploader.Upload(upParams); err != nil {
		return err
	}
	return nil
}

func (s3 *s3) DeleteFile(objectName string) error {
	_, err := s3.client.DeleteObject(&awsS3.DeleteObjectInput{
		Bucket: aws.String(s3.cfg.AWS.BucketName),
		Key:    aws.String(objectName),
	})
	if err != nil {
		return err
	}

	if err := s3.client.WaitUntilObjectNotExists(&awsS3.HeadObjectInput{
		Bucket: aws.String(s3.cfg.AWS.BucketName),
		Key:    aws.String(objectName),
	}); err != nil {
		return err
	}
	return nil
}

func (s3 *s3) DeleteFiles(names []string) error {
	var objects []*awsS3.ObjectIdentifier

	for _, n := range names {
		objects = append(objects, &awsS3.ObjectIdentifier{Key: aws.String(n)})
	}
	_, err := s3.client.DeleteObjects(&awsS3.DeleteObjectsInput{
		Bucket: aws.String(s3.cfg.AWS.BucketName),
		Delete: &awsS3.Delete{Objects: objects},
	})
	return err
}

func (s3 *s3) CmdPipeWithTmp(cmdName string, cmdArgs []string, inputFile string, outputFile string) error {
	dir, _ := ioutil.TempDir("", "cmdPipeWithTmp")
	defer os.RemoveAll(dir)
	mainFile := dir + "/out.mp4"

	args := append(cmdArgs, mainFile)
	cmd := exec.Command(cmdName, args...)
	stdin, _ := cmd.StdinPipe()
	defer stdin.Close()

	err := cmd.Start()
	if err != nil {
		fmt.Println(err)
	}

	err = s3.GetFile(inputFile, &Writer{W: stdin})
	errWait := cmd.Wait()
	if errWait != nil {
		return errWait
	}
	file, _ := os.Open(mainFile)
	defer file.Close()
	return s3.UploadFile(outputFile, file)
}

// Run command as pipe between S3 download an S3 upload.
// Similar to CLI:
// `aws s3 cp s3://inputFile - | COMMAND | aws s3 cp - s3://outputFile`
func (s3 *s3) CmdPipe(cmdName string, cmdArgs []string, inputFile string, outputFile string) error {
	cmd := exec.Command(cmdName, cmdArgs...)
	stdin, _ := cmd.StdinPipe()
	stdout, _ := cmd.StdoutPipe()
	err := cmd.Start()

	if err != nil {
		return err
	}

	wg := sync.WaitGroup{}
	wg.Add(2)
	go func() {
		defer stdin.Close()
		defer wg.Done()
		s3.GetFile(inputFile, &Writer{W: stdin})
	}()

	go func() {
		defer wg.Done()
		s3.UploadFile(outputFile, &Reader{R: stdout})
	}()

	wg.Wait()
	errWait := cmd.Wait()
	if errWait != nil {
		return errWait
	}
	return nil
}

func New(cfg config.Config) Storage {
	sess := session.Must(session.NewSession(&aws.Config{
		Credentials:      credentials.NewStaticCredentials(cfg.AWS.AccessID, cfg.AWS.SecretKey, ""),
		DisableSSL:       aws.Bool(cfg.AWS.DisableSSL),
		S3ForcePathStyle: aws.Bool(cfg.AWS.S3ForcePathStyle),
		Endpoint:         aws.String(cfg.AWS.S3Endpoint),
	}))

	return &s3{
		cfg:     cfg,
		client:  awsS3.New(sess),
		session: sess,
	}
}
