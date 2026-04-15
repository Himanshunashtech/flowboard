-- ============================================================
-- FLOWBOARD — MIGRATION: DELETE USER ACCOUNT
-- Description: Provides a secure function for users to delete their own account and all data.
-- ============================================================

create or replace function delete_user_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  -- Get the current user ID from the JWT
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- 1. Delete all workspaces owned by the user
  -- We set a session variable to allow the owner records to be deleted in triggers
  perform set_config('app.allow_owner_deletion', 'true', true);
  
  -- This will cascade to boards, lists, cards, etc. due to ON DELETE CASCADE
  delete from public.workspaces where owner_id = v_user_id;

  -- 2. Delete from auth.users
  -- This will automatically delete the record from public.profiles due to the profile's
  -- foreign key: id uuid primary key references auth.users(id) on delete cascade
  delete from auth.users where id = v_user_id;

end;
$$;

-- Grant access to the authenticated users
grant execute on function delete_user_account() to authenticated;
