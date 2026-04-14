-- ============================================================
-- FLOWBOARD — MIGRATION: WORKSPACE ACCESS & ASSIGNMENTS
-- Granting workspace members access to shared boards
-- ============================================================

-- 1. Redefine is_board_member to include Workspace Members (except for Private boards)
create or replace function is_board_member(b_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from board_members
    where board_id = b_id
      and user_id = auth.uid()
  ) or exists (
    select 1 from boards b
    join workspace_members wm on wm.workspace_id = b.workspace_id
    where b.id = b_id
      and wm.user_id = auth.uid()
      and b.visibility != 'PRIVATE'
  );
$$;

-- 2. Redefine is_board_admin to include Workspace Admins
create or replace function is_board_admin(b_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from board_members
    where board_id = b_id
      and user_id = auth.uid()
      and role = 'ADMIN'
  ) or exists (
    select 1 from boards b
    join workspace_members wm on wm.workspace_id = b.workspace_id
    where b.id = b_id
      and wm.user_id = auth.uid()
      and wm.role in ('OWNER', 'ADMIN')
      and b.visibility != 'PRIVATE'
  );
$$;

-- 3. Update board_members policy to allow admins to manage members across the workspace
drop policy if exists "board_members: admin manage" on board_members;
create policy "board_members: admin manage"
  on board_members for all
  using (
    exists (
      select 1 from boards b
      where b.id = board_members.board_id
        and is_workspace_admin(b.workspace_id)
    )
  );
