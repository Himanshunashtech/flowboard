-- ============================================================
-- FLOWBOARD — MIGRATION 001: INITIAL SCHEMA
-- Run this first in your Supabase SQL editor
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";        -- AI semantic search
create extension if not exists "pg_trgm";       -- fuzzy text search

-- ============================================================
-- ENUMS
-- ============================================================
create type workspace_plan as enum ('FREE', 'PRO', 'BUSINESS', 'ENTERPRISE');
create type workspace_member_role as enum ('OWNER', 'ADMIN', 'MEMBER', 'GUEST', 'CLIENT');
create type board_visibility as enum ('WORKSPACE', 'PRIVATE', 'PUBLIC');
create type background_type as enum ('COLOR', 'IMAGE', 'GRADIENT');
create type board_member_role as enum ('ADMIN', 'MEMBER', 'OBSERVER');
create type card_priority as enum ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
create type dependency_type as enum (
  'FINISH_TO_START',
  'START_TO_START',
  'FINISH_TO_FINISH',
  'START_TO_FINISH'
);
create type custom_field_type as enum (
  'TEXT', 'NUMBER', 'DATE', 'DROPDOWN', 'CHECKBOX', 'URL', 'MEMBER', 'RATING'
);
create type notification_type as enum (
  'CARD_ASSIGNED',
  'CARD_DUE_SOON',
  'CARD_OVERDUE',
  'COMMENT_ADDED',
  'MENTION',
  'BOARD_INVITATION',
  'CHECKLIST_COMPLETED',
  'DEPENDENCY_UNBLOCKED',
  'AUTOMATION_TRIGGERED',
  'WEEKLY_DIGEST',
  'SPRINT_STARTED',
  'SPRINT_COMPLETED',
  'MEMBER_ADDED'
);
create type sprint_status as enum ('PLANNED', 'ACTIVE', 'COMPLETED');
create type automation_trigger_type as enum (
  'CARD_CREATED',
  'CARD_MOVED_TO_LIST',
  'CARD_MOVED_FROM_LIST',
  'CARD_DUE_DATE_SET',
  'CARD_DUE_DATE_PASSES',
  'CARD_DUE_IN_N_DAYS',
  'CHECKLIST_COMPLETED',
  'LABEL_ADDED',
  'LABEL_REMOVED',
  'MEMBER_ASSIGNED',
  'MEMBER_REMOVED',
  'COMMENT_ADDED',
  'CUSTOM_FIELD_CHANGED',
  'CARD_ARCHIVED',
  'SCHEDULE_DAILY',
  'SCHEDULE_WEEKLY',
  'DEPENDENCY_RESOLVED'
);
create type cover_type as enum ('NONE', 'COLOR', 'IMAGE');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table profiles (
  id                        uuid primary key references auth.users(id) on delete cascade,
  email                     text unique not null,
  full_name                 text,
  avatar_url                text,
  timezone                  text default 'UTC',
  notification_preferences  jsonb default '{
    "card_assigned": {"in_app": true, "email": true},
    "card_due_soon": {"in_app": true, "email": true},
    "comment_added": {"in_app": true, "email": false},
    "mention":       {"in_app": true, "email": true}
  }'::jsonb,
  onboarding_completed      boolean default false,
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);

-- ============================================================
-- WORKSPACES
-- ============================================================
create table workspaces (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text unique not null,
  description text,
  logo_url    text,
  owner_id    uuid not null references profiles(id) on delete restrict,
  plan        workspace_plan default 'FREE',
  settings    jsonb default '{}'::jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table workspace_members (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id      uuid not null references profiles(id) on delete cascade,
  role         workspace_member_role default 'MEMBER',
  joined_at    timestamptz default now(),
  unique(workspace_id, user_id)
);

create table workspace_invitations (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  email        text not null,
  role         workspace_member_role default 'MEMBER',
  token        text unique not null default encode(gen_random_bytes(32), 'hex'),
  invited_by   uuid not null references profiles(id),
  expires_at   timestamptz default now() + interval '7 days',
  accepted_at  timestamptz,
  created_at   timestamptz default now()
);

-- ============================================================
-- BOARDS
-- ============================================================
create table boards (
  id               uuid primary key default uuid_generate_v4(),
  workspace_id     uuid not null references workspaces(id) on delete cascade,
  created_by       uuid not null references profiles(id),
  title            text not null,
  description      text,
  background_type  background_type default 'COLOR',
  background_value text default '#0052CC',
  visibility       board_visibility default 'WORKSPACE',
  is_archived      boolean default false,
  settings         jsonb default '{
    "card_covers":    true,
    "voting":         false,
    "aging":          false,
    "calendar_feed":  false
  }'::jsonb,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table board_members (
  id       uuid primary key default uuid_generate_v4(),
  board_id uuid not null references boards(id) on delete cascade,
  user_id  uuid not null references profiles(id) on delete cascade,
  role     board_member_role default 'MEMBER',
  unique(board_id, user_id)
);

create table board_stars (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  board_id   uuid not null references boards(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, board_id)
);

-- ============================================================
-- LABELS
-- ============================================================
create table labels (
  id       uuid primary key default uuid_generate_v4(),
  board_id uuid not null references boards(id) on delete cascade,
  name     text,
  color    text not null default '#61BD4F'
);

-- ============================================================
-- LISTS
-- ============================================================
create table lists (
  id          uuid primary key default uuid_generate_v4(),
  board_id    uuid not null references boards(id) on delete cascade,
  title       text not null,
  position    float8 not null default 0,
  color       text,
  is_archived boolean default false,
  wip_limit   int,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- CARDS
-- ============================================================
create table cards (
  id                uuid primary key default uuid_generate_v4(),
  list_id           uuid not null references lists(id) on delete cascade,
  board_id          uuid not null references boards(id) on delete cascade,
  created_by        uuid not null references profiles(id),
  title             text not null,
  description       jsonb,            -- TipTap JSON content
  description_text  text,             -- plain text for search
  position          float8 not null default 0,
  due_date          timestamptz,
  start_date        timestamptz,
  due_date_reminder text default 'NONE',
  is_completed      boolean default false,
  is_archived       boolean default false,
  cover_type        cover_type default 'NONE',
  cover_value       text,
  priority          card_priority default 'NONE',
  estimated_hours   float4,
  story_points      int,
  parent_card_id    uuid references cards(id) on delete set null,
  sprint_id         uuid,             -- FK added after sprints table
  embedding         vector(1536),     -- pgvector for AI semantic search
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table card_assignments (
  id          uuid primary key default uuid_generate_v4(),
  card_id     uuid not null references cards(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  assigned_at timestamptz default now(),
  assigned_by uuid references profiles(id),
  unique(card_id, user_id)
);

create table card_labels (
  card_id  uuid not null references cards(id) on delete cascade,
  label_id uuid not null references labels(id) on delete cascade,
  primary key (card_id, label_id)
);

create table card_watchers (
  card_id uuid not null references cards(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  primary key (card_id, user_id)
);

-- ============================================================
-- DEPENDENCIES
-- ============================================================
create table card_dependencies (
  id               uuid primary key default uuid_generate_v4(),
  blocking_card_id uuid not null references cards(id) on delete cascade,
  blocked_card_id  uuid not null references cards(id) on delete cascade,
  type             dependency_type default 'FINISH_TO_START',
  created_at       timestamptz default now(),
  created_by       uuid references profiles(id),
  unique(blocking_card_id, blocked_card_id),
  check(blocking_card_id != blocked_card_id)
);

-- ============================================================
-- CHECKLISTS
-- ============================================================
create table checklists (
  id         uuid primary key default uuid_generate_v4(),
  card_id    uuid not null references cards(id) on delete cascade,
  title      text not null default 'Checklist',
  position   float8 default 0,
  created_at timestamptz default now()
);

create table checklist_items (
  id           uuid primary key default uuid_generate_v4(),
  checklist_id uuid not null references checklists(id) on delete cascade,
  title        text not null,
  position     float8 default 0,
  is_completed boolean default false,
  due_date     timestamptz,
  assignee_id  uuid references profiles(id),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ============================================================
-- ATTACHMENTS
-- ============================================================
create table attachments (
  id           uuid primary key default uuid_generate_v4(),
  card_id      uuid not null references cards(id) on delete cascade,
  uploaded_by  uuid not null references profiles(id),
  name         text not null,
  url          text not null,
  storage_path text,           -- Supabase Storage path
  mime_type    text,
  size_bytes   bigint,
  is_cover     boolean default false,
  created_at   timestamptz default now()
);

-- ============================================================
-- COMMENTS
-- ============================================================
create table comments (
  id             uuid primary key default uuid_generate_v4(),
  card_id        uuid not null references cards(id) on delete cascade,
  author_id      uuid not null references profiles(id) on delete cascade,
  content        jsonb not null,          -- TipTap JSON
  content_text   text,                    -- plain text for search/email
  is_edited      boolean default false,
  parent_id      uuid references comments(id) on delete cascade,
  reactions      jsonb default '{}'::jsonb, -- {"👍": ["user_id1"], "❤️": [...]}
  client_visible boolean default false,   -- visible in client portal
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ============================================================
-- CUSTOM FIELDS
-- ============================================================
create table custom_fields (
  id         uuid primary key default uuid_generate_v4(),
  board_id   uuid not null references boards(id) on delete cascade,
  name       text not null,
  type       custom_field_type not null,
  options    jsonb,           -- for DROPDOWN: [{id, value, color}]
  position   float8 default 0,
  created_at timestamptz default now()
);

create table custom_field_values (
  id              uuid primary key default uuid_generate_v4(),
  card_id         uuid not null references cards(id) on delete cascade,
  custom_field_id uuid not null references custom_fields(id) on delete cascade,
  text_value      text,
  number_value    float8,
  date_value      timestamptz,
  bool_value      boolean,
  unique(card_id, custom_field_id)
);

-- ============================================================
-- TIME TRACKING
-- ============================================================
create table time_entries (
  id               uuid primary key default uuid_generate_v4(),
  card_id          uuid not null references cards(id) on delete cascade,
  user_id          uuid not null references profiles(id) on delete cascade,
  started_at       timestamptz not null default now(),
  ended_at         timestamptz,
  duration_seconds int,         -- computed on stop
  description      text,
  is_billable      boolean default false,
  created_at       timestamptz default now()
);

-- ============================================================
-- SPRINTS
-- ============================================================
create table sprints (
  id         uuid primary key default uuid_generate_v4(),
  board_id   uuid not null references boards(id) on delete cascade,
  name       text not null,
  goal       text,
  start_date date,
  end_date   date,
  status     sprint_status default 'PLANNED',
  created_at timestamptz default now()
);

-- Add sprint FK to cards now that sprints table exists
alter table cards
  add constraint fk_sprint
  foreign key (sprint_id) references sprints(id) on delete set null;

-- ============================================================
-- AUTOMATIONS
-- ============================================================
create table automations (
  id             uuid primary key default uuid_generate_v4(),
  board_id       uuid not null references boards(id) on delete cascade,
  created_by     uuid not null references profiles(id),
  name           text not null,
  is_enabled     boolean default true,
  trigger_type   automation_trigger_type not null,
  trigger_config jsonb default '{}'::jsonb,
  conditions     jsonb default '[]'::jsonb,
  actions        jsonb default '[]'::jsonb,
  run_count      int default 0,
  last_run_at    timestamptz,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create table automation_logs (
  id            uuid primary key default uuid_generate_v4(),
  automation_id uuid not null references automations(id) on delete cascade,
  card_id       uuid references cards(id) on delete set null,
  triggered_at  timestamptz default now(),
  success       boolean not null,
  actions_taken jsonb,
  error_message text
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        notification_type not null,
  title       text not null,
  body        text,
  entity_type text,   -- 'CARD' | 'BOARD' | 'WORKSPACE' | 'COMMENT'
  entity_id   uuid,
  action_url  text,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

-- ============================================================
-- ACTIVITY LOG
-- ============================================================
create table activity_logs (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  board_id     uuid references boards(id) on delete cascade,
  card_id      uuid references cards(id) on delete cascade,
  user_id      uuid references profiles(id) on delete set null,
  action       text not null,       -- 'card.created', 'card.moved', etc.
  metadata     jsonb default '{}'::jsonb,
  created_at   timestamptz default now()
);

-- ============================================================
-- TEMPLATES
-- ============================================================
create table templates (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  created_by   uuid not null references profiles(id),
  name         text not null,
  description  text,
  category     text,
  structure    jsonb not null,   -- full board JSON structure
  is_public    boolean default false,
  usage_count  int default 0,
  created_at   timestamptz default now()
);

-- ============================================================
-- CLIENT PORTAL
-- ============================================================
create table client_portals (
  id                uuid primary key default uuid_generate_v4(),
  board_id          uuid unique not null references boards(id) on delete cascade,
  slug              text unique not null,
  password_hash     text,
  allow_comments    boolean default false,
  allow_attachments boolean default false,
  custom_branding   jsonb default '{}'::jsonb,
  is_active         boolean default true,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Cards
create index idx_cards_list_id    on cards(list_id);
create index idx_cards_board_id   on cards(board_id);
create index idx_cards_sprint_id  on cards(sprint_id) where sprint_id is not null;
create index idx_cards_due_date   on cards(due_date)  where due_date is not null;
create index idx_cards_is_archived on cards(is_archived);
create index idx_cards_position   on cards(list_id, position);
create index idx_cards_parent     on cards(parent_card_id) where parent_card_id is not null;
create index idx_cards_embedding  on cards using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Full-text search on cards
create index idx_cards_fts on cards using gin(
  to_tsvector('english', title || ' ' || coalesce(description_text, ''))
);

-- Lists
create index idx_lists_board_id on lists(board_id);
create index idx_lists_position on lists(board_id, position);

-- Comments
create index idx_comments_card_id   on comments(card_id);
create index idx_comments_parent_id on comments(parent_id) where parent_id is not null;

-- Activity logs
create index idx_activity_board on activity_logs(board_id,     created_at desc);
create index idx_activity_card  on activity_logs(card_id,      created_at desc);
create index idx_activity_ws    on activity_logs(workspace_id, created_at desc);

-- Notifications
create index idx_notifications_user   on notifications(user_id, created_at desc);
create index idx_notifications_unread on notifications(user_id, is_read) where is_read = false;

-- Time entries
create index idx_time_entries_card on time_entries(card_id);
create index idx_time_entries_user on time_entries(user_id);

-- Board members
create index idx_board_members_user    on board_members(user_id);
create index idx_board_members_board   on board_members(board_id);

-- Workspace members
create index idx_workspace_members_user on workspace_members(user_id);
create index idx_workspace_members_ws   on workspace_members(workspace_id);

-- Dependencies
create index idx_deps_blocking on card_dependencies(blocking_card_id);
create index idx_deps_blocked  on card_dependencies(blocked_card_id);

-- Automation logs
create index idx_automation_logs_automation on automation_logs(automation_id, triggered_at desc);
