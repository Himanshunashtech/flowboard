-- ============================================================
-- RBAC HARDENING
-- ============================================================

-- Helper helper for cleaner policies
create or replace function card_id_to_board_id(c_id uuid)
returns uuid language sql stable as $$
  select board_id from cards where id = c_id;
$$;

-- 1. HARDEN LABELS
drop policy if exists "labels: board member access" on labels;
create policy "labels: board member read"
  on labels for select
  using (
    is_board_member(board_id)
    or exists (select 1 from boards where id = board_id and visibility = 'PUBLIC')
  );
create policy "labels: board edit access"
  on labels for all
  using (get_board_role(board_id) in ('ADMIN', 'MEMBER'))
  with check (get_board_role(board_id) in ('ADMIN', 'MEMBER'));

-- 2. HARDEN LISTS
drop policy if exists "lists: board member update" on lists;
create policy "lists: board member update"
  on lists for update
  using (get_board_role(board_id) in ('ADMIN', 'MEMBER'));

-- 3. HARDEN CARDS
drop policy if exists "cards: board member insert" on cards;
create policy "cards: board member insert"
  on cards for insert
  with check (
    get_board_role(board_id) in ('ADMIN', 'MEMBER')
    and created_by = auth.uid()
  );

drop policy if exists "cards: board member update" on cards;
create policy "cards: board member update"
  on cards for update
  using (get_board_role(board_id) in ('ADMIN', 'MEMBER'));

-- 4. HARDEN CHECKLISTS & ITEMS
drop policy if exists "checklists: board member access" on checklists;
create policy "checklists: board member read"
  on checklists for select
  using (is_board_member(card_id_to_board_id(card_id)));

create policy "checklists: board member edit"
  on checklists for all
  using (get_board_role(card_id_to_board_id(card_id)) in ('ADMIN', 'MEMBER'))
  with check (get_board_role(card_id_to_board_id(card_id)) in ('ADMIN', 'MEMBER'));

-- 5. HARDEN COMMENTS (Observers can read but not post/edit)
drop policy if exists "comments: board member insert" on comments;
create policy "comments: board member insert"
  on comments for insert
  with check (
    author_id = auth.uid()
    and get_board_role(card_id_to_board_id(card_id)) in ('ADMIN', 'MEMBER')
  );

-- 6. SECURITY LOGGING TABLE
create table security_logs (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references profiles(id),
  action       text not null,
  resource     text,
  resource_id  uuid,
  metadata     jsonb,
  ip_address   inet,
  created_at   timestamptz default now()
);

alter table security_logs enable row level security;
create policy "Admins can view security logs"
  on security_logs for select
  using (exists (select 1 from workspace_members where user_id = auth.uid() and role = 'OWNER'));
