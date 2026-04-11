-- ============================================================
-- FLOWBOARD — CONSOLIDATED POWER MECHANICS MIGRATION
-- Objective: Universal schema upgrade for Lexicographical Sorting,
-- Automation Triggers, and Email Delivery tracking.
-- ============================================================

-- 1. UPGRADE POSITION COLUMNS (Fractional Indexing)
ALTER TABLE public.lists ALTER COLUMN position TYPE text;
ALTER TABLE public.cards ALTER COLUMN position TYPE text;

-- 2. AUTOMATION ENGINE EXPANSION
create or replace function execute_automation_action(
  p_automation_id uuid,
  p_card_id       uuid,
  p_action        jsonb
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_action_type text;
  v_config      jsonb;
begin
  v_action_type := p_action->>'type';
  v_config      := p_action->'config';

  case v_action_type
    when 'ADD_COMMENT' then
      insert into comments (card_id, author_id, content_text)
      values (p_card_id, (v_config->>'author_id')::uuid, v_config->>'text');

    when 'SET_COMPLETED' then
      update cards set is_completed = (v_config->>'is_completed')::boolean where id = p_card_id;

    when 'MOVE_TO_LIST' then
      update cards set list_id = (v_config->>'list_id')::uuid where id = p_card_id;

    when 'ARCHIVE' then
      update cards set is_archived = true where id = p_card_id;

    else
      return false;
  end case;
  return true;
end;
$$;

-- 3. EMAIL NOTIFICATION PIPELINE
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS requires_email boolean DEFAULT false;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS email_sent_at timestamptz;

create or replace function mark_notification_for_email()
returns trigger
language plpgsql
as $$
begin
  if new.type in ('CARD_ASSIGNED', 'MENTIONED', 'DUE_DATE_REMINDER') then
    new.requires_email := true;
  end if;
  return new;
end;
$$;

DROP TRIGGER IF EXISTS tr_mark_notification_email ON public.notifications;
create trigger tr_mark_notification_email
  before insert on public.notifications
  for each row execute function mark_notification_for_email();
