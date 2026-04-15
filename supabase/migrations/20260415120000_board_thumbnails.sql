-- Add thumbnail_url to boards table
-- This stores the representational image for the board card on the dashboard
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'boards' AND column_name = 'thumbnail_url'
    ) THEN
        ALTER TABLE boards ADD COLUMN thumbnail_url TEXT;
    END IF;
END $$;
