-- ==============================================================================
-- MIGRATION: 20261028175500_fix_leads_assigned_to_type_and_rls.sql
-- TANGGAL  : 2026-10-28
-- DESKRIPSI: Perbaikan Tipe Kolom assigned_to & RLS Policy pada leads
--   1. Mengubah tipe kolom leads.assigned_to dari UUID menjadi TEXT agar dapat
--      menampung nama staf PIC (misal "Diyanto", "Tim Sales Worrie") tanpa
--      terkena error "invalid input syntax for type uuid".
--   2. Memastikan policy RLS pada tabel operasional CRM (leads, lead_contacts,
--      lead_activities, campaign_prospects) mengizinkan akses operasional penuh
--      bagi pengguna web terautentikasi & koneksi klien anon.
-- ==============================================================================

-- 1. Hapus Foreign Key Constraint pada assigned_to jika ada
do $$
begin
  alter table public.leads drop constraint if exists leads_assigned_to_fkey;
exception when others then
  null;
end $$;

-- 2. Ubah tipe data kolom assigned_to menjadi TEXT
alter table public.leads alter column assigned_to type text using assigned_to::text;

-- 3. Pastikan kolom-kolom leads memiliki default yang aman
alter table public.leads alter column status set default 'Belum dihubungi';
alter table public.leads alter column deal_value set default 0;

-- 4. Perbaiki RLS Policy pada public.leads
alter table public.leads enable row level security;
drop policy if exists "Authenticated manage leads" on public.leads;
drop policy if exists "Allow all leads" on public.leads;
create policy "Allow all leads" on public.leads
  for all to public using (true) with check (true);

-- 5. Perbaiki RLS Policy pada public.lead_contacts
alter table public.lead_contacts enable row level security;
drop policy if exists "Authenticated manage contacts" on public.lead_contacts;
drop policy if exists "Allow all lead_contacts" on public.lead_contacts;
create policy "Allow all lead_contacts" on public.lead_contacts
  for all to public using (true) with check (true);

-- 6. Perbaiki RLS Policy pada public.lead_activities
alter table public.lead_activities enable row level security;
drop policy if exists "Authenticated manage activities" on public.lead_activities;
drop policy if exists "Allow all lead_activities" on public.lead_activities;
create policy "Allow all lead_activities" on public.lead_activities
  for all to public using (true) with check (true);

-- 7. Perbaiki RLS Policy pada public.campaign_prospects
alter table public.campaign_prospects enable row level security;
drop policy if exists "Authenticated manage prospects" on public.campaign_prospects;
drop policy if exists "Allow all campaign_prospects" on public.campaign_prospects;
create policy "Allow all campaign_prospects" on public.campaign_prospects
  for all to public using (true) with check (true);

-- 8. Perbaiki RLS Policy pada public.campaigns
alter table public.campaigns enable row level security;
drop policy if exists "Authenticated manage campaigns" on public.campaigns;
drop policy if exists "Allow all campaigns" on public.campaigns;
create policy "Allow all campaigns" on public.campaigns
  for all to public using (true) with check (true);
