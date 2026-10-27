-- ==============================================================================
-- MIGRATION: 20261027105500_add_superadmin_role_and_anti_delete_protection.sql
-- TANGGAL  : 2026-10-27
-- DESKRIPSI: Penambahan Role 'superadmin' & Proteksi Database Anti-Delete
--   1. Pembaruan check constraint role pada public.profiles ('superadmin', 'admin', 'sales_manager', 'marketing')
--   2. Fungsi trigger protect_superadmin() untuk menolak delete/deactive/demote akun Superadmin
--   3. Trigger handle_new_user() otomatis menetapkan email master sebagai Superadmin
--   4. Promosi akun diyanto2911@gmail.com ke 'superadmin'
-- ==============================================================================

-- 1. Perbarui Constraint Role pada public.profiles
do $$
begin
  -- Hapus constraint lama jika ada
  alter table public.profiles drop constraint if exists profiles_role_check;
  -- Tambahkan constraint baru dengan 'superadmin'
  alter table public.profiles add constraint profiles_role_check 
    check (role in ('superadmin', 'admin', 'sales_manager', 'marketing'));
exception
  when others then null;
end $$;

-- 2. Fungsi Proteksi Database Anti-Delete & Anti-Deactivation Superadmin
create or replace function public.protect_superadmin()
returns trigger as $$
begin
  -- Cegah operasi DELETE pada akun superadmin
  if (tg_op = 'DELETE') then
    if old.role = 'superadmin' or lower(coalesce(old.email, '')) = 'diyanto2911@gmail.com' then
      raise exception 'AKSI DITOLAK: Akun Superadmin dilindungi sistem dan TIDAK BISA dihapus!';
    end if;
    return old;
  end if;

  -- Cegah operasi UPDATE yang menurunkan role superadmin atau menonaktifkannya
  if (tg_op = 'UPDATE') then
    if old.role = 'superadmin' or lower(coalesce(old.email, '')) = 'diyanto2911@gmail.com' then
      -- Cegah penurunan role
      if new.role <> 'superadmin' then
        raise exception 'AKSI DITOLAK: Role Superadmin tidak dapat diubah atau diturunkan!';
      end if;
      -- Cegah penonaktifan
      if new.is_active = false then
        raise exception 'AKSI DITOLAK: Akun Superadmin tidak dapat dinonaktifkan!';
      end if;
    end if;
    return new;
  end if;

  return null;
end;
$$ language plpgsql;

-- Pasang Trigger Proteksi pada Tabel public.profiles
drop trigger if exists trg_protect_superadmin on public.profiles;
create trigger trg_protect_superadmin
  before update or delete on public.profiles
  for each row execute function public.protect_superadmin();

-- 3. Perbarui Fungsi Sinkronisasi Trigger Google SSO (handle_new_user)
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
  
  -- Master account ATAU pengguna pertama otomatis menjadi 'superadmin'
  if is_first_user or lower(new.email) = 'diyanto2911@gmail.com' then
    assigned_role := 'superadmin';
  else
    assigned_role := 'marketing';
  end if;

  -- Ekstrak nama dari Google OAuth
  extracted_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  -- Ekstrak foto profil
  extracted_avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    null
  );

  -- Masukkan profil baru
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
    -- Jika email master, jamin selalu superadmin dan aktif
    role = case 
      when lower(excluded.email) = 'diyanto2911@gmail.com' then 'superadmin' 
      else public.profiles.role 
    end,
    is_active = true;

  return new;
end;
$$ language plpgsql security definer;

-- 4. Promosikan diyanto2911@gmail.com jika sudah ada di profiles
update public.profiles
set role = 'superadmin', is_active = true
where lower(email) = 'diyanto2911@gmail.com';
