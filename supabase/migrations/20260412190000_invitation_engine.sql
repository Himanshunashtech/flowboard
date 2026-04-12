-- ============================================================
-- FLOWBOARD — MIGRATION: INVITATION DISPATCH TRIGGER
-- ============================================================

-- Function to notify the Edge Function
create or replace function notify_invitation_created()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Call the Edge Function via Postgres HTTP
  -- Note: We use net.http_post if net extension is available, 
  -- or we can use a dedicated notification table if preferred.
  -- For this implementation, we will use a 'mail_queue' approach for higher reliability.
  
  insert into mail_queue (
    type,
    recipient,
    payload
  ) values (
    'WORKSPACE_INVITATION',
    new.email,
    jsonb_build_object(
      'invitation_id', new.id,
      'workspace_id', new.workspace_id,
      'token', new.token,
      'role', new.role,
      'invited_by', new.invited_by
    )
  );
  
  return new;
end;
$$;

-- Create mail_queue table if it doesn't exist
create table if not exists mail_queue (
  id           uuid primary key default uuid_generate_v4(),
  type         text not null,
  recipient    text not null,
  payload      jsonb not null,
  status       text default 'PENDING',
  attempts     int default 0,
  last_error   text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- RLS for mail_queue (System only)
alter table mail_queue enable row level security;

-- Trigger
drop trigger if exists on_invitation_created on workspace_invitations;
create trigger on_invitation_created
  after insert on workspace_invitations
  for each row execute function notify_invitation_created();
