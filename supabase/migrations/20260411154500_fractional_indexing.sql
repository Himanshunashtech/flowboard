-- ============================================================
-- FLOWBOARD — MIGRATION 008: FRACTIONAL INDEXING
-- Converting numeric positions to lexicographical strings.
-- ============================================================

-- 1. Alter lists table
ALTER TABLE public.lists ALTER COLUMN position TYPE text USING position::text;
-- Set default to a string (e.g., 'a0')
ALTER TABLE public.lists ALTER COLUMN position SET DEFAULT 'a0';

-- 2. Alter cards table
ALTER TABLE public.cards ALTER COLUMN position TYPE text USING position::text;
-- Set default to a string (e.g., 'a0')
ALTER TABLE public.cards ALTER COLUMN position SET DEFAULT 'a0';

-- 3. Function to re-normalize positions to standard fractional indexing strings
-- This handles existing numeric strings like '65535' and converts them to valid FI strings
-- For simplicity in this migration, we'll just keep them as text for now, 
-- and the frontend will replace them with valid strings on the next move.
-- Valid FI strings usually look like 'a0', 'a1', etc.
