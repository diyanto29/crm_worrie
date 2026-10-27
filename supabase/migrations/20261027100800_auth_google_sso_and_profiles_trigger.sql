-- ==============================================================================
-- MIGRATION: 20261027100800_auth_google_sso_and_profiles_trigger.sql
-- TANGGAL  : 2026-10-27
-- DESKRIPSI: Otomatisasi Profil Akun Google SSO & Sinkronisasi auth.users ke public.profiles
--   1. Penambahan kolom email & is_active pada public.profiles
--   2. Penambahan Unique Constraint pada user_id
--   3. Fungsi trigger handle_new_user() untuk sinkronisasi otomatis nama & avatar Google
--   4. Trigger on_auth_user_created pada tabel auth.users
-- ==============================================================================

-- 1. Penambahan Kolom Email & Status Aktif pada Profiles
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'email') then
    alter table public.profiles add column email text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'is_active') then
    alter table public.profiles add column is_active boolean default true;
  end if;
end $$;

-- 2. Pastikan user_id memiliki constraint UNIQUE untuk penanganan ON CONFLICT
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_user_id_key' and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles add constraint profiles_user_id_key unique (user_id);
  end if;
exception
  when others then null;
end $$;

-- 3. Fungsi Sinkronisasi Profil Otomatis saat Pengguna Login via Google SSO
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_first_user boolean;
  assigned_role text;
  extracted_name text;
  extracted_avatar text;
begin
  -- Cek apakah sistem belum memiliki pengguna terdaftar (pengguna pertama menjadi 'admin')
  select not exists (select 1 from public.profiles limit 1) into is_first_user;
  
  if is_first_user then
    assigned_role := 'admin';
  else
    assigned_role := 'marketing';
  end if;

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

  -- Masukkan atau perbarui data profil
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

-- 4. Pasang Trigger pada Tabel auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Perbarui Kebijakan Akses (RLS) pada Profiles
alter table public.profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Allow read all profiles') then
    create policy "Allow read all profiles" on public.profiles for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Allow update profile') then
    create policy "Allow update profile" on public.profiles for update using (true);
  end if;
end $$;
