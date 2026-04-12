-- ============================================================
-- FLOWBOARD — MIGRATION: AUTOMATION BRIDGE FOR RECIPIES
-- ============================================================

-- Add new trigger type for external integration events
-- Use do block to safely add to enum if it exists
DO $$ BEGIN
    ALTER TYPE automation_trigger_type ADD VALUE 'INTEGRATION_EVENT';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- FUNCTION: trigger_external_automation
-- Allows the Integration Hub to fire a board automation
-- ============================================================
create or replace function trigger_external_automation(
  p_board_id       uuid,
  p_card_id        uuid,
  p_event_type     text,
  p_service        integration_service,
  p_payload        jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
as $$
declare
  v_automation   record;
  v_action       jsonb;
  v_success      boolean;
begin
  -- Find automations matching this external event
  for v_automation in
    select * from automations
    where board_id = p_board_id
    and is_enabled = true
    and trigger_type = 'INTEGRATION_EVENT'
    and (trigger_config->>'service')::integration_service = p_service
    and trigger_config->>'event' = p_event_type
  loop
    -- Execute actions
    for v_action in select jsonb_array_elements(v_automation.actions)
    loop
      v_success := execute_automation_action(v_automation.id, p_card_id, v_action);
      
      -- Log execution
      insert into automation_logs (automation_id, card_id, success, actions_taken)
      values (v_automation.id, p_card_id, v_success, v_action);
    end loop;

    -- Update last run
    update automations set 
      run_count = run_count + 1,
      last_run_at = now()
    where id = v_automation.id;
  end loop;
end;
$$;
