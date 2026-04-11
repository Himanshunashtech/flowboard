-- Add policy to allow board members to log manual test runs
drop policy if exists "automation_logs: board member insert" on automation_logs;
create policy "automation_logs: board member insert"
  on automation_logs for insert
  with check (exists (
    select 1 from automations a
    join board_members bm on bm.board_id = a.board_id
    where a.id = automation_logs.automation_id
      and bm.user_id = auth.uid()
  ));
