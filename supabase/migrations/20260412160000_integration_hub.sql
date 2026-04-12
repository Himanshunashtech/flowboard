-- ============================================================
-- FLOWBOARD — MIGRATION: INTEGRATION HUB BACKBONE
-- ============================================================

-- Enable pgcrypto for AES-256 token encryption
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
create type integration_service as enum (
  'SLACK', 'GITHUB', 'FIGMA', 'NOTION', 'ZENDESK', 
  'INTERCOM', 'GITLAB', 'DISCORD', 'JIRA', 'SENTRY', 
  'ZOOM', 'GOOGLE'
);

create type sync_direction as enum ('INBOUND', 'OUTBOUND', 'BIDIRECTIONAL');

-- ============================================================
-- INTEGRATED ACCOUNTS (OAuth Credentials)
-- ============================================================
create table integrated_accounts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  service      integration_service not null,
  external_id  text not null,         -- User's ID in the external service
  username     text,
  email        text,
  
  -- Encrypted OAuth tokens
  -- Expecting vault or app-level encryption key
  access_token  text not null,
  refresh_token text,
  expires_at    timestamptz,
  
  settings      jsonb default '{}'::jsonb,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  
  unique(user_id, service, external_id)
);

-- ============================================================
-- BOARD CONNECTIONS (Service Link to Board)
-- ============================================================
create table board_connections (
  id             uuid primary key default uuid_generate_v4(),
  board_id       uuid not null references boards(id) on delete cascade,
  account_id     uuid not null references integrated_accounts(id) on delete cascade,
  external_resource_id   text not null,  -- e.g., Slack Channel ID, GitHub Repo ID
  external_resource_name text,
  
  config         jsonb default '{
    "sync_direction": "BIDIRECTIONAL",
    "triggers": ["card.created", "card.moved", "comment.added"],
    "filter_list_id": null
  }'::jsonb,
  
  is_enabled     boolean default true,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  
  unique(board_id, account_id, external_resource_id)
);

-- ============================================================
-- EXTERNAL RESOURCE MAPPINGS (Card Links)
-- ============================================================
create table external_resource_mappings (
  id             uuid primary key default uuid_generate_v4(),
  card_id        uuid not null references cards(id) on delete cascade,
  connection_id  uuid not null references board_connections(id) on delete cascade,
  external_id    text not null,          -- e.g., Jira Issue Key, GitHub Issue Number
  external_url   text,
  metadata       jsonb default '{}'::jsonb,
  
  last_sync_at   timestamptz default now(),
  created_at     timestamptz default now(),
  
  unique(card_id, external_id)
);

-- ============================================================
-- INTEGRATION LOGS (Audit Trail)
-- ============================================================
create table integration_logs (
  id             uuid primary key default uuid_generate_v4(),
  connection_id  uuid references board_connections(id) on delete cascade,
  service        integration_service not null,
  direction      sync_direction not null,
  payload        jsonb,
  status         text not null,          -- 'SUCCESS', 'FAILED', 'PENDING'
  error_message  text,
  processed_at   timestamptz default now()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================

alter table integrated_accounts enable row level security;
alter table board_connections enable row level security;
alter table external_resource_mappings enable row level security;
alter table integration_logs enable row level security;

-- Integrated Accounts: Owner only
create policy "Users can view their own integrated accounts"
  on integrated_accounts for select
  using (auth.uid() = user_id);

-- Board Connections: Members of the board
create policy "Board members can view connections"
  on board_connections for select
  using (
    exists (
      select 1 from board_members 
      where board_id = board_connections.board_id 
      and user_id = auth.uid()
    )
  );

-- Integration Logs: Viewable by board members
create policy "Board members can view integration logs"
  on integration_logs for select
  using (
    exists (
      select 1 from board_connections bc
      join board_members bm on bm.board_id = bc.board_id
      where bc.id = integration_logs.connection_id
      and bm.user_id = auth.uid()
    )
  );

-- ============================================================
-- INDEXES for Performance
-- ============================================================
create index idx_int_acc_user on integrated_accounts(user_id);
create index idx_board_conn_board on board_connections(board_id);
create index idx_ext_map_card on external_resource_mappings(card_id);
create index idx_int_logs_conn on integration_logs(connection_id, processed_at desc);
