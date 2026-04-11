-- SLACK ACCOUNTS (SECURE TOKEN STORAGE)
CREATE TABLE IF NOT EXISTS slack_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slack_user_id TEXT,
    slack_workspace_id TEXT NOT NULL,
    slack_workspace_name TEXT,
    encrypted_bot_token BYTEA NOT NULL,
    encrypted_user_token BYTEA,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, slack_workspace_id)
);

-- BOARD SLACK CHANNELS (MAPPING)
CREATE TABLE IF NOT EXISTS board_slack_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    channel_id TEXT NOT NULL,
    channel_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(board_id)
);

-- RLS POLICIES FOR SLACK
ALTER TABLE slack_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_slack_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own Slack account"
    ON slack_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view board slack mappings if they have access to the board"
    ON board_slack_channels FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM board_members 
        WHERE board_id = board_slack_channels.board_id 
        AND user_id = auth.uid()
    ));

-- ANALYTICS VIEWS (ENABLING INSIGHTS LAYER)

-- Lead Time View: Calculates duration from creation to completion
CREATE OR REPLACE VIEW analytics_lead_time AS
SELECT 
    b.id as board_id,
    c.id as card_id,
    c.title,
    c.created_at,
    c.updated_at as completed_at,
    EXTRACT(EPOCH FROM (c.updated_at - c.created_at)) / 3600 as lead_time_hours
FROM cards c
JOIN boards b ON b.id = c.board_id
WHERE c.is_completed = true;

-- Velocity View: Aggregates completions by day and board
CREATE OR REPLACE VIEW analytics_velocity AS
SELECT 
    board_id,
    DATE(updated_at) as completion_date,
    COUNT(id) as cards_completed
FROM cards
WHERE is_completed = true
GROUP BY board_id, completion_date;

-- ENCRYPTION HELPER (Assumes app.slack_encryption_key is set in DB)
CREATE OR REPLACE FUNCTION decrypt_slack_token_secure(p_user_id UUID)
RETURNS TABLE (decrypted_bot_token TEXT) AS $$
DECLARE
    secret TEXT;
BEGIN
    secret := current_setting('app.slack_encryption_key', true);
    
    RETURN QUERY
    SELECT pgp_sym_decrypt(encrypted_bot_token, secret)
    FROM slack_accounts
    WHERE user_id = p_user_id
    AND (auth.uid() = p_user_id OR auth.role() = 'service_role');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
