-- ============================================================
-- FLOWBOARD — MIGRATION: BOARD SECURITY HARDENING
-- Ensuring team members can only update assigned board data
-- ============================================================

-- 1. Revert helpers to strict board-member checks
create or replace function is_board_member(b_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from board_members
    where board_id = b_id
      and user_id = auth.uid()
  );
$$;

create or replace function is_board_admin(b_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from board_members
    where board_id = b_id
      and user_id = auth.uid()
      and role = 'ADMIN'
  );
$$;

-- 2. Update SELECT policies for visibility (Read-only for workspace members)
-- Boards SELECT is already handled in rls_policies.sql (allows workspace members)

-- Lists SELECT: allow workspace members if board is not private
drop policy if exists "lists: board member read" on lists;
create policy "lists: workspace member read"
  on lists for select
  using (
    is_board_member(board_id)
    or exists (
      select 1 from boards b
      where b.id = board_id 
        and is_workspace_member(b.workspace_id)
        and b.visibility != 'PRIVATE'
    )
  );

-- Cards SELECT: allow workspace members if board is not private
drop policy if exists "cards: board member read" on cards;
create policy "cards: workspace member read"
  on cards for select
  using (
    is_board_member(board_id)
    or exists (
      select 1 from boards b
      where b.id = board_id 
        and is_workspace_member(b.workspace_id)
        and b.visibility != 'PRIVATE'
    )
  );

-- Labels SELECT: allow workspace members if board is not private
drop policy if exists "labels: board member read" on labels;
create policy "labels: workspace member read"
  on labels for select
  using (
    is_board_member(board_id)
    or exists (
      select 1 from boards b
      where b.id = board_id 
        and is_workspace_member(b.workspace_id)
        and b.visibility != 'PRIVATE'
    )
  );

-- 3. Ensure INSERT/UPDATE/DELETE are strictly for board members
-- The existing hardened policies already call get_board_role() which checks board_members table.
-- We must ensure INSERT for lists is also hardened.

drop policy if exists "lists: board member insert" on lists;
create policy "lists: board member insert"
  on lists for insert
  with check (get_board_role(board_id) in ('ADMIN', 'MEMBER'));

-- Delete policies for cards & lists
drop policy if exists "cards: admin or creator delete" on cards;
create policy "cards: admin or creator delete"
  on cards for delete
  using (is_board_admin(board_id) or (created_by = auth.uid() and is_board_member(board_id)));

drop policy if exists "lists: board admin delete" on lists;
create policy "lists: board admin delete"
  on lists for delete
  using (is_board_admin(board_id));
