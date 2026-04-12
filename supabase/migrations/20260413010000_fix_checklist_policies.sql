-- ============================================================
-- FIX CHECKLIST POLICIES & HELPER SECURITY
-- ============================================================

-- 1. Upgrade card_id_to_board_id to security definer
-- This allows the function to see the board_id even during a policy check
-- where the user might not have full SELECT permissions on the cards table yet.
create or replace function public.card_id_to_board_id(c_id uuid)
returns uuid 
language sql 
security definer 
stable 
as $$
  select board_id from public.cards where id = c_id;
$$;

-- 2. Refresh Checklists policies
drop policy if exists "checklists: board member read" on checklists;
drop policy if exists "checklists: board member edit" on checklists;

create policy "checklists: board member read"
  on checklists for select
  using (is_board_member(card_id_to_board_id(card_id)));

create policy "checklists: board member edit"
  on checklists for all
  using (get_board_role(card_id_to_board_id(card_id)) in ('ADMIN', 'MEMBER'))
  with check (get_board_role(card_id_to_board_id(card_id)) in ('ADMIN', 'MEMBER'));

-- 3. Refresh Checklist Items policies 
drop policy if exists "checklist_items: board member access" on checklist_items;
drop policy if exists "checklist_items: board member read" on checklist_items;
drop policy if exists "checklist_items: board member edit" on checklist_items;

-- Helper for checklist_items
create or replace function public.checklist_id_to_board_id(cl_id uuid)
returns uuid 
language sql 
security definer 
stable 
as $$
  select c.board_id 
  from public.checklists ch
  join public.cards c on ch.card_id = c.id
  where ch.id = cl_id;
$$;

create policy "checklist_items: board member read"
  on checklist_items for select
  using (is_board_member(checklist_id_to_board_id(checklist_id)));

create policy "checklist_items: board member edit"
  on checklist_items for all
  using (get_board_role(checklist_id_to_board_id(checklist_id)) in ('ADMIN', 'MEMBER'))
  with check (get_board_role(checklist_id_to_board_id(checklist_id)) in ('ADMIN', 'MEMBER'));
