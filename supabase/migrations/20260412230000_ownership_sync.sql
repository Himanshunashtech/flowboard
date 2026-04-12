-- ============================================================
-- FLOWBOARD — MIGRATION: WORKSPACE OWNERSHIP SYNC
-- Ensures all workspace owners are granted membership permissions.
-- ============================================================

-- 1. Redefine workspace membership function for resilience
create or replace function is_workspace_member(ws_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id
      and user_id = auth.uid()
  ) or exists (
    select 1 from workspaces
    where id = ws_id
      and owner_id = auth.uid()
  );
$$;

-- 2. Redefine workspace admin function for resilience
create or replace function is_workspace_admin(ws_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id
      and user_id = auth.uid()
      and role in ('OWNER', 'ADMIN')
  ) or exists (
    select 1 from workspaces
    where id = ws_id
      and owner_id = auth.uid()
  );
$$;

-- 3. Backfill workspace_members for any missing owners
insert into workspace_members (workspace_id, user_id, role)
select id, owner_id, 'OWNER'::workspace_member_role
from workspaces
where not exists (
  select 1 from workspace_members
  where workspace_id = workspaces.id
    and user_id = workspaces.owner_id
)
on conflict do nothing;

-- 4. Re-grant permissions
grant execute on function is_workspace_member(uuid) to authenticated, anon;
grant execute on function is_workspace_admin(uuid) to authenticated, anon;
