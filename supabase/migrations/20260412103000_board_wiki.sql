-- ============================================================
-- BOARD WIKI
-- ============================================================
create table board_wiki (
  id           uuid primary key default uuid_generate_v4(),
  board_id     uuid not null references boards(id) on delete cascade,
  content      jsonb not null default '{}'::jsonb, -- TipTap JSON
  content_text text, -- plain text for search
  last_edited_by uuid references profiles(id) on delete set null,
  updated_at   timestamptz default now(),
  unique(board_id)
);

-- RLS
alter table board_wiki enable row level security;

create policy "Users can view wiki if they can view board"
  on board_wiki for select
  using (
    exists (
      select 1 from boards 
      where boards.id = board_wiki.board_id 
      and (boards.visibility = 'PUBLIC' or exists (select 1 from board_members where board_id = boards.id and user_id = auth.uid()))
    )
  );

create policy "Users can update wiki if they are board members"
  on board_wiki for all
  using (
    exists (
      select 1 from board_members 
      where board_id = board_wiki.board_id 
      and user_id = auth.uid()
    )
  );

-- Trigger for updated_at
create trigger handle_wiki_updated_at before update on board_wiki
  for each row execute procedure moddatetime (updated_at);
