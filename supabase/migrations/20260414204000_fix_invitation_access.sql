-- ============================================================
-- FLOWBOARD — MIGRATION: FIX INVITATION PUBLIC ACCESS (V2)
-- Allows looking up invitations and joining via Secure RPC
-- ============================================================

-- 1. Allow public select on workspace_invitations for preview
drop policy if exists "workspace_invitations: public read" on workspace_invitations;
create policy "workspace_invitations: public read"
  on workspace_invitations for select
  to anon, authenticated
  using (accepted_at is null and expires_at > now());

-- 2. Allow public select on workspaces for invitation preview
drop policy if exists "workspaces: invitation preview read" on workspaces;
create policy "workspaces: invitation preview read"
  on workspaces for select
  to anon, authenticated
  using (
    id in (
      select workspace_id 
      from workspace_invitations 
      where accepted_at is null 
        and expires_at > now()
    )
  );

-- 3. Allow public select on profiles for inviter preview
drop policy if exists "profiles: inviter preview read" on profiles;
create policy "profiles: inviter preview read"
  on profiles for select
  to anon, authenticated
  using (
    id in (
      select invited_by 
      from workspace_invitations 
      where accepted_at is null 
        and expires_at > now()
    )
  );

-- 4. SECURE JOIN FUNCTION
-- This function handles the joining process in a single transaction
-- bypassing RLS restrictions by using 'security definer'.
create or replace function join_workspace_via_invitation(invite_token text)
returns json
language plpgsql
security definer
as $$
declare
  invite_record record;
  current_user_id uuid;
begin
  -- Get current user
  current_user_id := auth.uid();
  
  if current_user_id is null then
    return json_build_object('success', false, 'error', 'Authentication required');
  end if;

  -- 1. Find the invitation
  select * into invite_record
  from workspace_invitations
  where token = invite_token
    and accepted_at is null
    and expires_at > now();

  if not found then
    return json_build_object('success', false, 'error', 'Invalid or expired invitation');
  end if;

  -- 2. Add member to workspace
  -- We use security definer to bypass the 'admin only' policy on workspace_members
  insert into workspace_members (workspace_id, user_id, role)
  values (invite_record.workspace_id, current_user_id, invite_record.role)
  on conflict (workspace_id, user_id) do nothing;

  -- 3. Mark invitation as accepted
  update workspace_invitations
  set accepted_at = now()
  where id = invite_record.id;

  return json_build_object('success', true, 'workspace_id', invite_record.workspace_id);
end;
$$;
