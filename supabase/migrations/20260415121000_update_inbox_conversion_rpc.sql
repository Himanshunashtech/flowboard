-- ============================================================
-- FLOWBOARD — MIGRATION: UPDATE INBOX CONVERSION RPC
-- ============================================================

-- Update the conversion function to handle missing list_id
-- This allows "Deploy to Board" to work even if lists aren't known on the frontend.

CREATE OR REPLACE FUNCTION convert_inbox_to_card(
    p_inbox_id     UUID,
    p_board_id     UUID,
    p_list_id      UUID DEFAULT NULL,
    p_position     TEXT DEFAULT 'a0',
    p_assignee_id  UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_inbox_item RECORD;
    v_card_id    UUID;
    v_description JSONB;
    v_title       TEXT;
    v_final_list_id UUID;
BEGIN
    -- 0. Determine final_list_id if NULL
    IF p_list_id IS NULL THEN
        SELECT id INTO v_final_list_id 
        FROM lists 
        WHERE board_id = p_board_id 
        ORDER BY position ASC 
        LIMIT 1;
    ELSE
        v_final_list_id := p_list_id;
    END IF;

    -- Verify we have a list to target
    IF v_final_list_id IS NULL THEN
        RAISE EXCEPTION 'Target board must have at least one list to receive missions.';
    END IF;

    -- Fetch the inbox item
    SELECT * INTO v_inbox_item FROM inbox_items WHERE id = p_inbox_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inbox item not found';
    END IF;

    -- 1. Construct Title (Add [Email] prefix if from email source)
    v_title := v_inbox_item.title;
    IF v_inbox_item.source = 'EMAIL' THEN
        v_title := '✉️ ' || v_title;
    END IF;

    -- 2. Construct Tiptap JSON Description
    IF v_inbox_item.source = 'EMAIL' THEN
        v_description := jsonb_build_object(
            'type', 'doc',
            'content', jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', jsonb_build_array(
                        jsonb_build_object(
                            'type', 'text',
                            'text', 'From: ',
                            'marks', jsonb_build_array(jsonb_build_object('type', 'bold'))
                        ),
                        jsonb_build_object(
                            'type', 'text',
                            'text', COALESCE(v_inbox_item.content->>'from', 'Unknown Sender')
                        )
                    )
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', jsonb_build_array(
                        jsonb_build_object(
                            'type', 'text',
                            'text', 'Date: ',
                            'marks', jsonb_build_array(jsonb_build_object('type', 'bold'))
                        ),
                        jsonb_build_object(
                            'type', 'text',
                            'text', COALESCE(v_inbox_item.content->>'captured_at', NOW()::TEXT)
                        )
                    )
                ),
                jsonb_build_object('type', 'horizontalRule'),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', jsonb_build_array(
                        jsonb_build_object(
                            'type', 'text',
                            'text', COALESCE(v_inbox_item.content->>'body_text', 'No content summary available.')
                        )
                    )
                )
            )
        );
    ELSE
        -- Default for manual or other sources
        v_description := jsonb_build_object(
            'type', 'doc',
            'content', jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', jsonb_build_array(
                        jsonb_build_object(
                            'type', 'text',
                            'text', v_inbox_item.title
                        )
                    )
                )
            )
        );
    END IF;

    -- 3. Insert into cards
    INSERT INTO cards (
        board_id,
        list_id,
        created_by,
        title,
        description,
        position
    ) VALUES (
        p_board_id,
        v_final_list_id,
        v_inbox_item.user_id,
        v_title,
        v_description,
        p_position
    ) RETURNING id INTO v_card_id;

    -- 4. Assign if provided
    IF p_assignee_id IS NOT NULL THEN
        INSERT INTO card_assignments (card_id, user_id, assigned_by)
        VALUES (v_card_id, p_assignee_id, v_inbox_item.user_id);
    END IF;

    -- 5. Delete the inbox item
    DELETE FROM inbox_items WHERE id = p_inbox_id;

    RETURN v_card_id;
END;
$$;
