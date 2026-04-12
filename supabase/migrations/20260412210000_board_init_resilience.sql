-- ============================================================
-- FLOWBOARD — MIGRATION: BOARD INITIALIZATION RESILIENCE
-- Resolves race conditions between triggers and frontend inserts
-- ============================================================

-- 1. Redefine is_board_member to be more robust? No, it's fine.
-- Instead, we update the INSERT policies for lists and cards.

-- 2. Allow Board Creators to insert lists immediately
drop policy if exists "lists: board member insert" on lists;
create policy "lists: board member insert"
  on lists for insert
  with check (
    is_board_member(board_id)
    or (select created_by from boards where id = board_id) = auth.uid()
  );

-- 3. Allow Board Creators to insert cards immediately
drop policy if exists "cards: board member insert" on cards;
create policy "cards: board member insert"
  on cards for insert
  with check (
    is_board_member(board_id)
    or (select created_by from boards where id = board_id) = auth.uid()
  );

-- 4. Ensure creator can also read their own boards even if trigger lags
drop policy if exists "boards: workspace read" on boards;
create policy "boards: workspace read"
  on boards for select
  using (
    is_workspace_member(workspace_id)
    and (
      visibility != 'PRIVATE'
      or is_board_member(id)
      or created_by = auth.uid()
    )
  );
