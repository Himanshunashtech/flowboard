-- ============================================================
-- FLOWBOARD — MIGRATION: RECURRENCE SUPPORT
-- ============================================================

-- 1. Add recurrence fields to cards
alter table public.cards 
add column if not exists recurrence_rule jsonb,
add column if not exists next_recurrence_at timestamptz;

-- 2. Add helpful comment
comment on column public.cards.recurrence_rule is 'JSON object defining recurrence frequency (e.g. { "type": "DAILY", "interval": 1 })';

-- 3. Create index for the worker query
create index if not exists idx_cards_next_recurrence on public.cards(next_recurrence_at) 
where next_recurrence_at is not null;
