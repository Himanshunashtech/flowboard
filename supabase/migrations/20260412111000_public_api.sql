-- ============================================================
-- PUBLIC API INFRASTRUCTURE
-- ============================================================

create table api_keys (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  name         text not null, -- e.g. "Zapier Integration"
  key_prefix   text not null, -- first 8 chars for display
  key_hash     text not null, -- hashed secret
  scopes       text[] not null default '{read:cards}',
  last_used_at timestamptz,
  expires_at   timestamptz,
  created_at   timestamptz default now(),
  unique(key_hash)
);

-- RLS
alter table api_keys enable row level security;

create policy "Users can manage their own API keys"
  on api_keys for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Index for fast lookup in Edge Functions
create index idx_api_keys_hash on api_keys (key_hash);
