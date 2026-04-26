-- ============================================================
-- FLOWBOARD — MIGRATION: WEBHOOK INTEGRATIONS & API KEYS
-- ============================================================

-- 1. Webhook Integrations Table
CREATE TABLE IF NOT EXISTS workspace_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    service TEXT NOT NULL CHECK (service IN ('GITHUB', 'GITLAB', 'SLACK', 'TEAMS')),
    webhook_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    webhook_secret TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{
        "move_to_status": "done",
        "target_list_id": null,
        "auto_link_prs": true
    }'::JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of the API key
    key_preview TEXT NOT NULL,      -- First 4 characters for UI (e.g. "fb_...")
    scopes TEXT[] DEFAULT '{submit_tasks, search_tasks}',
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Card External References (to link PRs directly)
CREATE TABLE IF NOT EXISTS card_external_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    service TEXT NOT NULL, -- 'github_pr', 'gitlab_mr', 'notion_page'
    external_id TEXT NOT NULL,
    external_url TEXT NOT NULL,
    title TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(card_id, external_url)
);

-- 4. RLS Policies
ALTER TABLE workspace_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_external_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace admins can manage webhooks" ON workspace_webhooks;
CREATE POLICY "Workspace admins can manage webhooks"
    ON workspace_webhooks
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_id = workspace_webhooks.workspace_id
            AND user_id = auth.uid()
            AND role IN ('OWNER', 'ADMIN')
        )
    );

DROP POLICY IF EXISTS "Workspace admins can manage API keys" ON api_keys;
CREATE POLICY "Workspace admins can manage API keys"
    ON api_keys
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_id = api_keys.workspace_id
            AND user_id = auth.uid()
            AND role IN ('OWNER', 'ADMIN')
        )
    );

DROP POLICY IF EXISTS "Workspace members can view card links" ON card_external_links;
CREATE POLICY "Workspace members can view card links"
    ON card_external_links
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM cards
            JOIN board_members ON board_members.board_id = cards.board_id
            WHERE cards.id = card_external_links.card_id
            AND board_members.user_id = auth.uid()
        )
    );

-- 5. Add task_number to cards for short ID referencing
ALTER TABLE cards ADD COLUMN IF NOT EXISTS task_number SERIAL;

-- 7. Public Sharing Settings
CREATE TABLE IF NOT EXISTS workspace_public_settings (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    allow_public_submission BOOLEAN DEFAULT false,
    public_submission_slug TEXT UNIQUE,
    allow_public_roadmap BOOLEAN DEFAULT false,
    public_roadmap_slug TEXT UNIQUE,
    allow_public_releases BOOLEAN DEFAULT false,
    public_releases_slug TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Slack/Teams Integrations
CREATE TABLE IF NOT EXISTS workspace_external_apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    app_type TEXT NOT NULL CHECK (app_type IN ('SLACK', 'TEAMS', 'NOTION')),
    external_id TEXT NOT NULL,
    external_name TEXT,
    access_token TEXT, -- Encrypted in production
    settings JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(workspace_id, app_type)
);

-- 9. RLS for new tables
ALTER TABLE workspace_public_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_external_apps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace admins manage public settings" ON workspace_public_settings;
CREATE POLICY "Workspace admins manage public settings"
    ON workspace_public_settings FOR ALL
    USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = workspace_public_settings.workspace_id AND user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')));

DROP POLICY IF EXISTS "Workspace admins manage apps" ON workspace_external_apps;
CREATE POLICY "Workspace admins manage apps"
    ON workspace_external_apps FOR ALL
    USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = workspace_external_apps.workspace_id AND user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')));

-- 10. Public access for public pages (Roadmap, etc.)
DROP POLICY IF EXISTS "Public can view roadmap" ON cards;
CREATE POLICY "Public can view roadmap"
    ON cards FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM boards b
            JOIN workspace_public_settings s ON s.workspace_id = b.workspace_id
            WHERE b.id = cards.board_id
            AND s.allow_public_roadmap = true
        )
    );
