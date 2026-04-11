-- ============================================================
-- FLOWBOARD — MIGRATION 005: SUPABASE STORAGE BUCKETS
-- Run after 004_pg_cron_jobs.sql
-- ============================================================

-- ============================================================
-- CREATE BUCKETS
-- ============================================================

-- User avatars — public read, users write to their own folder
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  102400,   -- 100 KB
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- Card attachments — public read
insert into storage.buckets (id, name, public, file_size_limit)
values (
  'card-attachments',
  'card-attachments',
  true,
  102400   -- 100 KB
)
on conflict (id) do update set public = true;

-- Board backgrounds — public read
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'board-backgrounds',
  'board-backgrounds',
  true,
  102400,  -- 100 KB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Client portal logos / branding — public read
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portal-logos',
  'portal-logos',
  true,
  102400,   -- 100 KB
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
on conflict (id) do nothing;

-- Workspace logos — public read
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'workspace-logos',
  'workspace-logos',
  true,
  102400,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
on conflict (id) do nothing;

-- ============================================================
-- AVATARS: Storage Policies
-- Path convention: avatars/{user_id}/{filename}
-- ============================================================

drop policy if exists "avatars: public read" on storage.objects;
create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars: authenticated upload to own folder" on storage.objects;
create policy "avatars: authenticated upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars: own update" on storage.objects;
create policy "avatars: own update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars: own delete" on storage.objects;
create policy "avatars: own delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- ATTACHMENTS: Storage Policies
-- Path convention: card-attachments/{board_id}/{card_id}/{filename}
-- ============================================================

drop policy if exists "attachments: public read" on storage.objects;
create policy "attachments: public read"
  on storage.objects for select
  using (bucket_id = 'card-attachments');

drop policy if exists "attachments: board member upload" on storage.objects;
create policy "attachments: board member upload"
  on storage.objects for insert
  with check (
    bucket_id = 'card-attachments'
    and auth.uid() is not null
    and exists (
      select 1 from board_members bm
      where bm.board_id = (storage.foldername(name))[1]::uuid
        and bm.user_id = auth.uid()
    )
  );

drop policy if exists "attachments: uploader delete" on storage.objects;
create policy "attachments: uploader delete"
  on storage.objects for delete
  using (
    bucket_id = 'card-attachments'
    and auth.uid() = owner
  );

-- ============================================================
-- BOARD BACKGROUNDS: Storage Policies
-- Path convention: board-backgrounds/{workspace_id}/{filename}
-- ============================================================

drop policy if exists "board-backgrounds: public read" on storage.objects;
create policy "board-backgrounds: public read"
  on storage.objects for select
  using (bucket_id = 'board-backgrounds');

drop policy if exists "board-backgrounds: workspace member upload" on storage.objects;
create policy "board-backgrounds: workspace member upload"
  on storage.objects for insert
  with check (
    bucket_id = 'board-backgrounds'
    and auth.uid() is not null
    and exists (
      select 1 from workspace_members wm
      where wm.workspace_id = (storage.foldername(name))[1]::uuid
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists "board-backgrounds: uploader delete" on storage.objects;
create policy "board-backgrounds: uploader delete"
  on storage.objects for delete
  using (
    bucket_id = 'board-backgrounds'
    and auth.uid() = owner
  );

-- ============================================================
-- PORTAL LOGOS: Storage Policies
-- Path convention: portal-logos/{board_id}/{filename}
-- ============================================================

drop policy if exists "portal-logos: public read" on storage.objects;
create policy "portal-logos: public read"
  on storage.objects for select
  using (bucket_id = 'portal-logos');

drop policy if exists "portal-logos: board admin upload" on storage.objects;
create policy "portal-logos: board admin upload"
  on storage.objects for insert
  with check (
    bucket_id = 'portal-logos'
    and auth.uid() is not null
    and exists (
      select 1 from board_members bm
      where bm.board_id = (storage.foldername(name))[1]::uuid
        and bm.user_id = auth.uid()
        and bm.role = 'ADMIN'
    )
  );

drop policy if exists "portal-logos: board admin delete" on storage.objects;
create policy "portal-logos: board admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'portal-logos'
    and (
      auth.uid() = owner
      or exists (
        select 1 from board_members bm
        where bm.board_id = (storage.foldername(name))[1]::uuid
          and bm.user_id = auth.uid()
          and bm.role = 'ADMIN'
      )
    )
  );

-- ============================================================
-- WORKSPACE LOGOS: Storage Policies
-- Path convention: workspace-logos/{workspace_id}/{filename}
-- ============================================================

drop policy if exists "workspace-logos: public read" on storage.objects;
create policy "workspace-logos: public read"
  on storage.objects for select
  using (bucket_id = 'workspace-logos');

drop policy if exists "workspace-logos: workspace admin upload" on storage.objects;
create policy "workspace-logos: workspace admin upload"
  on storage.objects for insert
  with check (
    bucket_id = 'workspace-logos'
    and auth.uid() is not null
    and exists (
      select 1 from workspace_members wm
      where wm.workspace_id = (storage.foldername(name))[1]::uuid
        and wm.user_id = auth.uid()
        and wm.role in ('OWNER', 'ADMIN')
    )
  );

drop policy if exists "workspace-logos: workspace admin delete" on storage.objects;
create policy "workspace-logos: workspace admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'workspace-logos'
    and (
      auth.uid() = owner
      or exists (
        select 1 from workspace_members wm
        where wm.workspace_id = (storage.foldername(name))[1]::uuid
          and wm.user_id = auth.uid()
          and wm.role in ('OWNER', 'ADMIN')
      )
    )
  );
