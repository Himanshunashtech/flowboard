-- ============================================================
-- SIMILARITY RECOMENDATIONS (AI-FREE)
-- ============================================================

-- 1. Ensure extension is enabled
create extension if not exists pg_trgm;

-- 2. Create GIN index for fast similarity matching
-- We combine title and description for a richer similarity feature set
create index if not exists idx_cards_similarity_engine on cards 
using gin ((title || ' ' || coalesce(description_text, '')) gin_trgm_ops);

-- 3. Create the recommendation function
create or replace function get_related_cards_deterministic(
  source_card_id uuid,
  p_board_id      uuid,
  match_limit     int default 5
)
returns table (
  id           uuid,
  title        text,
  list_id      uuid,
  list_title   text,
  similarity   float
)
language plpgsql stable
security definer
as $$
declare
  source_text text;
begin
  -- Get the source text for comparison
  select (title || ' ' || coalesce(description_text, ''))
  into source_text
  from cards
  where cards.id = source_card_id;

  return query
  select 
    c.id,
    c.title,
    c.list_id,
    l.title as list_title,
    word_similarity(source_text, (c.title || ' ' || coalesce(c.description_text, ''))) as similarity
  from cards c
  join lists l on l.id = c.list_id
  where c.board_id = p_board_id 
    and c.id != source_card_id
    and c.is_archived = false
    -- Minimum similarity threshold
    and (source_text % (c.title || ' ' || coalesce(c.description_text, '')))
    -- RLS Check: User must be a member of the board
    and exists (
      select 1 from board_members bm 
      where bm.board_id = p_board_id 
      and bm.user_id = auth.uid()
    )
  order by similarity desc
  limit match_limit;
end;
$$;
