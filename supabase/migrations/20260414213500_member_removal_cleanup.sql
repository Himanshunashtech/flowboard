-- ============================================================
-- FLOWBOARD — MIGRATION: MEMBER REMOVAL CLEANUP
-- Automatically purges access to all boards and cards when a 
-- member is removed from a workspace.
-- ============================================================

-- 1. Create the cleanup function
create or replace function handle_workspace_member_removal()
returns trigger
language plpgsql
security definer
as $$
begin
  -- STRIKE RULE: Prevent deletion of the owner
  if OLD.role = 'OWNER' then
    raise exception 'CRITICAL: The Workspace Owner cannot be terminated.';
  end if;

  -- Remove user from all boards in this workspace
  delete from board_members
  where user_id = OLD.user_id
    and board_id in (
      select id from boards 
      where workspace_id = OLD.workspace_id
    );

  -- Remove board stars for this user in this workspace
  delete from board_stars
  where user_id = OLD.user_id
    and board_id in (
      select id from boards 
      where workspace_id = OLD.workspace_id
    );

  -- Remove card assignments for this user in this workspace
  delete from card_assignments
  where user_id = OLD.user_id
    and card_id in (
      select c.id 
      from cards c
      join boards b on b.id = c.board_id
      where b.workspace_id = OLD.workspace_id
    );

  -- Remove card watchers
  delete from card_watchers
  where user_id = OLD.user_id
    and card_id in (
      select c.id 
      from cards c
      join boards b on b.id = c.board_id
      where b.workspace_id = OLD.workspace_id
    );

  return OLD;
end;
$$;

-- 2. Attach the trigger to workspace_members
drop trigger if exists on_workspace_member_removed on workspace_members;
create trigger on_workspace_member_removed
  after delete on workspace_members
  for each row
  execute function handle_workspace_member_removal();
