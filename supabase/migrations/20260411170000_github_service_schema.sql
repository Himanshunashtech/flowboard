-- ENABLE PGCRYPTO FOR SECURE STORAGE
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- GITHUB ACCOUNTS (SECURE TOKEN STORAGE)
CREATE TABLE IF NOT EXISTS github_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    github_user_id BIGINT UNIQUE,
    github_username TEXT,
    encrypted_access_token BYTEA NOT NULL,
    encrypted_refresh_token BYTEA,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- BOARD REPOSITORIES (BOARD-TO-REPO MAPPING)
CREATE TABLE IF NOT EXISTS board_repositories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    repo_id BIGINT NOT NULL,
    repo_full_name TEXT NOT NULL,
    repo_url TEXT NOT NULL,
    default_branch TEXT DEFAULT 'main',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(board_id, repo_id)
);

-- CARD GITHUB ITEMS (CARD-TO-ISSUE/PR MAPPING + SNAPSHOT CACHE)
CREATE TABLE IF NOT EXISTS card_github_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    github_id BIGINT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('ISSUE', 'PULL_REQUEST')),
    item_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    state TEXT NOT NULL, -- OPEN, CLOSED, MERGED
    url TEXT NOT NULL,
    repo_full_name TEXT NOT NULL,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(card_id, github_id)
);

-- WEBHOOK LOGS (IDEMPOTENCY & AUDIT)
CREATE TABLE IF NOT EXISTS github_webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_delivery_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE github_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_github_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Only the account owner can see their own tokens
CREATE POLICY "Users can only view their own GitHub account"
    ON github_accounts FOR SELECT
    USING (auth.uid() = user_id);

-- Board repositories follow the board permissions
CREATE POLICY "Users can view board repositories if they have access to the board"
    ON board_repositories FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM board_members 
        WHERE board_id = board_repositories.board_id 
        AND user_id = auth.uid()
    ));

-- Card github items follow the card permissions
CREATE POLICY "Users can view card github items if they have access to the card"
    ON card_github_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM cards c
        JOIN board_members bm ON bm.board_id = c.board_id
        WHERE c.id = card_github_items.card_id
        AND bm.user_id = auth.uid()
    ));

-- ENCRYPTION/DECRYPTION HELPER FUNCTIONS
-- NOTE: In a real prod environment, 'GITHUB_ENCRYPTION_KEY' should be passed via a secure vault.
-- For this implementation, we assume a server-side secret is used in the Edge Function for decryption.

CREATE OR REPLACE FUNCTION encrypt_github_token(token TEXT, secret TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(token, secret);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECURE TOKEN RETRIEVAL RPC
-- This should be the ONLY way to get the decrypted token
-- It validates the auth.uid() internally.
CREATE OR REPLACE FUNCTION decrypt_github_token_secure(p_user_id UUID)
RETURNS TABLE (decrypted_token TEXT) AS $$
DECLARE
    secret TEXT;
BEGIN
    -- WE ASSUME THE SECRET IS PASSED VIA SETTING OR ENVIRONMENT
    -- For this implementation, we use a fixed secret placeholder or vault access
    secret := current_setting('app.github_encryption_key', true);
    
    RETURN QUERY
    SELECT pgp_sym_decrypt(encrypted_access_token, secret)
    FROM github_accounts
    WHERE user_id = p_user_id
    AND (auth.uid() = p_user_id OR auth.role() = 'service_role');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
