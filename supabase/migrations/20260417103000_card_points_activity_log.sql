-- ============================================================
-- FLOWBOARD — MIGRATION: CARD POINTS ACTIVITY LOGGING
-- ============================================================

-- Update the card update trigger function to log story point changes
create or replace function handle_card_moved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Log list move
  if old.list_id is distinct from new.list_id then
    insert into public.activity_logs (
      workspace_id, board_id, card_id, user_id, action, metadata
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

  -- NEW: Log story point changes
  if old.story_points is distinct from new.story_points then
    insert into public.activity_logs (
      workspace_id, board_id, card_id, user_id, action, metadata
    )
    select
      b.workspace_id,
      new.board_id,
      new.id,
      auth.uid(),
      'card.points_changed',
      jsonb_build_object('old_points', old.story_points, 'new_points', new.story_points)
    from boards b
    where b.id = new.board_id;
  end if;

  return new;
end;
$$;
