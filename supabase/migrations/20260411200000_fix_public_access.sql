-- ============================================================
-- FLOWBOARD — FIX PUBLIC PROJECT VISIBILITY
-- Resolves issue where lists, cards, and metadata were blocked
-- for unauthenticated guest users on public boards.
-- ============================================================

-- 1. LISTS ACCESSIBILITY
DROP POLICY IF EXISTS "lists: board member read" ON lists;
CREATE POLICY "lists: board member or public read"
  ON lists FOR SELECT
  USING (
    is_board_member(board_id)
    OR EXISTS (
      SELECT 1 FROM boards b
      WHERE b.id = board_id AND b.visibility = 'PUBLIC'
    )
  );

-- 2. CARDS ACCESSIBILITY
DROP POLICY IF EXISTS "cards: board member read" ON cards;
CREATE POLICY "cards: board member or public read"
  ON cards FOR SELECT
  USING (
    is_board_member(board_id)
    OR EXISTS (
      SELECT 1 FROM boards b
      WHERE b.id = board_id AND b.visibility = 'PUBLIC'
    )
  );

-- 3. LABELS ACCESSIBILITY
DROP POLICY IF EXISTS "labels: board member access" ON labels;
CREATE POLICY "labels: board member or public read"
  ON labels FOR SELECT
  USING (
    is_board_member(board_id)
    OR EXISTS (
      SELECT 1 FROM boards b
      WHERE b.id = board_id AND b.visibility = 'PUBLIC'
    )
  );

DROP POLICY IF EXISTS "labels: board member insert" ON labels;
CREATE POLICY "labels: board member insert"
  ON labels FOR INSERT WITH CHECK (is_board_member(board_id));

-- 4. CARD ASSIGNMENTS ACCESSIBILITY
DROP POLICY IF EXISTS "card_assignments: board member read" ON card_assignments;
CREATE POLICY "card_assignments: board member or public read"
  ON card_assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM cards c
    JOIN boards b ON b.id = c.board_id
    WHERE c.id = card_assignments.card_id
    AND (is_board_member(b.id) OR b.visibility = 'PUBLIC')
  ));

-- 5. CHECKLISTS ACCESSIBILITY
DROP POLICY IF EXISTS "checklists: board member access" ON checklists;
CREATE POLICY "checklists: board member or public read"
  ON checklists FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM cards c
    JOIN boards b ON b.id = c.board_id
    WHERE c.id = checklists.card_id
    AND (is_board_member(b.id) OR b.visibility = 'PUBLIC')
  ));

-- 6. CHECKLIST ITEMS ACCESSIBILITY
DROP POLICY IF EXISTS "checklist_items: board member access" ON checklist_items;
CREATE POLICY "checklist_items: board member or public read"
  ON checklist_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM checklists cl
    JOIN cards c ON c.id = cl.card_id
    JOIN boards b ON b.id = c.board_id
    WHERE cl.id = checklist_items.checklist_id
    AND (is_board_member(b.id) OR b.visibility = 'PUBLIC')
  ));

-- 7. COMMENTS ACCESSIBILITY
DROP POLICY IF EXISTS "comments: board member read" ON comments;
CREATE POLICY "comments: board member or public read"
  ON comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM cards c
    JOIN boards b ON b.id = c.board_id
    WHERE c.id = comments.card_id
    AND (is_board_member(b.id) OR b.visibility = 'PUBLIC')
  ));
