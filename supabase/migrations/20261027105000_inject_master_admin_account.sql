-- ==============================================================================
-- MIGRATION: 20261027105000_inject_master_admin_account.sql
-- TANGGAL  : 2026-10-27
-- DESKRIPSI: Konfigurasi Akun Master Admin & Otomatisasi Hak Akses Khusus
--   1. Memperbarui trigger handle_new_user() agar mengenali email master admin
--   2. Mempromosikan akun diyanto2911@gmail.com jika sudah terdaftar
-- ==============================================================================

-- 1. Perbarui Fungsi Sinkronisasi Pengguna Baru (Trigger handle_new_user)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_first_user boolean;
  assigned_role text;
  extracted_name text;
  extracted_avatar text;
begin
  -- Cek apakah sistem belum memiliki pengguna terdaftar
  select not exists (select 1 from public.profiles limit 1) into is_first_user;
  
  -- Akun pertama ATAU email master otomatis mendapatkan role 'admin'
  if is_first_user or lower(new.email) = 'diyanto2911@gmail.com' then
    assigned_role := 'admin';
  else
    assigned_role := 'marketing';
  end if;

  -- Ekstrak nama lengkap dari metadata Google OAuth atau username email
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
    email = excluded.email,
    -- Jika email master, selalu pastikan role tetap 'admin' dan 'is_active = true'
    role = case 
      when lower(excluded.email) = 'diyanto2911@gmail.com' then 'admin' 
      else public.profiles.role 
    end,
    is_active = true;

  return new;
end;
$$ language plpgsql security definer;

-- 2. Promosikan akun jika sudah ada di tabel profiles
update public.profiles
set role = 'admin', is_active = true
where lower(email) = 'diyanto2911@gmail.com';

-- 3. Promosikan akun jika sudah ada di auth.users tetapi belum sinkron ke profiles
insert into public.profiles (user_id, full_name, email, role, is_active)
select 
  id, 
  coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
  email,
  'admin',
  true
from auth.users
where lower(email) = 'diyanto2911@gmail.com'
on conflict (user_id) do update set
  role = 'admin',
  is_active = true;
