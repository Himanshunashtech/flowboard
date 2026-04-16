-- ============================================================
-- FLOWBOARD — MIGRATION: KINETIC AUTOMATION ENGINE V3
-- Expansion with conditions, relative dates, and variables.
-- ============================================================

-- 1. HELPER: Variable Substitution
CREATE OR REPLACE FUNCTION substitute_automation_variables(
    p_text    TEXT,
    p_card_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_card  RECORD;
    v_res   TEXT := p_text;
BEGIN
    SELECT * INTO v_card FROM cards WHERE id = p_card_id;
    IF NOT FOUND THEN RETURN p_text; END IF;

    v_res := replace(v_res, '{{title}}', v_card.title);
    v_res := replace(v_res, '{{priority}}', COALESCE(v_card.priority::text, 'None'));
    v_res := replace(v_res, '{{due_date}}', COALESCE(to_char(v_card.due_date, 'Mon DD, YYYY'), 'No date'));
    
    RETURN v_res;
END;
$$;

-- 2. HELPER: Condition Evaluator
CREATE OR REPLACE FUNCTION evaluate_automation_conditions(
    p_card_id    UUID,
    p_conditions JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_cond     JSONB;
    v_card     RECORD;
    v_type     TEXT;
    v_val      TEXT;
    v_match    BOOLEAN := TRUE;
BEGIN
    IF p_conditions IS NULL OR jsonb_array_length(p_conditions) = 0 THEN
        RETURN TRUE;
    END IF;

    SELECT * INTO v_card FROM cards WHERE id = p_card_id;
    
    FOR v_cond IN SELECT jsonb_array_elements(p_conditions)
    LOOP
        v_type := v_cond->>'type';
        v_val  := v_cond->>'value';

        CASE v_type
            WHEN 'PRIORITY_IS' THEN
                IF v_card.priority::text != v_val THEN v_match := FALSE; END IF;
            WHEN 'TITLE_CONTAINS' THEN
                IF v_card.title !~* v_val THEN v_match := FALSE; END IF;
            WHEN 'IS_COMPLETED' THEN
                IF v_card.is_completed::text != v_val THEN v_match := FALSE; END IF;
            ELSE
                -- Unknown condition type ignores the check
        END CASE;

        EXIT WHEN NOT v_match;
    END LOOP;

    RETURN v_match;
END;
$$;

-- 3. EXPANDED ACTION EXECUTION
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
    v_msg         TEXT;
BEGIN
    v_action_type := p_action->>'type';
    v_config      := p_action->'config';

    CASE v_action_type
        -- V1 Actions (Maintained for compatibility)
        WHEN 'NOTIFY_USER' THEN
            INSERT INTO notifications (user_id, type, title, body, entity_type, entity_id)
            SELECT 
                (v_config->>'user_id')::uuid,
                'AUTOMATION_TRIGGERED',
                'Protocol Executed',
                substitute_automation_variables(COALESCE(v_config->>'text', 'Action executed on "{{title}}"'), p_card_id),
                'CARD',
                p_card_id;

        WHEN 'MOVE_TO_LIST' THEN
            UPDATE cards SET list_id = (v_config->>'list_id')::uuid WHERE id = p_card_id;

        WHEN 'SET_COMPLETED' THEN
            UPDATE cards SET is_completed = (v_config->>'is_completed')::boolean WHERE id = p_card_id;

        -- V3 NEW ACTIONS
        WHEN 'ADD_COMMENT' THEN
            INSERT INTO comments (card_id, author_id, content_text)
            SELECT 
                p_card_id, 
                (SELECT created_by FROM automations WHERE id = p_automation_id),
                substitute_automation_variables(v_config->>'text', p_card_id);

        WHEN 'SET_DUE_DATE_RELATIVE' THEN
            UPDATE cards 
            SET due_date = NOW() + (v_config->>'days' || ' days')::interval
            WHERE id = p_card_id;

        WHEN 'REMOVE_LABELS' THEN
            DELETE FROM card_labels WHERE card_id = p_card_id;

        ELSE
            RETURN FALSE;
    END CASE;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- 4. UPDATED PROCESSOR WITH RECURSION PROTECTION
CREATE OR REPLACE FUNCTION process_automations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_automation   RECORD;
    v_action       JSONB;
    v_trigger_type automation_trigger_type;
    v_board_id     UUID;
    v_card_id      UUID;
    v_depth        INT;
BEGIN
    -- 0. Recursion Protection (Max Depth 2)
    v_depth := COALESCE(nullif(current_setting('flowboard.automation_depth', true), ''), '0')::int;
    IF v_depth >= 2 THEN
        RETURN NEW;
    END IF;
    PERFORM set_config('flowboard.automation_depth', (v_depth + 1)::text, true);

    -- 1. Identify Context
    IF TG_TABLE_NAME = 'cards' THEN
        v_card_id := NEW.id;
        v_board_id := NEW.board_id;
        
        IF TG_OP = 'INSERT' THEN
            v_trigger_type := 'CARD_CREATED';
        ELSIF TG_OP = 'UPDATE' THEN
            IF OLD.list_id IS DISTINCT FROM NEW.list_id THEN
                v_trigger_type := 'CARD_MOVED_TO_LIST';
            ELSIF OLD.is_completed = FALSE AND NEW.is_completed = TRUE THEN
                v_trigger_type := 'CARD_COMPLETED';
            ELSE
                RETURN NEW;
            END IF;
        END IF;
    ELSE
        RETURN NEW;
    END IF;

    -- 2. Execute Matching Automations
    FOR v_automation IN
        SELECT * FROM automations
        WHERE board_id = v_board_id
        AND is_enabled = TRUE
        AND trigger_type = v_trigger_type
    LOOP
        -- NEW: Check conditions
        IF evaluate_automation_conditions(v_card_id, v_automation.conditions) THEN
            FOR v_action IN SELECT jsonb_array_elements(v_automation.actions)
            LOOP
                PERFORM execute_automation_action(v_automation.id, v_card_id, v_action);
            END LOOP;

            UPDATE automations SET 
                run_count = run_count + 1, 
                last_run_at = NOW() 
            WHERE id = v_automation.id;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;
