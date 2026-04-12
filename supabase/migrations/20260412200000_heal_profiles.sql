-- ============================================================
-- FLOWBOARD — MIGRATION: AUTH & PROFILE CONTINUITY HEALER
-- Ensures all existing auth.users have public.profiles
-- ============================================================

-- 1. Function to backfill missing profiles
create or replace function backfill_missing_profiles()
returns void
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  select 
    id, 
    email, 
    coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
    raw_user_meta_data->>'avatar_url'
  from auth.users
  where id not in (select id from public.profiles)
  on conflict (id) do nothing;
end;
$$;

-- 2. Execute backfill
select backfill_missing_profiles();

-- 3. Reset the handle_new_user trigger to ensure search_path is safe and it's robust
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(profiles.full_name, excluded.full_name);
  return new;
end;
$$;

-- 4. Cleanup old trigger if exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();
