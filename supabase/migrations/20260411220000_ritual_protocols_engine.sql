-- ============================================================
-- FLOWBOARD — RITUAL PROTOCOLS ENGINE
-- Enables recurring card creation and scheduled automations.
-- ============================================================

-- 1. ENHANCED ACTION EXECUTOR
-- Redefines the function to support card creation and handle NULL card contexts.
CREATE OR REPLACE FUNCTION execute_automation_action(
  p_automation_id UUID,
  p_card_id       UUID,
  p_action        JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action_type TEXT;
  v_config      JSONB;
  v_board_id    UUID;
  v_creator_id  UUID;
BEGIN
  v_action_type := p_action->>'type';
  v_config      := p_action->'config';
  
  -- Get context data from the automation metadata
  SELECT board_id, created_by INTO v_board_id, v_creator_id 
  FROM automations WHERE id = p_automation_id;

  CASE v_action_type
    -- ACTION: Send Notification (Requires card context)
    WHEN 'NOTIFY_USER' THEN
      IF p_card_id IS NULL THEN RETURN FALSE; END IF;
      INSERT INTO notifications (user_id, type, title, body, entity_type, entity_id)
      VALUES (
        (v_config->>'user_id')::UUID,
        'AUTOMATION_TRIGGERED',
        'Protocol Active: ' || (SELECT name FROM automations WHERE id = p_automation_id),
        'Scheduled action executed.',
        'CARD',
        p_card_id
      );

    -- ACTION: Assign Label
    WHEN 'ASSIGN_TAG' THEN
      IF p_card_id IS NULL THEN RETURN FALSE; END IF;
      INSERT INTO card_labels (card_id, label_id)
      VALUES (p_card_id, (v_config->>'label_id')::UUID)
      ON CONFLICT DO NOTHING;

    -- ACTION: Move to List
    WHEN 'MOVE_TO_LIST' THEN
      IF p_card_id IS NULL THEN RETURN FALSE; END IF;
      UPDATE cards SET list_id = (v_config->>'list_id')::UUID WHERE id = p_card_id;

    -- ACTION: Archive Card
    WHEN 'ARCHIVE' THEN
      IF p_card_id IS NULL THEN RETURN FALSE; END IF;
      UPDATE cards set is_archived = true WHERE id = p_card_id;

    -- ACTION: Set Priority
    WHEN 'SET_PRIORITY' THEN
      IF p_card_id IS NULL THEN RETURN FALSE; END IF;
      UPDATE cards SET priority = (v_config->>'priority')::card_priority WHERE id = p_card_id;

    -- ACTION: Create Recurring Card (The "Ritual" Action)
    WHEN 'CREATE_CARD' THEN
      INSERT INTO cards (list_id, board_id, created_by, title, description, priority)
      VALUES (
        (v_config->>'list_id')::UUID,
        v_board_id,
        v_creator_id,
        COALESCE(v_config->>'title', 'New Recurring Task'),
        v_config->'description', -- TipTap JSON
        COALESCE((v_config->>'priority')::card_priority, 'NONE')
      );

    ELSE
      -- Custom action types can be added here
      RETURN FALSE;
  END CASE;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 2. SCHEDULED RITUAL PROCESSOR
-- This RPC scans for scheduled automations and fires them if they are due.
CREATE OR REPLACE FUNCTION trigger_scheduled_rituals()
RETURNS TABLE (automation_name TEXT, board_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_automation RECORD;
  v_action     JSONB;
BEGIN
  -- Cycle through enabled scheduled automations
  FOR v_automation IN
    SELECT * FROM automations
    WHERE is_enabled = true
    AND trigger_type IN ('SCHEDULE_DAILY', 'SCHEDULE_WEEKLY')
    AND (
      last_run_at IS NULL OR 
      (trigger_type = 'SCHEDULE_DAILY' AND last_run_at < CURRENT_DATE) OR
      (trigger_type = 'SCHEDULE_WEEKLY' AND last_run_at < CURRENT_DATE - INTERVAL '6 days')
    )
  LOOP
    -- Execute each action defined in the ritual
    FOR v_action IN SELECT jsonb_array_elements(v_automation.actions)
    LOOP
      PERFORM execute_automation_action(v_automation.id, NULL, v_action);
    END LOOP;

    -- Update automation audit metrics
    UPDATE automations SET 
      run_count = run_count + 1,
      last_run_at = now()
    WHERE id = v_automation.id;

    automation_name := v_automation.name;
    board_id := v_automation.board_id;
    RETURN NEXT;
  END LOOP;
END;
$$;
