-- Add location column to cards table
ALTER TABLE cards ADD COLUMN IF NOT EXISTS location JSONB DEFAULT NULL;

-- Add index for location search if needed (though jsonb search is usually ad-hoc)
CREATE INDEX IF NOT EXISTS idx_cards_location ON cards USING gin (location);
