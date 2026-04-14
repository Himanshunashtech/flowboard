-- ============================================================
-- FLOWBOARD — MIGRATION: PLANNER EXPANSION
-- ============================================================

-- 0. ENSURE ENUMS EXIST
DO $$ BEGIN
    CREATE TYPE integration_service AS ENUM (
        'SLACK', 'GITHUB', 'FIGMA', 'NOTION', 'ZENDESK', 
        'INTERCOM', 'GITLAB', 'DISCORD', 'JIRA', 'SENTRY', 
        'ZOOM', 'GOOGLE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. CALENDAR EVENT CACHE
-- For storing external events from Google/Outlook
CREATE TABLE IF NOT EXISTS planner_external_events (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    external_id    TEXT NOT NULL,
    title          TEXT NOT NULL,
    start_time     TIMESTAMPTZ NOT NULL,
    end_time       TIMESTAMPTZ NOT NULL,
    service        integration_service NOT NULL,
    sync_token     TEXT,
    metadata       JSONB DEFAULT '{}'::JSONB,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, external_id, service)
);

-- 2. TIME BLOCKS
-- For deep work sessions linked to specific cards
CREATE TABLE IF NOT EXISTS planner_time_blocks (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    card_id        UUID REFERENCES cards(id) ON DELETE SET NULL,
    title          TEXT NOT NULL, -- Defaults to card title if linked
    start_time     TIMESTAMPTZ NOT NULL,
    end_time       TIMESTAMPTZ NOT NULL,
    is_completed   BOOLEAN DEFAULT false,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DAILY PRIORITIES
-- Unified priority list across all boards
CREATE TABLE IF NOT EXISTS planner_daily_priorities (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    card_id        UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    priority_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    position       TEXT NOT NULL, -- Fractional indexing
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, card_id, priority_date)
);

-- 4. RLS POLICIES
ALTER TABLE planner_external_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_daily_priorities ENABLE ROW LEVEL SECURITY;

-- Policy: Owner access only
CREATE POLICY "Owner access to external events" ON planner_external_events
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Owner access to time blocks" ON planner_time_blocks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Owner access to daily priorities" ON planner_daily_priorities
    FOR ALL USING (auth.uid() = user_id);

-- 5. INDEXES
CREATE INDEX idx_planner_ext_user_time ON planner_external_events(user_id, start_time);
CREATE INDEX idx_planner_blocks_user_time ON planner_time_blocks(user_id, start_time);
CREATE INDEX idx_planner_prio_user_date ON planner_daily_priorities(user_id, priority_date);
