-- ============================================================
-- FLOWBOARD — MIGRATION: FIX BOARD UPDATE PERMISSIONS
-- Ensures board creators and workspace admins can always update board settings.
-- ============================================================

-- 1. Redefine is_board_admin to be more resilient (fallback to created_by)
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
    select 1 from boards
    where id = b_id
      and created_by = auth.uid()
  );
$$;

-- 2. Update the UPDATE policy for boards to be more inclusive
-- We allow board admins (now includes creators) and workspace admins
drop policy if exists "boards: board admin update" on boards;
create policy "boards: board admin update"
  on boards for update
  using (
    is_board_admin(id) 
    or is_workspace_admin(workspace_id)
  );

-- 3. Ensure SELECT visibility also respects the expanded definition
-- (Already handled by created_by = auth.uid() in existing select policies, but good for consistency)
