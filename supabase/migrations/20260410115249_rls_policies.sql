-- ============================================================
-- FLOWBOARD — MIGRATION 002: ROW LEVEL SECURITY POLICIES
-- Run after 001_initial_schema.sql
-- ============================================================

-- Enable RLS on every table
alter table profiles              enable row level security;
alter table workspaces            enable row level security;
alter table workspace_members     enable row level security;
alter table workspace_invitations enable row level security;
alter table boards                enable row level security;
alter table board_members         enable row level security;
alter table board_stars           enable row level security;
alter table labels                enable row level security;
alter table lists                 enable row level security;
alter table cards                 enable row level security;
alter table card_assignments      enable row level security;
alter table card_labels           enable row level security;
alter table card_watchers         enable row level security;
alter table card_dependencies     enable row level security;
alter table checklists            enable row level security;
alter table checklist_items       enable row level security;
alter table attachments           enable row level security;
alter table comments              enable row level security;
alter table custom_fields         enable row level security;
alter table custom_field_values   enable row level security;
alter table time_entries          enable row level security;
alter table sprints               enable row level security;
alter table automations           enable row level security;
alter table automation_logs       enable row level security;
alter table notifications         enable row level security;
alter table activity_logs         enable row level security;
alter table templates             enable row level security;
alter table client_portals        enable row level security;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Is the current user a member of a given workspace?
create or replace function is_workspace_member(ws_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id
      and user_id = auth.uid()
  );
$$;

-- Is the current user a member of a given board?
create or replace function is_board_member(b_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from board_members
    where board_id = b_id
      and user_id = auth.uid()
  );
$$;

-- What is the current user's role in a given workspace?
create or replace function get_workspace_role(ws_id uuid)
returns workspace_member_role
language sql security definer stable
as $$
  select role from workspace_members
  where workspace_id = ws_id
    and user_id = auth.uid();
$$;

-- What is the current user's role on a given board?
create or replace function get_board_role(b_id uuid)
returns board_member_role
language sql security definer stable
as $$
  select role from board_members
  where board_id = b_id
    and user_id = auth.uid();
$$;

-- Is the current user a workspace admin or owner?
create or replace function is_workspace_admin(ws_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id
      and user_id = auth.uid()
      and role in ('OWNER', 'ADMIN')
  );
$$;

-- Is the current user a board admin?
create or replace function is_board_admin(b_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from board_members
    where board_id = b_id
      and user_id = auth.uid()
      and role = 'ADMIN'
  );
$$;

-- ============================================================
-- PROFILES
-- ============================================================

-- Users can always read their own profile
drop policy if exists "profiles: own read" on profiles;
create policy "profiles: own read"
  on profiles for select
  using (id = auth.uid());

-- Workspace peers can see each other's profiles
drop policy if exists "profiles: workspace peer read" on profiles;
create policy "profiles: workspace peer read"
  on profiles for select
  using (
    exists (
      select 1
      from workspace_members wm1
      join workspace_members wm2 on wm1.workspace_id = wm2.workspace_id
      where wm1.user_id = auth.uid()
        and wm2.user_id = profiles.id
    )
  );

-- Users can update only their own profile
drop policy if exists "profiles: own update" on profiles;
create policy "profiles: own update"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================
-- WORKSPACES
-- ============================================================

-- Members can view their workspaces
drop policy if exists "workspaces: member read" on workspaces;
create policy "workspaces: member read"
  on workspaces for select
  using (is_workspace_member(id) or owner_id = auth.uid());

-- Only owner can update workspace settings
drop policy if exists "workspaces: owner update" on workspaces;
create policy "workspaces: owner update"
  on workspaces for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Only owner can delete workspace
drop policy if exists "workspaces: owner delete" on workspaces;
create policy "workspaces: owner delete"
  on workspaces for delete
  using (owner_id = auth.uid());

-- Any authenticated user can create a workspace
drop policy if exists "workspaces: authenticated insert" on workspaces;
create policy "workspaces: authenticated insert"
  on workspaces for insert
  with check (auth.uid() is not null and owner_id = auth.uid());

-- ============================================================
-- WORKSPACE MEMBERS
-- ============================================================

-- Members can see other members of shared workspaces
drop policy if exists "workspace_members: member read" on workspace_members;
create policy "workspace_members: member read"
  on workspace_members for select
  using (is_workspace_member(workspace_id));

-- Admins can add new members
drop policy if exists "workspace_members: admin insert" on workspace_members;
create policy "workspace_members: admin insert"
  on workspace_members for insert
  with check (is_workspace_admin(workspace_id));

-- Admins can update member roles; members can remove themselves
drop policy if exists "workspace_members: admin update" on workspace_members;
create policy "workspace_members: admin update"
  on workspace_members for update
  using (is_workspace_admin(workspace_id));

drop policy if exists "workspace_members: self or admin delete" on workspace_members;
create policy "workspace_members: self or admin delete"
  on workspace_members for delete
  using (user_id = auth.uid() or is_workspace_admin(workspace_id));

-- ============================================================
-- WORKSPACE INVITATIONS
-- ============================================================

-- Admins can view invitations for their workspaces
drop policy if exists "workspace_invitations: admin read" on workspace_invitations;
create policy "workspace_invitations: admin read"
  on workspace_invitations for select
  using (is_workspace_admin(workspace_id) or invited_by = auth.uid());

-- Admins can create invitations
drop policy if exists "workspace_invitations: admin insert" on workspace_invitations;
create policy "workspace_invitations: admin insert"
  on workspace_invitations for insert
  with check (is_workspace_admin(workspace_id) and invited_by = auth.uid());

-- Admins can delete/revoke invitations
drop policy if exists "workspace_invitations: admin delete" on workspace_invitations;
create policy "workspace_invitations: admin delete"
  on workspace_invitations for delete
  using (is_workspace_admin(workspace_id));

-- ============================================================
-- BOARDS
-- ============================================================

-- Workspace members can see non-private boards;
-- board members can see private boards they belong to
drop policy if exists "boards: workspace read" on boards;
create policy "boards: workspace read"
  on boards for select
  using (
    is_workspace_member(workspace_id)
    and (
      visibility != 'PRIVATE'
      or is_board_member(id)
      or created_by = auth.uid()
    )
  );

-- Public boards are visible to everyone (client portals)
drop policy if exists "boards: public read" on boards;
create policy "boards: public read"
  on boards for select
  using (visibility = 'PUBLIC');

-- Board admins can update board settings
drop policy if exists "boards: board admin update" on boards;
create policy "boards: board admin update"
  on boards for update
  using (is_board_admin(id));

-- Workspace members can create boards
drop policy if exists "boards: workspace member insert" on boards;
create policy "boards: workspace member insert"
  on boards for insert
  with check (
    is_workspace_member(workspace_id)
    and created_by = auth.uid()
  );

-- Board admins and workspace admins can archive/delete boards
drop policy if exists "boards: admin delete" on boards;
create policy "boards: admin delete"
  on boards for delete
  using (is_board_admin(id) or is_workspace_admin(workspace_id));

-- ============================================================
-- BOARD MEMBERS
-- ============================================================

drop policy if exists "board_members: member read" on board_members;
create policy "board_members: member read"
  on board_members for select
  using (is_board_member(board_id));

drop policy if exists "board_members: admin insert" on board_members;
create policy "board_members: admin insert"
  on board_members for insert
  with check (is_board_admin(board_id) or is_workspace_admin(
    (select workspace_id from boards where id = board_id)
  ));

drop policy if exists "board_members: admin update" on board_members;
create policy "board_members: admin update"
  on board_members for update
  using (is_board_admin(board_id));

drop policy if exists "board_members: self or admin delete" on board_members;
create policy "board_members: self or admin delete"
  on board_members for delete
  using (user_id = auth.uid() or is_board_admin(board_id));

-- ============================================================
-- BOARD STARS
-- ============================================================
drop policy if exists "board_stars: own" on board_stars;
create policy "board_stars: own"
  on board_stars for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- LABELS
-- ============================================================

drop policy if exists "labels: board member access" on labels;
create policy "labels: board member access"
  on labels for all
  using (is_board_member(board_id))
  with check (is_board_member(board_id));

-- ============================================================
-- LISTS
-- ============================================================

drop policy if exists "lists: board member read" on lists;
create policy "lists: board member read"
  on lists for select
  using (
    is_board_member(board_id)
    or exists (
      select 1 from boards b
      where b.id = board_id and b.visibility = 'PUBLIC'
    )
  );

drop policy if exists "lists: board member insert" on lists;
create policy "lists: board member insert"
  on lists for insert
  with check (is_board_member(board_id));

drop policy if exists "lists: board member update" on lists;
create policy "lists: board member update"
  on lists for update
  using (is_board_member(board_id));

-- Only board admins can delete lists
drop policy if exists "lists: board admin delete" on lists;
create policy "lists: board admin delete"
  on lists for delete
  using (is_board_admin(board_id));

-- ============================================================
-- CARDS
-- ============================================================

drop policy if exists "cards: board member read" on cards;
create policy "cards: board member read"
  on cards for select
  using (
    is_board_member(board_id)
    or exists (
      select 1 from boards b
      where b.id = board_id and b.visibility = 'PUBLIC'
    )
  );

drop policy if exists "cards: board member insert" on cards;
create policy "cards: board member insert"
  on cards for insert
  with check (
    is_board_member(board_id)
    and created_by = auth.uid()
  );

drop policy if exists "cards: board member update" on cards;
create policy "cards: board member update"
  on cards for update
  using (is_board_member(board_id));

-- Board admins or card creators can delete
drop policy if exists "cards: admin or creator delete" on cards;
create policy "cards: admin or creator delete"
  on cards for delete
  using (is_board_admin(board_id) or created_by = auth.uid());

-- ============================================================
-- CARD ASSIGNMENTS
-- ============================================================

drop policy if exists "card_assignments: board member read" on card_assignments;
create policy "card_assignments: board member read"
  on card_assignments for select
  using (exists (
    select 1 from cards c
    join board_members bm on bm.board_id = c.board_id
    where c.id = card_assignments.card_id
      and bm.user_id = auth.uid()
  ));

drop policy if exists "card_assignments: board member insert" on card_assignments;
create policy "card_assignments: board member insert"
  on card_assignments for insert
  with check (exists (
    select 1 from cards c
    join board_members bm on bm.board_id = c.board_id
    where c.id = card_assignments.card_id
      and bm.user_id = auth.uid()
  ));

drop policy if exists "card_assignments: board member delete" on card_assignments;
create policy "card_assignments: board member delete"
  on card_assignments for delete
  using (exists (
    select 1 from cards c
    join board_members bm on bm.board_id = c.board_id
    where c.id = card_assignments.card_id
      and bm.user_id = auth.uid()
  ));

-- ============================================================
-- CARD LABELS
-- ============================================================

drop policy if exists "card_labels: board member access" on card_labels;
create policy "card_labels: board member access"
  on card_labels for all
  using (exists (
    select 1 from cards c
    join board_members bm on bm.board_id = c.board_id
    where c.id = card_labels.card_id
      and bm.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from cards c
    join board_members bm on bm.board_id = c.board_id
    where c.id = card_labels.card_id
      and bm.user_id = auth.uid()
  ));

-- ============================================================
-- CARD WATCHERS
-- ============================================================

drop policy if exists "card_watchers: board member read" on card_watchers;
create policy "card_watchers: board member read"
  on card_watchers for select
  using (exists (
    select 1 from cards c
    join board_members bm on bm.board_id = c.board_id
    where c.id = card_watchers.card_id
      and bm.user_id = auth.uid()
  ));

-- Users can only add/remove themselves as watchers
drop policy if exists "card_watchers: self manage" on card_watchers;
create policy "card_watchers: self manage"
  on card_watchers for insert
  with check (user_id = auth.uid() and exists (
    select 1 from cards c
    join board_members bm on bm.board_id = c.board_id
    where c.id = card_watchers.card_id
      and bm.user_id = auth.uid()
  ));

drop policy if exists "card_watchers: self delete" on card_watchers;
create policy "card_watchers: self delete"
  on card_watchers for delete
  using (user_id = auth.uid());

-- ============================================================
-- CARD DEPENDENCIES
-- ============================================================

drop policy if exists "card_dependencies: board member access" on card_dependencies;
create policy "card_dependencies: board member access"
  on card_dependencies for all
  using (exists (
    select 1 from cards c
    join board_members bm on bm.board_id = c.board_id
    where c.id = card_dependencies.blocking_card_id
      and bm.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from cards c
    join board_members bm on bm.board_id = c.board_id
    where c.id = card_dependencies.blocking_card_id
      and bm.user_id = auth.uid()
  ));

-- ============================================================
-- CHECKLISTS
-- ============================================================

drop policy if exists "checklists: board member access" on checklists;
create policy "checklists: board member access"
  on checklists for all
  using (exists (
    select 1 from cards c
    join board_members bm on bm.board_id = c.board_id
    where c.id = checklists.card_id
      and bm.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from cards c
    join board_members bm on bm.board_id = c.board_id
    where c.id = checklists.card_id
      and bm.user_id = auth.uid()
  ));

-- ============================================================
-- CHECKLIST ITEMS
-- ============================================================

drop policy if exists "checklist_items: board member access" on checklist_items;
create policy "checklist_items: board member access"
  on checklist_items for all
  using (exists (
    select 1 from checklists cl
    join cards c on c.id = cl.card_id
    join board_members bm on bm.board_id = c.board_id
    where cl.id = checklist_items.checklist_id
      and bm.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from checklists cl
    join cards c on c.id = cl.card_id
    join board_members bm on bm.board_id = c.board_id
    where cl.id = checklist_items.checklist_id
      and bm.user_id = auth.uid()
  ));

-- ============================================================
-- ATTACHMENTS
-- ============================================================

drop policy if exists "attachments: board member read" on attachments;
create policy "attachments: board member read"
  on attachments for select
  using (exists (
    select 1 from cards c
    join board_members bm on bm.board_id = c.board_id
    where c.id = attachments.card_id
      and bm.user_id = auth.uid()
  ));

drop policy if exists "attachments: board member insert" on attachments;
create policy "attachments: board member insert"
  on attachments for insert
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from cards c
      join board_members bm on bm.board_id = c.board_id
      where c.id = attachments.card_id
        and bm.user_id = auth.uid()
    )
  );

-- Uploader or board admin can delete attachments
drop policy if exists "attachments: uploader or admin delete" on attachments;
create policy "attachments: uploader or admin delete"
  on attachments for delete
  using (
    uploaded_by = auth.uid()
    or exists (
      select 1 from cards c
      where c.id = attachments.card_id
        and is_board_admin(c.board_id)
    )
  );

-- ============================================================
-- COMMENTS
-- ============================================================

drop policy if exists "comments: board member read" on comments;
create policy "comments: board member read"
  on comments for select
  using (exists (
    select 1 from cards c
    join board_members bm on bm.board_id = c.board_id
    where c.id = comments.card_id
      and bm.user_id = auth.uid()
  ));

drop policy if exists "comments: board member insert" on comments;
create policy "comments: board member insert"
  on comments for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from cards c
      join board_members bm on bm.board_id = c.board_id
      where c.id = comments.card_id
        and bm.user_id = auth.uid()
    )
  );

-- Authors can edit their own comments; board admins can edit any
drop policy if exists "comments: author or admin update" on comments;
create policy "comments: author or admin update"
  on comments for update
  using (
    author_id = auth.uid()
    or exists (
      select 1 from cards c
      where c.id = comments.card_id
        and is_board_admin(c.board_id)
    )
  );

drop policy if exists "comments: author or admin delete" on comments;
create policy "comments: author or admin delete"
  on comments for delete
  using (
    author_id = auth.uid()
    or exists (
      select 1 from cards c
      where c.id = comments.card_id
        and is_board_admin(c.board_id)
    )
  );

-- ============================================================
-- CUSTOM FIELDS
-- ============================================================

drop policy if exists "custom_fields: board member read" on custom_fields;
create policy "custom_fields: board member read"
  on custom_fields for select
  using (is_board_member(board_id));

drop policy if exists "custom_fields: board admin write" on custom_fields;
create policy "custom_fields: board admin write"
  on custom_fields for insert
  with check (is_board_admin(board_id));

drop policy if exists "custom_fields: board admin update" on custom_fields;
create policy "custom_fields: board admin update"
  on custom_fields for update
  using (is_board_admin(board_id));

drop policy if exists "custom_fields: board admin delete" on custom_fields;
create policy "custom_fields: board admin delete"
  on custom_fields for delete
  using (is_board_admin(board_id));

-- ============================================================
-- CUSTOM FIELD VALUES
-- ============================================================

drop policy if exists "custom_field_values: board member access" on custom_field_values;
create policy "custom_field_values: board member access"
  on custom_field_values for all
  using (exists (
    select 1 from cards c
    join board_members bm on bm.board_id = c.board_id
    where c.id = custom_field_values.card_id
      and bm.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from cards c
    join board_members bm on bm.board_id = c.board_id
    where c.id = custom_field_values.card_id
      and bm.user_id = auth.uid()
  ));

-- ============================================================
-- TIME ENTRIES
-- ============================================================

-- Users see their own entries; board members see all entries on cards they have access to
drop policy if exists "time_entries: own read" on time_entries;
create policy "time_entries: own read"
  on time_entries for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from cards c
      join board_members bm on bm.board_id = c.board_id
      where c.id = time_entries.card_id
        and bm.user_id = auth.uid()
    )
  );

drop policy if exists "time_entries: own insert" on time_entries;
create policy "time_entries: own insert"
  on time_entries for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from cards c
      join board_members bm on bm.board_id = c.board_id
      where c.id = time_entries.card_id
        and bm.user_id = auth.uid()
    )
  );

drop policy if exists "time_entries: own update" on time_entries;
create policy "time_entries: own update"
  on time_entries for update
  using (user_id = auth.uid());

drop policy if exists "time_entries: own delete" on time_entries;
create policy "time_entries: own delete"
  on time_entries for delete
  using (user_id = auth.uid());

-- ============================================================
-- SPRINTS
-- ============================================================

drop policy if exists "sprints: board member read" on sprints;
create policy "sprints: board member read"
  on sprints for select
  using (is_board_member(board_id));

drop policy if exists "sprints: board admin write" on sprints;
create policy "sprints: board admin write"
  on sprints for insert
  with check (is_board_admin(board_id));

drop policy if exists "sprints: board admin update" on sprints;
create policy "sprints: board admin update"
  on sprints for update
  using (is_board_admin(board_id));

drop policy if exists "sprints: board admin delete" on sprints;
create policy "sprints: board admin delete"
  on sprints for delete
  using (is_board_admin(board_id));

-- ============================================================
-- AUTOMATIONS
-- ============================================================

drop policy if exists "automations: board member read" on automations;
create policy "automations: board member read"
  on automations for select
  using (is_board_member(board_id));

drop policy if exists "automations: board admin write" on automations;
create policy "automations: board admin write"
  on automations for insert
  with check (is_board_admin(board_id) and created_by = auth.uid());

drop policy if exists "automations: board admin update" on automations;
create policy "automations: board admin update"
  on automations for update
  using (is_board_admin(board_id));

drop policy if exists "automations: board admin delete" on automations;
create policy "automations: board admin delete"
  on automations for delete
  using (is_board_admin(board_id));

-- ============================================================
-- AUTOMATION LOGS
-- ============================================================

drop policy if exists "automation_logs: board member read" on automation_logs;
create policy "automation_logs: board member read"
  on automation_logs for select
  using (exists (
    select 1 from automations a
    join board_members bm on bm.board_id = a.board_id
    where a.id = automation_logs.automation_id
      and bm.user_id = auth.uid()
  ));

-- Only service role inserts logs (via Edge Functions)
-- No user-facing insert policy needed

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

-- Users only see and manage their own notifications
drop policy if exists "notifications: own read" on notifications;
create policy "notifications: own read"
  on notifications for select
  using (user_id = auth.uid());

drop policy if exists "notifications: own update" on notifications;
create policy "notifications: own update"
  on notifications for update
  using (user_id = auth.uid());

drop policy if exists "notifications: own delete" on notifications;
create policy "notifications: own delete"
  on notifications for delete
  using (user_id = auth.uid());

-- Insert is done by service role / triggers, no user insert policy needed

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================

-- Board members can read activity for their boards
drop policy if exists "activity_logs: board member read" on activity_logs;
create policy "activity_logs: board member read"
  on activity_logs for select
  using (
    board_id is null
    or is_board_member(board_id)
  );

-- Inserts happen via service role triggers/functions

-- ============================================================
-- TEMPLATES
-- ============================================================

-- Public templates are visible to all authenticated users
drop policy if exists "templates: public read" on templates;
create policy "templates: public read"
  on templates for select
  using (is_public = true and auth.uid() is not null);

-- Workspace members see workspace templates
drop policy if exists "templates: workspace read" on templates;
create policy "templates: workspace read"
  on templates for select
  using (
    workspace_id is not null
    and is_workspace_member(workspace_id)
  );

drop policy if exists "templates: workspace member insert" on templates;
create policy "templates: workspace member insert"
  on templates for insert
  with check (
    created_by = auth.uid()
    and (workspace_id is null or is_workspace_member(workspace_id))
  );

drop policy if exists "templates: creator update" on templates;
create policy "templates: creator update"
  on templates for update
  using (created_by = auth.uid());

drop policy if exists "templates: creator delete" on templates;
create policy "templates: creator delete"
  on templates for delete
  using (created_by = auth.uid());

-- ============================================================
-- CLIENT PORTAL
-- ============================================================

-- Board admins manage client portals
drop policy if exists "client_portals: board admin read" on client_portals;
create policy "client_portals: board admin read"
  on client_portals for select
  using (is_board_admin(board_id));

drop policy if exists "client_portals: board admin write" on client_portals;
create policy "client_portals: board admin write"
  on client_portals for insert
  with check (is_board_admin(board_id));

drop policy if exists "client_portals: board admin update" on client_portals;
create policy "client_portals: board admin update"
  on client_portals for update
  using (is_board_admin(board_id));

drop policy if exists "client_portals: board admin delete" on client_portals;
create policy "client_portals: board admin delete"
  on client_portals for delete
  using (is_board_admin(board_id));

-- Public read for active portals (accessed by slug — no auth needed)
drop policy if exists "client_portals: public active read" on client_portals;
create policy "client_portals: public active read"
  on client_portals for select
  using (is_active = true);
