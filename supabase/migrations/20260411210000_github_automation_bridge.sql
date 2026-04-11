-- ============================================================
-- FLOWBOARD — GITHUB AUTOMATION BRIDGE
-- Integrates GitHub events into the core Automation Engine.
-- Allows users to create rules triggered by PRs and Issues.
-- ============================================================

-- 1. EXTEND TRIGGER TYPES
-- Note: Enum additions must be in separate statements and can't be in transactions in some Postgres versions,
-- but standard Supabase migrations handle this.
ALTER TYPE automation_trigger_type ADD VALUE IF NOT EXISTS 'GITHUB_PR_OPENED';
ALTER TYPE automation_trigger_type ADD VALUE IF NOT EXISTS 'GITHUB_PR_MERGED';
ALTER TYPE automation_trigger_type ADD VALUE IF NOT EXISTS 'GITHUB_ISSUE_CLOSED';

-- 2. EXTERNAL TRIGGER HANDLER
-- This RPC will be called by Edge Functions (e.g., github-webhook) to 
-- re-route external events into our internal automation engine.
CREATE OR REPLACE FUNCTION handle_external_trigger(
  p_card_id      UUID,
  p_trigger_type TEXT,
  p_trigger_data JSONB DEFAULT '{}'::JSONB
)
RETURNS TABLE (automation_name TEXT, success BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_automation   RECORD;
  v_action       JSONB;
  v_board_id     UUID;
  v_success      BOOLEAN;
BEGIN
  -- Get Board ID
  SELECT board_id INTO v_board_id FROM cards WHERE id = p_card_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- Find matching enabled automations
  -- We cast trigger_type to TEXT for flexible matching
  FOR v_automation IN
    SELECT * FROM automations
    WHERE board_id = v_board_id
    AND is_enabled = true
    AND trigger_type::TEXT = p_trigger_type
  LOOP
    -- Execute each action defined in the rule
    FOR v_action IN SELECT jsonb_array_elements(v_automation.actions)
    LOOP
      v_success := execute_automation_action(v_automation.id, p_card_id, v_action);
      
      -- Log execution for the user's "Workflow Forge" UI
      INSERT INTO automation_logs (automation_id, card_id, success, actions_taken)
      VALUES (v_automation.id, p_card_id, v_success, v_action);
    END LOOP;

    -- Update automation performance stats
    UPDATE automations SET 
      run_count = run_count + 1,
      last_run_at = now()
    WHERE id = v_automation.id;

    automation_name := v_automation.name;
    success := v_success;
    RETURN NEXT;
  END LOOP;
END;
$$;
