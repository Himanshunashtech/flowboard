-- ============================================================
-- FLOWBOARD — MIGRATION: INBOX & PLANNER CORE
-- ============================================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE inbox_source AS ENUM ('MANUAL', 'EMAIL', 'SLACK', 'WEB');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. INBOX ITEMS TABLE
CREATE TABLE IF NOT EXISTS inbox_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    content     JSONB DEFAULT '{}'::JSONB,
    source      inbox_source DEFAULT 'MANUAL',
    metadata    JSONB DEFAULT '{}'::JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS POLICIES
ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inbox items"
    ON inbox_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inbox items"
    ON inbox_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inbox items"
    ON inbox_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inbox items"
    ON inbox_items FOR DELETE
    USING (auth.uid() = user_id);

-- 4. INDEXES
CREATE INDEX idx_inbox_user_id ON inbox_items(user_id);
CREATE INDEX idx_inbox_created_at ON inbox_items(created_at DESC);

-- 5. FUNCTION: CONVERT INBOX TO CARD
-- This simplifies the "Move to Board" logic by handling it on the server
CREATE OR REPLACE FUNCTION convert_inbox_to_card(
    p_inbox_id  UUID,
    p_board_id  UUID,
    p_list_id   UUID,
    p_position  TEXT DEFAULT 'a0'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_inbox_item RECORD;
    v_card_id    UUID;
BEGIN
    -- Fetch the inbox item
    SELECT * INTO v_inbox_item FROM inbox_items WHERE id = p_inbox_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inbox item not found';
    END IF;

    -- Insert into cards
    INSERT INTO cards (
        board_id,
        list_id,
        created_by,
        title,
        description,
        position
    ) VALUES (
        p_board_id,
        p_list_id,
        v_inbox_item.user_id,
        v_inbox_item.title,
        v_inbox_item.content,
        p_position
    ) RETURNING id INTO v_card_id;

    -- Delete the inbox item
    DELETE FROM inbox_items WHERE id = p_inbox_id;

    RETURN v_card_id;
END;
$$;
