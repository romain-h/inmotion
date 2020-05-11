CREATE TABLE IF NOT EXISTS video_transcript_jobs (
  video_id UUID REFERENCES "videos" (id) ON DELETE CASCADE,
  transcript_job_id TEXT NOT NULL
);
