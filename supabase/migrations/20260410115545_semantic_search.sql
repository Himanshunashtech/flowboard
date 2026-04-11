-- ============================================================
-- FLOWBOARD — MIGRATION 006: PGVECTOR SEMANTIC SEARCH
-- Run after 005_storage_buckets.sql
-- ============================================================

-- Enable required extension
create extension if not exists vector;

-- ============================================================
-- MAIN SEMANTIC SEARCH FUNCTION
-- Called from the ai-semantic-search Edge Function
-- ============================================================

create or replace function search_cards_semantic(
  query_embedding  vector(1536),
  board_id_filter  uuid            default null,
  workspace_id_filter uuid         default null,
  match_threshold  float           default 0.70,
  match_count      int             default 10
)
returns table (
  id            uuid,
  title         text,
  description_text text,
  list_id       uuid,
  board_id      uuid,
  priority      card_priority,
  due_date      timestamptz,
  is_completed  boolean,
  is_archived   boolean,
  similarity    float
)
language sql stable
security definer
as $$
  select
    c.id,
    c.title,
    c.description_text,
    c.list_id,
    c.board_id,
    c.priority,
    c.due_date,
    c.is_completed,
    c.is_archived,
    1 - (c.embedding <=> query_embedding) as similarity
  from cards c
  where
    -- Scope filter: board or workspace
    (
      (board_id_filter is not null and c.board_id = board_id_filter)
      or
      (workspace_id_filter is not null and c.board_id in (
        select id from boards where workspace_id = workspace_id_filter
      ))
    )
    -- Must have an embedding
    and c.embedding is not null
    -- Must not be archived
    and c.is_archived = false
    -- Minimum similarity threshold
    and 1 - (c.embedding <=> query_embedding) > match_threshold
    -- RLS: caller must be a board member
    and exists (
      select 1 from board_members bm
      where bm.board_id = c.board_id
        and bm.user_id = auth.uid()
    )
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================================
-- FULL-TEXT SEARCH FUNCTION (keyword fallback)
-- Used when no embedding is available or for hybrid search
-- ============================================================

create or replace function search_cards_fulltext(
  search_query     text,
  board_id_filter  uuid  default null,
  workspace_id_filter uuid default null,
  match_count      int   default 20
)
returns table (
  id            uuid,
  title         text,
  description_text text,
  list_id       uuid,
  board_id      uuid,
  priority      card_priority,
  due_date      timestamptz,
  is_completed  boolean,
  rank          float
)
language sql stable
security definer
as $$
  select
    c.id,
    c.title,
    c.description_text,
    c.list_id,
    c.board_id,
    c.priority,
    c.due_date,
    c.is_completed,
    ts_rank(
      to_tsvector('english', c.title || ' ' || coalesce(c.description_text, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  from cards c
  where
    (
      (board_id_filter is not null and c.board_id = board_id_filter)
      or
      (workspace_id_filter is not null and c.board_id in (
        select id from boards where workspace_id = workspace_id_filter
      ))
    )
    and c.is_archived = false
    and to_tsvector('english', c.title || ' ' || coalesce(c.description_text, ''))
        @@ plainto_tsquery('english', search_query)
    and exists (
      select 1 from board_members bm
      where bm.board_id = c.board_id
        and bm.user_id = auth.uid()
    )
  order by rank desc
  limit match_count;
$$;

-- ============================================================
-- HYBRID SEARCH FUNCTION (semantic + keyword combined)
-- Uses Reciprocal Rank Fusion (RRF) to merge result sets
-- ============================================================

create or replace function search_cards_hybrid(
  search_query     text,
  query_embedding  vector(1536),
  board_id_filter  uuid  default null,
  workspace_id_filter uuid default null,
  match_count      int   default 10,
  rrf_k            int   default 60
)
returns table (
  id            uuid,
  title         text,
  description_text text,
  list_id       uuid,
  board_id      uuid,
  priority      card_priority,
  due_date      timestamptz,
  is_completed  boolean,
  combined_score float
)
language sql stable
security definer
as $$
  with semantic_results as (
    select
      id,
      row_number() over (order by embedding <=> query_embedding) as semantic_rank
    from cards
    where
      (
        (board_id_filter is not null and board_id = board_id_filter)
        or
        (workspace_id_filter is not null and board_id in (
          select id from boards where workspace_id = workspace_id_filter
        ))
      )
      and embedding is not null
      and is_archived = false
      and 1 - (embedding <=> query_embedding) > 0.5
      and exists (
        select 1 from board_members bm
        where bm.board_id = cards.board_id and bm.user_id = auth.uid()
      )
    order by embedding <=> query_embedding
    limit 50
  ),
  fulltext_results as (
    select
      id,
      row_number() over (
        order by ts_rank(
          to_tsvector('english', title || ' ' || coalesce(description_text, '')),
          plainto_tsquery('english', search_query)
        ) desc
      ) as text_rank
    from cards
    where
      (
        (board_id_filter is not null and board_id = board_id_filter)
        or
        (workspace_id_filter is not null and board_id in (
          select id from boards where workspace_id = workspace_id_filter
        ))
      )
      and is_archived = false
      and to_tsvector('english', title || ' ' || coalesce(description_text, ''))
          @@ plainto_tsquery('english', search_query)
      and exists (
        select 1 from board_members bm
        where bm.board_id = cards.board_id and bm.user_id = auth.uid()
      )
    limit 50
  ),
  combined as (
    select
      coalesce(s.id, f.id) as id,
      coalesce(1.0 / (rrf_k + s.semantic_rank), 0)
        + coalesce(1.0 / (rrf_k + f.text_rank), 0) as combined_score
    from semantic_results s
    full outer join fulltext_results f on f.id = s.id
  )
  select
    c.id,
    c.title,
    c.description_text,
    c.list_id,
    c.board_id,
    c.priority,
    c.due_date,
    c.is_completed,
    combined.combined_score
  from combined
  join cards c on c.id = combined.id
  order by combined.combined_score desc
  limit match_count;
$$;

-- ============================================================
-- FUNCTION: Get cards similar to a given card (for recommendations)
-- ============================================================

create or replace function get_similar_cards(
  source_card_id   uuid,
  match_threshold  float  default 0.75,
  match_count      int    default 5
)
returns table (
  id         uuid,
  title      text,
  list_id    uuid,
  board_id   uuid,
  similarity float
)
language sql stable
security definer
as $$
  select
    c.id,
    c.title,
    c.list_id,
    c.board_id,
    1 - (c.embedding <=> source.embedding) as similarity
  from cards c
  cross join (
    select embedding, board_id from cards where id = source_card_id
  ) source
  where c.id != source_card_id
    and c.board_id = source.board_id
    and c.embedding is not null
    and c.is_archived = false
    and 1 - (c.embedding <=> source.embedding) > match_threshold
    and exists (
      select 1 from board_members bm
      where bm.board_id = c.board_id
        and bm.user_id = auth.uid()
    )
  order by c.embedding <=> source.embedding
  limit match_count;
$$;

-- ============================================================
-- FUNCTION: Board summary stats (used by AI assistant)
-- ============================================================

create or replace function get_board_summary(p_board_id uuid)
returns jsonb
language sql stable
security definer
as $$
  select jsonb_build_object(
    'total_cards',       count(*),
    'completed_cards',   count(*) filter (where is_completed = true),
    'archived_cards',    count(*) filter (where is_archived = true),
    'overdue_cards',     count(*) filter (where due_date < now() and is_completed = false),
    'due_today',         count(*) filter (
                           where due_date::date = current_date and is_completed = false
                         ),
    'no_assignee',       count(*) filter (
                           where not exists (
                             select 1 from card_assignments ca where ca.card_id = cards.id
                           )
                         ),
    'by_priority', jsonb_build_object(
      'CRITICAL', count(*) filter (where priority = 'CRITICAL' and is_archived = false),
      'HIGH',     count(*) filter (where priority = 'HIGH'     and is_archived = false),
      'MEDIUM',   count(*) filter (where priority = 'MEDIUM'   and is_archived = false),
      'LOW',      count(*) filter (where priority = 'LOW'      and is_archived = false),
      'NONE',     count(*) filter (where priority = 'NONE'     and is_archived = false)
    )
  )
  from cards
  where board_id = p_board_id
    and is_archived = false;
$$;

-- ============================================================
-- FUNCTION: Member workload summary (used by AI workload balancer)
-- ============================================================

create or replace function get_member_workload(p_board_id uuid)
returns table (
  user_id          uuid,
  full_name        text,
  avatar_url       text,
  card_count       bigint,
  completed_count  bigint,
  overdue_count    bigint,
  total_estimated_hours float,
  open_card_titles text[]
)
language sql stable
security definer
as $$
  select
    p.id as user_id,
    p.full_name,
    p.avatar_url,
    count(c.id) as card_count,
    count(c.id) filter (where c.is_completed = true) as completed_count,
    count(c.id) filter (where c.due_date < now() and c.is_completed = false) as overdue_count,
    coalesce(sum(c.estimated_hours) filter (where c.is_completed = false), 0) as total_estimated_hours,
    array_agg(c.title order by c.due_date nulls last)
      filter (where c.is_completed = false and c.is_archived = false) as open_card_titles
  from profiles p
  join board_members bm on bm.user_id = p.id and bm.board_id = p_board_id
  left join card_assignments ca on ca.user_id = p.id
  left join cards c on c.id = ca.card_id and c.board_id = p_board_id and c.is_archived = false
  group by p.id, p.full_name, p.avatar_url;
$$;
