-- ============================================================
-- FLOWBOARD — MIGRATION 009: AUTOMATION ENGINE EXPANSION
-- Adding more triggers and actions to the Butler equivalent.
-- ============================================================

-- 1. Add new trigger types if they don't exist
-- (Assuming automation_trigger_type enum already has these from Migration 001)

-- 2. Update execute_automation_action to support MORE actions
create or replace function execute_automation_action(
  p_automation_id uuid,
  p_card_id       uuid,
  p_action        jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action_type text;
  v_config      jsonb;
begin
  v_action_type := p_action->>'type';
  v_config      := p_action->'config';

  case v_action_type
    when 'NOTIFY_USER' then
      insert into notifications (user_id, type, title, body, entity_type, entity_id)
      select 
        (v_config->>'user_id')::uuid,
        'AUTOMATION_TRIGGERED',
        'Automation Running: ' || (select name from automations where id = p_automation_id),
        'Action executed on card: ' || (select title from cards where id = p_card_id),
        'CARD',
        p_card_id;

    when 'ASSIGN_TAG' then
      insert into card_labels (card_id, label_id)
      values (p_card_id, (v_config->>'label_id')::uuid)
      on conflict do nothing;

    when 'MOVE_TO_LIST' then
      update cards set list_id = (v_config->>'list_id')::uuid where id = p_card_id;

    when 'ARCHIVE' then
      update cards set is_archived = true where id = p_card_id;

    when 'SET_PRIORITY' then
      update cards set priority = (v_config->>'priority')::card_priority where id = p_card_id;

    -- NEW: Add comment
    when 'ADD_COMMENT' then
      insert into comments (card_id, author_id, content_text)
      values (p_card_id, (v_config->>'author_id')::uuid, v_config->>'text');

    -- NEW: Toggle Completion
    when 'SET_COMPLETED' then
      update cards set is_completed = (v_config->>'is_completed')::boolean where id = p_card_id;

    -- NEW: Webhook Dispatch (MOCKED - would be picked up by an edge function)
    when 'DISPATCH_WEBHOOK' then
      insert into automation_logs (automation_id, card_id, success, actions_taken)
      values (p_automation_id, p_card_id, true, p_action);

    else
      return false;
  end case;

  return true;
exception
  when others then
    return false;
end;
$$;

-- 3. Update process_automations to support MORE triggers
create or replace function process_automations()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_automation   record;
  v_action       jsonb;
  v_trigger_type automation_trigger_type;
  v_board_id     uuid;
  v_card_id      uuid;
begin
  if TG_TABLE_NAME = 'cards' then
    v_card_id := new.id;
    v_board_id := new.board_id;
    
    if TG_OP = 'INSERT' then
      v_trigger_type := 'CARD_CREATED';
    elsif TG_OP = 'UPDATE' then
      if old.list_id is distinct from new.list_id then
        v_trigger_type := 'CARD_MOVED_TO_LIST';
      elsif old.is_archived = false and new.is_archived = true then
        v_trigger_type := 'CARD_ARCHIVED';
      elsif old.is_completed = false and new.is_completed = true then
        v_trigger_type := 'CARD_COMPLETED';
      else
        return new;
      end if;
    end if;
  elsif TG_TABLE_NAME = 'checklist_items' then
    select card_id into v_card_id from checklists where id = new.checklist_id;
    select board_id into v_board_id from cards where id = v_card_id;
    if old.is_completed = false and new.is_completed = true then
       v_trigger_type := 'CHECKLIST_ITEM_COMPLETED';
    else
       return new;
    end if;
  else
    return new;
  end if;

  -- Execution logic remains same
  for v_automation in
    select * from automations
    where board_id = v_board_id
    and is_enabled = true
    and trigger_type = v_trigger_type
  loop
    for v_action in select jsonb_array_elements(v_automation.actions) loop
      perform execute_automation_action(v_automation.id, v_card_id, v_action);
    end loop;
    update automations set run_count = run_count + 1, last_run_at = now() where id = v_automation.id;
  end loop;

  return new;
end;
$$;
