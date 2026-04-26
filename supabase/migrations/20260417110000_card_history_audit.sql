-- ============================================================
-- FLOWBOARD — MIGRATION: CARD HISTORY AUDIT LOGGING
-- ============================================================

-- 1. Create the card_history table
create table if not exists public.card_history (
    id          uuid primary key default uuid_generate_v4(),
    card_id     uuid not null references public.cards(id) on delete cascade,
    field       text not null,
    old_value   jsonb,
    new_value   jsonb,
    changed_by  uuid references public.profiles(id),
    created_at  timestamptz default now()
);

-- 2. Index for performance
create index if not exists idx_card_history_card_id on public.card_history(card_id);

-- 3. Enable RLS
alter table public.card_history enable row level security;

-- 4. RLS Policy: Board members can view history
create policy "card_history: board member read"
    on public.card_history for select
    using (exists (
        select 1 from cards c
        join board_members bm on bm.board_id = c.board_id
        where c.id = card_history.card_id
          and bm.user_id = auth.uid()
    ));

-- 5. Trigger function to audit card changes
create or replace function process_card_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    -- Track Title
    if (tg_op = 'UPDATE') then
        if old.title is distinct from new.title then
            insert into card_history (card_id, field, old_value, new_value, changed_by)
            values (new.id, 'title', to_jsonb(old.title), to_jsonb(new.title), auth.uid());
        end if;
        
        -- Track Due Date
        if old.due_date is distinct from new.due_date then
            insert into card_history (card_id, field, old_value, new_value, changed_by)
            values (new.id, 'due_date', to_jsonb(old.due_date), to_jsonb(new.due_date), auth.uid());
        end if;

        -- Track Priority
        if old.priority is distinct from new.priority then
            insert into card_history (card_id, field, old_value, new_value, changed_by)
            values (new.id, 'priority', to_jsonb(old.priority), to_jsonb(new.priority), auth.uid());
        end if;

        -- Track Completion
        if old.is_completed is distinct from new.is_completed then
            insert into card_history (card_id, field, old_value, new_value, changed_by)
            values (new.id, 'is_completed', to_jsonb(old.is_completed), to_jsonb(new.is_completed), auth.uid());
        end if;

        -- Track List (Move)
        if old.list_id is distinct from new.list_id then
            insert into card_history (card_id, field, old_value, new_value, changed_by)
            values (new.id, 'list_id', to_jsonb(old.list_id), to_jsonb(new.list_id), auth.uid());
        end if;

        -- Track Story Points
        if old.story_points is distinct from new.story_points then
            insert into card_history (card_id, field, old_value, new_value, changed_by)
            values (new.id, 'story_points', to_jsonb(old.story_points), to_jsonb(new.story_points), auth.uid());
        end if;

        -- Track Estimated Hours
        if old.estimated_hours is distinct from new.estimated_hours then
            insert into card_history (card_id, field, old_value, new_value, changed_by)
            values (new.id, 'estimated_hours', to_jsonb(old.estimated_hours), to_jsonb(new.estimated_hours), auth.uid());
        end if;
    end if;

    return new;
end;
$$;

-- 6. Attach trigger
drop trigger if exists on_card_audit on cards;
create trigger on_card_audit
    after update on cards
    for each row
    execute function process_card_audit();
