-- ============================================================
-- FLOWBOARD — MIGRATION 007: AUTOMATION ENGINE
-- Implementation of the core automation logic for board rules.
-- ============================================================

-- ============================================================
-- FUNCTION: Execute an automation action
-- ============================================================

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

    else
      -- Action not implemented yet
      return false;
  end case;

  return true;
exception
  when others then
    return false;
end;
$$;

-- ============================================================
-- FUNCTION: Process automations for a specific trigger
-- ============================================================

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
  v_success      boolean;
  v_error        text;
  v_board_id     uuid;
  v_card_id      uuid;
begin
  -- Determine trigger type and extract IDs based on the context
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
      else
        return new;
      end if;
    end if;
  elsif TG_TABLE_NAME = 'card_labels' then
    v_card_id := new.card_id;
    select board_id into v_board_id from cards where id = new.card_id;
    
    if TG_OP = 'INSERT' then
      v_trigger_type := 'LABEL_ADDED';
    else
      return new;
    end if;
  else
    return new;
  end if;

  -- Find matching enabled automations for this board
  for v_automation in
    select * from automations
    where board_id = v_board_id
    and is_enabled = true
    and trigger_type = v_trigger_type
  loop
    -- Evaluate conditions
    if v_trigger_type = 'CARD_MOVED_TO_LIST' then
       if v_automation.trigger_config->>'list_id' is not null and (v_automation.trigger_config->>'list_id')::uuid != new.list_id then
          continue;
       end if;
    end if;

    -- Execute actions
    for v_action in select jsonb_array_elements(v_automation.actions)
    loop
      v_success := execute_automation_action(v_automation.id, v_card_id, v_action);
      
      -- Log execution
      insert into automation_logs (automation_id, card_id, success, actions_taken, error_message)
      values (v_automation.id, v_card_id, v_success, v_action, null);
    end loop;

    -- Update last run
    update automations set 
      run_count = run_count + 1,
      last_run_at = now()
    where id = v_automation.id;
  end loop;

  return new;
end;
$$;

-- ============================================================
-- TRIGGERS: Attach to tables
-- ============================================================

drop trigger if exists on_card_automation_trigger on cards;
create trigger on_card_automation_trigger
  after insert or update on cards
  for each row
  execute function process_automations();

drop trigger if exists on_label_automation_trigger on card_labels;
create trigger on_label_automation_trigger
  after insert on card_labels
  for each row
  execute function process_automations();
