-- ============================================================
-- FLOWBOARD — MIGRATION 010: EMAIL NOTIFICATION PIPELINE
-- Tracking email delivery for transaction notifications.
-- ============================================================

-- 1. Update notifications table to track email delivery
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS requires_email boolean DEFAULT false;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS email_sent_at timestamptz;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 2. Create a trigger to automatically mark some notifications as requiring email
-- For example: mentions or card assignments
create or replace function mark_notification_for_email()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.type in ('CARD_ASSIGNED', 'MENTIONED', 'DUE_DATE_REMINDER') then
    new.requires_email := true;
  end if;
  return new;
end;
$$;

create trigger tr_mark_notification_email
  before insert on public.notifications
  for each row execute function mark_notification_for_email();
