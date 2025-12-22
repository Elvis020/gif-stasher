-- Add title column to links table
-- This stores the tweet text as the GIF title

ALTER TABLE links ADD COLUMN IF NOT EXISTS title text;

-- Add a comment to document the column
COMMENT ON COLUMN links.title IS 'Tweet text used as the GIF title/name';
