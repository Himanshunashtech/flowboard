-- ============================================================
-- FLOWBOARD — MIGRATION 016: HEAL FRACTIONAL INDEXING
-- Resolving "invalid order key head: 0" by re-sequencing positions.
-- ============================================================

-- 1. HEAL LIST POSITIONS
-- We group by board_id and assign new valid lexicographical strings.
-- We use a pattern like 'a' + padded number which is valid FI.

WITH list_reorder AS (
  SELECT 
    id,
    'a' || LPAD((row_number() OVER (PARTITION BY board_id ORDER BY position, created_at))::text, 6, '0') as new_pos
  FROM public.lists
)
UPDATE public.lists
SET position = list_reorder.new_pos
FROM list_reorder
WHERE public.lists.id = list_reorder.id;

-- 2. HEAL CARD POSITIONS
-- We group by list_id and assign new valid lexicographical strings.

WITH card_reorder AS (
  SELECT 
    id,
    'a' || LPAD((row_number() OVER (PARTITION BY list_id ORDER BY position, created_at))::text, 6, '0') as new_pos
  FROM public.cards
)
UPDATE public.cards
SET position = card_reorder.new_pos
FROM card_reorder
WHERE public.cards.id = card_reorder.id;

-- 3. UPDATE DEFAULTS
-- Ensure future records start with a valid head.
ALTER TABLE public.lists ALTER COLUMN position SET DEFAULT 'a0';
ALTER TABLE public.cards ALTER COLUMN position SET DEFAULT 'a0';
