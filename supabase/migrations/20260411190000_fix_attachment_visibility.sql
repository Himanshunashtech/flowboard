DROP POLICY IF EXISTS "attachments: board member or public board read" ON attachments;

CREATE POLICY "attachments: board member or public board read"
    ON attachments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM cards c
            JOIN boards b ON b.id = c.board_id
            LEFT JOIN board_members bm ON bm.board_id = b.id AND bm.user_id = auth.uid()
            WHERE c.id = attachments.card_id
            AND (
                bm.user_id IS NOT NULL  -- User is a member
                OR b.visibility = 'PUBLIC' -- Board is public
            )
        )
    );

-- ENSURING STORAGE PATH IS TRACEABLE
-- We add a helper to auto-populate metadata if needed, but primary fix is in the JS layer.
COMMENT ON COLUMN attachments.storage_path IS 'The relative path in the attachments bucket (board_id/card_id/filename). Used for environment-independent URL generation.';
