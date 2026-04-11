-- ============================================================
-- FLOWBOARD — MIGRATION 004: SCHEDULED JOBS (pg_cron)
-- Run after 003_realtime_triggers.sql
-- ============================================================

-- Enable required extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ============================================================
-- HELPER: Mark cards as overdue (runs in-DB, no HTTP call needed)
-- This handles the actual DB work; the Edge Function sends emails
-- ============================================================

create or replace function mark_overdue_and_notify()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Create CARD_OVERDUE notifications for newly overdue cards
  -- (cards that are past due, not completed, not archived, and haven't been notified in the past 24h)
  insert into public.notifications (
    user_id, type, title, body, entity_type, entity_id, action_url
  )
  select
    ca.user_id,
    'CARD_OVERDUE',
    'Overdue: ' || c.title,
    'This card was due on ' || to_char(c.due_date at time zone 'UTC', 'Mon DD, YYYY')
      || ' and is still open.',
    'CARD',
    c.id,
    '/app/' || w.slug || '/board/' || c.board_id || '?card=' || c.id
  from cards c
  join card_assignments ca on ca.card_id = c.id
  join boards b on b.id = c.board_id
  join workspaces w on w.id = b.workspace_id
  where c.due_date < now()
    and c.is_completed = false
    and c.is_archived = false
    -- Don't re-notify if already notified within 24 hours
    and not exists (
      select 1
      from notifications n
      where n.entity_id = c.id
        and n.type = 'CARD_OVERDUE'
        and n.user_id = ca.user_id
        and n.created_at > now() - interval '24 hours'
    );
end;
$$;

-- ============================================================
-- HELPER: Create DUE_SOON notifications (24h before due date)
-- ============================================================

create or replace function notify_due_soon()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (
    user_id, type, title, body, entity_type, entity_id, action_url
  )
  select
    ca.user_id,
    'CARD_DUE_SOON',
    'Due tomorrow: ' || c.title,
    'This card is due on ' || to_char(c.due_date at time zone 'UTC', 'Mon DD')
      || '. Make sure it''s on track.',
    'CARD',
    c.id,
    '/app/' || w.slug || '/board/' || c.board_id || '?card=' || c.id
  from cards c
  join card_assignments ca on ca.card_id = c.id
  join boards b on b.id = c.board_id
  join workspaces w on w.id = b.workspace_id
  where c.due_date >= now()
    and c.due_date <  now() + interval '25 hours'
    and c.is_completed = false
    and c.is_archived = false
    -- Only notify once per card per user per due-date window
    and not exists (
      select 1
      from notifications n
      where n.entity_id = c.id
        and n.type = 'CARD_DUE_SOON'
        and n.user_id = ca.user_id
        and n.created_at > now() - interval '24 hours'
    );
end;
$$;

-- ============================================================
-- SCHEDULED JOB 1: Due-date notifications — runs every hour
-- ============================================================

select cron.schedule(
  'flowboard-due-date-reminders',
  '0 * * * *',
  $$
    -- In-DB notifications (instant)
    select notify_due_soon();
    select mark_overdue_and_notify();

    -- Trigger Edge Function to also send emails
    select net.http_post(
      url     := current_setting('app.settings.edge_function_url', true)
                   || '/due-date-reminders',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body    := '{}'::jsonb
    );
  $$
);

-- ============================================================
-- SCHEDULED JOB 2: Weekly AI digest — every Sunday at 8am UTC
-- ============================================================

select cron.schedule(
  'flowboard-weekly-digest',
  '0 8 * * 0',
  $$
    select net.http_post(
      url     := current_setting('app.settings.edge_function_url', true)
                   || '/weekly-digest',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body    := '{}'::jsonb
    );
  $$
);

-- ============================================================
-- SCHEDULED JOB 3: Daily overdue sweep — midnight UTC
-- ============================================================

select cron.schedule(
  'flowboard-daily-overdue',
  '0 0 * * *',
  $$
    select mark_overdue_and_notify();
  $$
);

-- ============================================================
-- SCHEDULED JOB 4: Cleanup old read notifications (> 90 days)
-- ============================================================

select cron.schedule(
  'flowboard-cleanup-notifications',
  '0 3 * * *',
  $$
    delete from notifications
    where is_read = true
      and created_at < now() - interval '90 days';

    delete from activity_logs
    where created_at < now() - interval '180 days';

    delete from automation_logs
    where triggered_at < now() - interval '90 days';
  $$
);

-- ============================================================
-- SCHEDULED JOB 5: Sprint status transitions — runs every day at 1am UTC
-- ============================================================

select cron.schedule(
  'flowboard-sprint-transitions',
  '0 1 * * *',
  $$
    -- Auto-start planned sprints whose start_date has passed
    update sprints
    set status = 'ACTIVE'
    where status = 'PLANNED'
      and start_date <= current_date;

    -- Auto-complete active sprints whose end_date has passed
    with completed_sprints as (
      update sprints
      set status = 'COMPLETED'
      where status = 'ACTIVE'
        and end_date < current_date
      returning id, board_id, name
    )
    -- Notify board admins of completed sprints
    insert into notifications (user_id, type, title, body, entity_type, entity_id, action_url)
    select
      bm.user_id,
      'SPRINT_COMPLETED',
      'Sprint completed: ' || cs.name,
      'Your sprint "' || cs.name || '" has ended. Review the results.',
      'BOARD',
      cs.board_id,
      '/app/board/' || cs.board_id || '?view=dashboard'
    from completed_sprints cs
    join board_members bm on bm.board_id = cs.board_id and bm.role = 'ADMIN';
  $$
);
