-- ============================================================
-- CARD COVERS STORAGE BUCKET
-- ============================================================

-- 1. Create the bucket
insert into storage.buckets (id, name, public)
values ('card-covers', 'card-covers', true)
on conflict (id) do nothing;

-- 2. Performance policy: Anyone can view covers
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'card-covers' );

-- 3. Security policy: Authenticated users can upload
create policy "Authenticated users can upload covers"
on storage.objects for insert
with check (
  bucket_id = 'card-covers' 
  and auth.role() = 'authenticated'
);

-- 4. Security policy: Users can delete their own covers
create policy "Users can delete their own covers"
on storage.objects for delete
using (
  bucket_id = 'card-covers'
  and auth.uid() = owner
);
