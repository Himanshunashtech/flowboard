-- ============================================================
-- FLOWBOARD — MIGRATION: FIX INVITATION PUBLIC ACCESS (V2)
-- Allows looking up invitations and joining via Secure RPC
-- ============================================================

-- 1. SECURE PREVIEW FUNCTION
-- Returns workspace and inviter details ONLY if a valid token is provided.
-- This replaces the broad RLS policies that were leaking data.
create or replace function get_invitation_details(invite_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result record;
begin
  select 
    vi.email,
    vi.role,
    vi.expires_at,
    vi.accepted_at,
    w.name as workspace_name,
    w.logo_url as workspace_logo,
    p.full_name as inviter_name,
    p.avatar_url as inviter_avatar
  into result
  from workspace_invitations vi
  join workspaces w on w.id = vi.workspace_id
  join profiles p on p.id = vi.invited_by
  where vi.token = invite_token;

  if not found then
    return json_build_object('success', false, 'error', 'Invalid or expired invitation');
  end if;

  return json_build_object(
    'success', true,
    'invitation', json_build_object(
        'email', result.email,
        'role', result.role,
        'expires_at', result.expires_at,
        'accepted_at', result.accepted_at,
        'workspaces', json_build_object('name', result.workspace_name, 'logo_url', result.workspace_logo),
        'profiles', json_build_object('full_name', result.inviter_name, 'avatar_url', result.inviter_avatar)
    )
  );
end;
$$;

-- 2. Cleanup leaky policies
drop policy if exists "workspace_invitations: public read" on workspace_invitations;
drop policy if exists "workspaces: invitation preview read" on workspaces;
drop policy if exists "profiles: inviter preview read" on profiles;

-- 3. Add secure identity-based policy for invitations
-- Users can see invitations sent to their confirmed email
drop policy if exists "workspace_invitations: view own" on workspace_invitations;
create policy "workspace_invitations: view own"
  on workspace_invitations for select
  to authenticated
  using (email = (select email from profiles where id = auth.uid()));

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
