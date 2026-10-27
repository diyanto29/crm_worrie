-- ==============================================================================
-- MIGRATION: 20261027114700_team_management_add_member_and_link_sso.sql
-- TANGGAL  : 2026-10-27
-- DESKRIPSI: Fitur Tambah Anggota Tim (Marketing / Admin) oleh Admin & Superadmin
--   1. Tambah Unique Index pada lower(email) tabel profiles
--   2. Update Trigger handle_new_user() untuk menautkan Google SSO ke profil pre-registered
--   3. Tambah Kebijakan RLS INSERT & DELETE pada tabel profiles
-- ==============================================================================

-- 1. Tambah Unique Index pada email (case-insensitive)
do $$
begin
  if not exists (
    select 1 from pg_indexes 
    where tablename = 'profiles' and indexname = 'profiles_email_lower_uidx'
  ) then
    create unique index profiles_email_lower_uidx on public.profiles (lower(email));
  end if;
end $$;

-- 2. Kebijakan RLS INSERT & DELETE pada Profiles
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Allow insert profile'
  ) then
    create policy "Allow insert profile" on public.profiles for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Allow delete profile'
  ) then
    create policy "Allow delete profile" on public.profiles for delete using (true);
  end if;
end $$;

-- 3. Update Fungsi handle_new_user() untuk menautkan akun yang didaftarkan Admin
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_first_user boolean;
  assigned_role text;
  extracted_name text;
  extracted_avatar text;
  existing_profile_id uuid;
begin
  -- Ekstrak nama dari metadata Google OAuth atau fallback ke username email
  extracted_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  -- Ekstrak foto profil dari metadata Google OAuth
  extracted_avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    null
  );

  -- A. Cek apakah email sudah didaftarkan sebelumnya oleh Admin/Superadmin
  select id into existing_profile_id 
  from public.profiles 
  where lower(email) = lower(new.email) 
  limit 1;

  if existing_profile_id is not null then
    -- Tautkan user_id ke profil yang telah didaftarkan sebelumnya
    -- Pertahankan role yang telah ditetapkan oleh Admin
    update public.profiles
    set 
      user_id = new.id,
      avatar_url = coalesce(extracted_avatar, avatar_url),
      full_name = coalesce(full_name, extracted_name),
      is_active = true
    where id = existing_profile_id;

    return new;
  end if;

  -- B. Jika profil belum terdaftar sebelumnya, tentukan role:
  -- Cek master admin
  if lower(new.email) = lower(coalesce(current_setting('app.settings.master_admin_email', true), 'diyanto2911@gmail.com')) then
    assigned_role := 'superadmin';
  else
    -- Pengguna pertama menjadi superadmin jika tabel masih kosong
    select not exists (select 1 from public.profiles limit 1) into is_first_user;
    if is_first_user then
      assigned_role := 'superadmin';
    else
      assigned_role := 'marketing';
    end if;
  end if;

  insert into public.profiles (user_id, full_name, email, role, avatar_url, is_active)
  values (
    new.id,
    extracted_name,
    new.email,
    assigned_role,
    extracted_avatar,
    true
  )
  on conflict (user_id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    email = excluded.email;

  return new;
end;
$$ language plpgsql security definer;
