-- ============================================================
-- FLOWBOARD — MIGRATION 011: WEBHOOK TRIGGER FOR EMAILS
-- (Conceptual) Setting up the link to Supabase Edge Functions.
-- ============================================================

-- Note: To execute this in production, you would need to:
-- 1. Create a Supabase Edge Function called 'send-notification-email'.
-- 2. Pass the RESEND_API_KEY as a secret to that function.

/*
create trigger tr_send_email_on_notification
  after insert on public.notifications
  for each row
  when (new.requires_email = true)
  execute function supabase_functions.http_request(
    'http://localhost:54321/functions/v1/send-notification-email',
    'POST',
    '{"Content-Type":"application/json", "Authorization":"Bearer YOUR_ANON_KEY"}',
    json_build_object('notification_id', new.id)::text,
    '1000'
  );
*/

-- For now, we'll mark them as 'sent' immediately if they don't have a backend to process them.
-- Or we let the frontend 'poll' and send (for demo).

create or replace function simulate_email_sending()
returns trigger
language plpgsql
security definer
as $$
begin
  -- In a real app, the Edge Function would update this.
  -- For the 'team of 100' demo, we'll just log it.
  raise notice 'Notification requiring email created for user: %', new.user_id;
  return new;
end;
$$;
