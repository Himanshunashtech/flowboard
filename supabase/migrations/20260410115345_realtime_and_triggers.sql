-- ============================================================
-- FLOWBOARD — MIGRATION 003: REALTIME + DATABASE TRIGGERS
-- Run after 002_rls_policies.sql
-- ============================================================

-- ============================================================
-- REALTIME: Enable live updates for all relevant tables
-- ============================================================

-- Ensure the publication exists first (Supabase usually has it, but good to be safe)
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

-- Set the list of tables for Realtime (replaces existing list, making it idempotent)
alter publication supabase_realtime set table 
  boards,
  lists,
  cards,
  card_assignments,
  card_labels,
  card_watchers,
  card_dependencies,
  checklists,
  checklist_items,
  attachments,
  comments,
  custom_field_values,
  time_entries,
  sprints,
  notifications,
  activity_logs,
  automation_logs,
  workspace_members,
  board_members;

-- ============================================================
-- TRIGGER: Auto-create profile when a new user signs up
-- ============================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- ============================================================
-- TRIGGER: Auto-add board creator as ADMIN board member
--          and ensure they are a workspace member
-- ============================================================

create or replace function handle_board_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Add creator as board ADMIN
  insert into public.board_members (board_id, user_id, role)
  values (new.id, new.created_by, 'ADMIN')
  on conflict (board_id, user_id) do nothing;

  -- Ensure creator is a workspace member (ADMIN role minimum)
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.workspace_id, new.created_by, 'ADMIN')
  on conflict (workspace_id, user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_board_created on boards;
create trigger on_board_created
  after insert on boards
  for each row
  execute function handle_board_created();

-- ============================================================
-- TRIGGER: Auto-add workspace creator as OWNER workspace member
-- ============================================================

create or replace function handle_workspace_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'OWNER')
  on conflict (workspace_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_workspace_created on workspaces;
create trigger on_workspace_created
  after insert on workspaces
  for each row
  execute function handle_workspace_created();

-- ============================================================
-- TRIGGER: Log card moves to activity_logs automatically
-- ============================================================

create or replace function handle_card_moved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only log if the list changed
  if old.list_id is distinct from new.list_id then
    insert into public.activity_logs (
      workspace_id,
      board_id,
      card_id,
      user_id,
      action,
      metadata
    )
    select
      b.workspace_id,
      new.board_id,
      new.id,
      auth.uid(),
      'card.moved',
      jsonb_build_object(
        'from_list_id',    old.list_id,
        'to_list_id',      new.list_id,
        'from_list_title', (select title from lists where id = old.list_id),
        'to_list_title',   (select title from lists where id = new.list_id)
      )
    from boards b
    where b.id = new.board_id;
  end if;

  -- Log title changes
  if old.title is distinct from new.title then
    insert into public.activity_logs (
      workspace_id, board_id, card_id, user_id, action, metadata
    )
    select
      b.workspace_id,
      new.board_id,
      new.id,
      auth.uid(),
      'card.renamed',
      jsonb_build_object('old_title', old.title, 'new_title', new.title)
    from boards b
    where b.id = new.board_id;
  end if;

  -- Log due date changes
  if old.due_date is distinct from new.due_date then
    insert into public.activity_logs (
      workspace_id, board_id, card_id, user_id, action, metadata
    )
    select
      b.workspace_id,
      new.board_id,
      new.id,
      auth.uid(),
      'card.due_date_changed',
      jsonb_build_object('old_due_date', old.due_date, 'new_due_date', new.due_date)
    from boards b
    where b.id = new.board_id;
  end if;

  -- Log completion toggle
  if old.is_completed is distinct from new.is_completed then
    insert into public.activity_logs (
      workspace_id, board_id, card_id, user_id, action, metadata
    )
    select
      b.workspace_id,
      new.board_id,
      new.id,
      auth.uid(),
      case when new.is_completed then 'card.completed' else 'card.reopened' end,
      '{}'::jsonb
    from boards b
    where b.id = new.board_id;
  end if;

  -- Log archive/unarchive
  if old.is_archived is distinct from new.is_archived then
    insert into public.activity_logs (
      workspace_id, board_id, card_id, user_id, action, metadata
    )
    select
      b.workspace_id,
      new.board_id,
      new.id,
      auth.uid(),
      case when new.is_archived then 'card.archived' else 'card.unarchived' end,
      '{}'::jsonb
    from boards b
    where b.id = new.board_id;
  end if;

  -- Log priority changes
  if old.priority is distinct from new.priority then
    insert into public.activity_logs (
      workspace_id, board_id, card_id, user_id, action, metadata
    )
    select
      b.workspace_id,
      new.board_id,
      new.id,
      auth.uid(),
      'card.priority_changed',
      jsonb_build_object('old_priority', old.priority, 'new_priority', new.priority)
    from boards b
    where b.id = new.board_id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_card_updated on cards;
create trigger on_card_updated
  after update on cards
  for each row
  execute function handle_card_moved();

-- ============================================================
-- TRIGGER: Log card creation to activity_logs
-- ============================================================

create or replace function handle_card_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.activity_logs (
    workspace_id, board_id, card_id, user_id, action, metadata
  )
  select
    b.workspace_id,
    new.board_id,
    new.id,
    new.created_by,
    'card.created',
    jsonb_build_object(
      'title',     new.title,
      'list_id',   new.list_id,
      'list_title', (select title from lists where id = new.list_id)
    )
  from boards b
  where b.id = new.board_id;

  return new;
end;
$$;

drop trigger if exists on_card_created on cards;
create trigger on_card_created
  after insert on cards
  for each row
  execute function handle_card_created();

-- ============================================================
-- TRIGGER: Log assignment to activity_logs + send notification
-- ============================================================

create or replace function handle_card_assigned()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card        cards%rowtype;
  v_board       boards%rowtype;
  v_assigner    profiles%rowtype;
begin
  select * into v_card from cards where id = new.card_id;
  select * into v_board from boards where id = v_card.board_id;
  select * into v_assigner from profiles where id = coalesce(new.assigned_by, auth.uid());

  -- Activity log
  insert into public.activity_logs (
    workspace_id, board_id, card_id, user_id, action, metadata
  )
  values (
    v_board.workspace_id,
    v_card.board_id,
    v_card.id,
    coalesce(new.assigned_by, auth.uid()),
    'card.member_added',
    jsonb_build_object(
      'assignee_id',   new.user_id,
      'assigner_id',   new.assigned_by
    )
  );

  -- Notification for the assigned user (don't notify if they assigned themselves)
  if new.user_id != coalesce(new.assigned_by, auth.uid()) then
    insert into public.notifications (
      user_id, type, title, body, entity_type, entity_id, action_url
    )
    select
      new.user_id,
      'CARD_ASSIGNED',
      'You were assigned to: ' || v_card.title,
      coalesce(v_assigner.full_name, 'Someone') || ' assigned you to this card.',
      'CARD',
      v_card.id,
      '/app/' || (select slug from workspaces where id = v_board.workspace_id)
        || '/board/' || v_board.id || '?card=' || v_card.id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_card_assigned on card_assignments;
create trigger on_card_assigned
  after insert on card_assignments
  for each row
  execute function handle_card_assigned();

-- ============================================================
-- TRIGGER: Notify watchers when a comment is added
-- ============================================================

create or replace function handle_comment_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card     cards%rowtype;
  v_board    boards%rowtype;
  v_author   profiles%rowtype;
begin
  select * into v_card  from cards    where id = new.card_id;
  select * into v_board from boards   where id = v_card.board_id;
  select * into v_author from profiles where id = new.author_id;

  -- Activity log
  insert into public.activity_logs (
    workspace_id, board_id, card_id, user_id, action, metadata
  )
  values (
    v_board.workspace_id,
    v_card.board_id,
    v_card.id,
    new.author_id,
    'comment.created',
    jsonb_build_object('comment_id', new.id)
  );

  -- Notify all card watchers (except the commenter)
  insert into public.notifications (
    user_id, type, title, body, entity_type, entity_id, action_url
  )
  select
    cw.user_id,
    'COMMENT_ADDED',
    coalesce(v_author.full_name, 'Someone') || ' commented on: ' || v_card.title,
    coalesce(new.content_text, '(attachment or rich content)'),
    'COMMENT',
    new.id,
    '/app/' || (select slug from workspaces where id = v_board.workspace_id)
      || '/board/' || v_board.id || '?card=' || v_card.id
  from card_watchers cw
  where cw.card_id = new.card_id
    and cw.user_id != new.author_id;

  return new;
end;
$$;

drop trigger if exists on_comment_created on comments;
create trigger on_comment_created
  after insert on comments
  for each row
  execute function handle_comment_created();

-- ============================================================
-- TRIGGER: Auto-update updated_at timestamps
-- ============================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on profiles;
create trigger set_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists set_workspaces_updated_at on workspaces;
create trigger set_workspaces_updated_at
  before update on workspaces
  for each row execute function set_updated_at();

drop trigger if exists set_boards_updated_at on boards;
create trigger set_boards_updated_at
  before update on boards
  for each row execute function set_updated_at();

drop trigger if exists set_lists_updated_at on lists;
create trigger set_lists_updated_at
  before update on lists
  for each row execute function set_updated_at();

drop trigger if exists set_cards_updated_at on cards;
create trigger set_cards_updated_at
  before update on cards
  for each row execute function set_updated_at();

drop trigger if exists set_comments_updated_at on comments;
create trigger set_comments_updated_at
  before update on comments
  for each row execute function set_updated_at();

drop trigger if exists set_checklist_items_updated_at on checklist_items;
create trigger set_checklist_items_updated_at
  before update on checklist_items
  for each row execute function set_updated_at();

drop trigger if exists set_automations_updated_at on automations;
create trigger set_automations_updated_at
  before update on automations
  for each row execute function set_updated_at();

drop trigger if exists set_client_portals_updated_at on client_portals;
create trigger set_client_portals_updated_at
  before update on client_portals
  for each row execute function set_updated_at();

-- ============================================================
-- TRIGGER: Notify when checklist is 100% complete
-- ============================================================

create or replace function handle_checklist_item_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total     int;
  v_completed int;
  v_checklist checklists%rowtype;
  v_card      cards%rowtype;
begin
  -- Only act when item is marked complete
  if new.is_completed = false or old.is_completed = true then
    return new;
  end if;

  select * into v_checklist from checklists where id = new.checklist_id;
  select * into v_card from cards where id = v_checklist.card_id;

  select count(*) into v_total     from checklist_items where checklist_id = new.checklist_id;
  select count(*) into v_completed from checklist_items where checklist_id = new.checklist_id and is_completed = true;

  -- All items done → notify card watchers
  if v_total > 0 and v_completed = v_total then
    insert into public.notifications (
      user_id, type, title, body, entity_type, entity_id, action_url
    )
    select
      cw.user_id,
      'CHECKLIST_COMPLETED',
      'Checklist complete: ' || v_checklist.title,
      'All items in "' || v_checklist.title || '" on card "' || v_card.title || '" are done.',
      'CARD',
      v_card.id,
      '/app/board/' || v_card.board_id || '?card=' || v_card.id
    from card_watchers cw
    where cw.card_id = v_card.id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_checklist_item_completed on checklist_items;
create trigger on_checklist_item_completed
  after update of is_completed on checklist_items
  for each row
  execute function handle_checklist_item_completed();

-- ============================================================
-- TRIGGER: When dependency is resolved, notify blocked card owner
-- ============================================================

create or replace function handle_dependency_resolved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_blocked_card   cards%rowtype;
  v_blocking_card  cards%rowtype;
  v_board          boards%rowtype;
begin
  -- Trigger when the blocking card is marked complete
  if new.is_completed = false or old.is_completed = true then
    return new;
  end if;

  -- Find all cards that were blocked by this card
  for v_blocked_card in
    select c.*
    from cards c
    join card_dependencies d on d.blocked_card_id = c.id
    where d.blocking_card_id = new.id
  loop
    select * into v_board from boards where id = v_blocked_card.board_id;

    -- Notify assignees of the newly unblocked card
    insert into public.notifications (
      user_id, type, title, body, entity_type, entity_id, action_url
    )
    select
      ca.user_id,
      'DEPENDENCY_UNBLOCKED',
      'Card unblocked: ' || v_blocked_card.title,
      'A blocking dependency has been resolved. This card can now proceed.',
      'CARD',
      v_blocked_card.id,
      '/app/' || (select slug from workspaces where id = v_board.workspace_id)
        || '/board/' || v_board.id || '?card=' || v_blocked_card.id
    from card_assignments ca
    where ca.card_id = v_blocked_card.id;
  end loop;

  return new;
end;
$$;

drop trigger if exists on_card_completed_check_dependencies on cards;
create trigger on_card_completed_check_dependencies
  after update of is_completed on cards
  for each row
  execute function handle_dependency_resolved();
