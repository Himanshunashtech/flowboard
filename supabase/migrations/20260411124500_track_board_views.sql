-- ============================================================
-- FLOWBOARD — MIGRATION 012: TRACK BOARD VIEWS
-- Add a last_viewed_at column to track navigation history
-- ============================================================

-- 1. Add column to boards table
ALTER TABLE boards 
ADD COLUMN last_viewed_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Create index for fast sorting in Dashboard
CREATE INDEX idx_boards_last_viewed ON boards(last_viewed_at DESC);

-- 3. Backfill existing boards (already has default NOW(), but explicitly set for clarity)
UPDATE boards SET last_viewed_at = NOW() WHERE last_viewed_at IS NULL;
