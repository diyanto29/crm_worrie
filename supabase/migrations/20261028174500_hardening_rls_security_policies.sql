-- ==============================================================================
-- MIGRATION: 20261028174500_hardening_rls_security_policies.sql
-- TANGGAL  : 2026-10-28
-- DESKRIPSI: Hardening Row Level Security (RLS) & Anti-Privilege Escalation
--   1. Memperketat RLS: Hanya user terautentikasi (auth.role() = 'authenticated') 
--      yang dapat membaca dan menulis data CRM.
--   2. Pencegahan Eskalasi Hak Akses (Privilege Escalation): User non-admin tidak 
--      bisa mengubah kolom 'role' pada profilnya sendiri.
--   3. Proteksi Tabel Sensitif (app_settings & profiles): Hanya Admin/Superadmin 
--      yang dapat memodifikasi pengaturan gateway & anggota tim lain.
-- ==============================================================================

-- 1. Pastikan RLS Aktif pada Seluruh Tabel
alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_prospects enable row level security;
alter table public.leads enable row level security;
alter table public.lead_contacts enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.lead_activities enable row level security;
alter table public.lead_tasks enable row level security;
alter table public.message_templates enable row level security;
alter table public.app_settings enable row level security;

-- 2. Fungsi Pembantu untuk Mengecek Apakah Pemanggil Adalah Admin atau Superadmin
create or replace function public.is_admin_or_superadmin()
returns boolean as $$
declare
  user_role text;
  user_email text;
begin
  -- Cek email dari token auth pengguna
  user_email := auth.jwt()->>'email';
  if lower(coalesce(user_email, '')) = 'diyanto2911@gmail.com' then
    return true;
  end if;

  -- Cek role di tabel profiles
  select role into user_role 
  from public.profiles 
  where user_id = auth.uid() 
  limit 1;

  return user_role in ('admin', 'superadmin');
end;
$$ language plpgsql security definer;

-- 3. Trigger Pencegahan Modifikasi Role Sendiri (Anti-Self Privilege Escalation)
create or replace function public.prevent_self_role_escalation()
returns trigger as $$
begin
  -- Jika role diubah oleh pengguna yang bukan Admin/Superadmin
  if (new.role is distinct from old.role) then
    if not public.is_admin_or_superadmin() then
      raise exception 'AKSI DITOLAK: Anda tidak memiliki izin untuk mengubah hak akses / role!';
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_prevent_self_role_escalation on public.profiles;
create trigger trg_prevent_self_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_self_role_escalation();

-- 4. Penguatan Kebijakan RLS (Idempotent: Drop & Recreate)
do $$
begin
  -- Hapus policy permissive 'using (true)' yang lama jika ada
  drop policy if exists "Allow all profiles" on public.profiles;
  drop policy if exists "Allow all campaign_prospects" on public.campaign_prospects;
  drop policy if exists "Allow all lead_contacts" on public.lead_contacts;
  drop policy if exists "Allow all quotations" on public.quotations;
  drop policy if exists "Allow all quotation_items" on public.quotation_items;
  drop policy if exists "Allow all lead_activities" on public.lead_activities;
  drop policy if exists "Allow all lead_tasks" on public.lead_tasks;

  -- A. Kebijakan Tabel PROFILES
  -- Siapapun yang terautentikasi dapat melihat daftar profil tim
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Authenticated view profiles') then
    create policy "Authenticated view profiles" on public.profiles
      for select to authenticated using (true);
  end if;

  -- Pengguna dapat mengupdate profilnya sendiri (nama, avatar, phone), atau Admin dapat mengupdate profil siapapun
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Update own profile or admin') then
    create policy "Update own profile or admin" on public.profiles
      for update to authenticated using (
        user_id = auth.uid() or public.is_admin_or_superadmin()
      );
  end if;

  -- B. Kebijakan Tabel APP_SETTINGS
  -- Semua user terautentikasi dapat melihat setting agensi, tapi hanya admin yang boleh mengubah API key
  drop policy if exists "Allow all app_settings" on public.app_settings;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'app_settings' and policyname = 'Authenticated view settings') then
    create policy "Authenticated view settings" on public.app_settings
      for select to authenticated using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'app_settings' and policyname = 'Admin manage settings') then
    create policy "Admin manage settings" on public.app_settings
      for all to authenticated using (
        public.is_admin_or_superadmin()
      );
  end if;

  -- C. Kebijakan Tabel CRM (Hanya user terautentikasi yang dapat mengakses)
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'campaigns' and policyname = 'Authenticated manage campaigns') then
    create policy "Authenticated manage campaigns" on public.campaigns
      for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'campaign_prospects' and policyname = 'Authenticated manage prospects') then
    create policy "Authenticated manage prospects" on public.campaign_prospects
      for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'leads' and policyname = 'Authenticated manage leads') then
    create policy "Authenticated manage leads" on public.leads
      for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_contacts' and policyname = 'Authenticated manage contacts') then
    create policy "Authenticated manage contacts" on public.lead_contacts
      for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quotations' and policyname = 'Authenticated manage quotations') then
    create policy "Authenticated manage quotations" on public.quotations
      for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quotation_items' and policyname = 'Authenticated manage quotation items') then
    create policy "Authenticated manage quotation items" on public.quotation_items
      for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_activities' and policyname = 'Authenticated manage activities') then
    create policy "Authenticated manage activities" on public.lead_activities
      for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_tasks' and policyname = 'Authenticated manage tasks') then
    create policy "Authenticated manage tasks" on public.lead_tasks
      for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'message_templates' and policyname = 'Authenticated manage templates') then
    create policy "Authenticated manage templates" on public.message_templates
      for all to authenticated using (true) with check (true);
  end if;
end $$;
