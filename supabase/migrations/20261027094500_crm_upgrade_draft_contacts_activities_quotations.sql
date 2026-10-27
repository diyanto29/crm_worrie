-- ==============================================================================
-- MIGRATION: 20261027094500_crm_upgrade_draft_contacts_activities_quotations.sql
-- TANGGAL  : 2026-10-27
-- DESKRIPSI: Pembaruan Skema CRM Worrie:
--   1. Pemisahan Draft Prospek Mentah (campaign_prospects) dari Pipeline CRM
--   2. Modul Multi-Kontak per Bisnis (lead_contacts: Kontak A, B, C)
--   3. Audit Trail & Timeline 360° (lead_activities)
--   4. Modul Quotation & Rincian Item Penawaran (quotations, quotation_items)
--   5. Modul Tugas & Pengingat Follow-up (lead_tasks)
--   6. Profil Tim Marketing & Ekstensi App Settings (profiles, app_settings)
-- ==============================================================================

-- 1. Ekstensi UUID
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 2. TABEL PROFIL TIM (MARKETING / SALES / ADMIN)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  role text default 'marketing' check (role in ('admin', 'sales_manager', 'marketing')),
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 3. UPDATE/ALTER TABEL CAMPAIGNS (KAMPANYE PENCARIAN)
-- ==============================================================================
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  keyword text not null,
  location text not null,
  max_results integer default 20,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tambah kolom baru jika tabel sudah ada dari skema lama
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'campaigns' and column_name = 'target_results') then
    alter table public.campaigns add column target_results integer default 20;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'campaigns' and column_name = 'status') then
    alter table public.campaigns add column status text default 'completed';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'campaigns' and column_name = 'created_by') then
    alter table public.campaigns add column created_by uuid references public.profiles(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'campaigns' and column_name = 'updated_at') then
    alter table public.campaigns add column updated_at timestamp with time zone default timezone('utc'::text, now()) not null;
  end if;
end $$;

-- ==============================================================================
-- 4. TABEL BARU: DRAFT PROSPEK MENTAH (CAMPAIGN PROSPECTS)
-- Menyimpan hasil scrape Google Maps sebelum dipilah & di-convert ke pipeline
-- ==============================================================================
create table if not exists public.campaign_prospects (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  business_name text not null,
  category text,
  address text,
  phone text,
  rating numeric(2,1),
  reviews_count integer default 0,
  has_website boolean default false,
  website_url text,
  gmaps_url text,
  prospect_score integer default 0,
  
  -- Status kurasi marketer: draft -> reviewed -> converted / disqualified
  curation_status text default 'draft' check (curation_status in ('draft', 'reviewed', 'disqualified', 'converted')),
  disqualified_reason text,
  
  -- Referensi setelah dikonversi ke pipeline
  converted_lead_id uuid,
  converted_at timestamp with time zone,
  converted_by uuid references public.profiles(id) on delete set null,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 5. UPDATE/ALTER TABEL LEADS (PIPELINE CRM AKTIF)
-- ==============================================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete set null,
  business_name text not null,
  address text,
  phone text,
  rating numeric(2,1),
  reviews_count integer default 0,
  has_website boolean default false,
  website_url text,
  gmaps_url text,
  status text default 'Belum dihubungi',
  deal_value numeric(14,2) default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tambah kolom-kolom baru untuk mendukung alur seleksi & pipeline deal
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'leads' and column_name = 'source_prospect_id') then
    alter table public.leads add column source_prospect_id uuid references public.campaign_prospects(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'leads' and column_name = 'brand_name') then
    alter table public.leads add column brand_name text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'leads' and column_name = 'primary_phone') then
    alter table public.leads add column primary_phone text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'leads' and column_name = 'prospect_score') then
    alter table public.leads add column prospect_score integer default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'leads' and column_name = 'stage') then
    alter table public.leads add column stage text default 'Belum dihubungi';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'leads' and column_name = 'target_close_date') then
    alter table public.leads add column target_close_date date;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'leads' and column_name = 'lost_reason') then
    alter table public.leads add column lost_reason text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'leads' and column_name = 'assigned_to') then
    alter table public.leads add column assigned_to uuid references public.profiles(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'leads' and column_name = 'updated_at') then
    alter table public.leads add column updated_at timestamp with time zone default timezone('utc'::text, now()) not null;
  end if;
end $$;

-- Sinkronkan primary_phone dari phone jika ada data lama
update public.leads set primary_phone = phone where primary_phone is null and phone is not null;

-- ==============================================================================
-- 6. TABEL BARU: MULTI-KONTAK (LEAD CONTACTS: KONTAK A, B, C)
-- ==============================================================================
create table if not exists public.lead_contacts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade not null,
  name text not null,
  role text default 'Owner' check (role in ('Owner', 'Direktur', 'Manajer Marketing', 'Staff Operasional', 'Admin', 'Lainnya')),
  phone text not null,
  email text,
  is_primary boolean default false,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 7. TABEL BARU: QUOTATION & QUOTATION ITEMS
-- ==============================================================================
create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade not null,
  contact_id uuid references public.lead_contacts(id) on delete set null,
  quote_number text unique not null,
  title text not null,
  status text default 'draft' check (status in ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  subtotal numeric(14,2) default 0 not null,
  discount numeric(14,2) default 0 not null,
  tax numeric(14,2) default 0 not null,
  grand_total numeric(14,2) default 0 not null,
  valid_until date not null,
  terms_conditions text,
  notes text,
  pdf_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid references public.quotations(id) on delete cascade not null,
  item_name text not null,
  description text,
  qty integer default 1 not null,
  unit_price numeric(14,2) not null,
  total_price numeric(14,2) not null,
  sort_order integer default 0
);

-- ==============================================================================
-- 8. TABEL BARU: LEAD ACTIVITIES (AUDIT TRAIL & TIMELINE 360° VIEW)
-- ==============================================================================
create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade not null,
  activity_type text not null check (
    activity_type in (
      'converted_from_draft',
      'contact_added',
      'contact_updated',
      'stage_changed',
      'whatsapp_sent',
      'phone_call',
      'meeting',
      'note_created',
      'quotation_created',
      'quotation_sent',
      'deal_value_changed'
    )
  ),
  title text not null,
  description text,
  metadata jsonb default '{}'::jsonb,
  actor_name text default 'Marketing',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 9. TABEL BARU: LEAD TASKS (REMINDER & NEXT ACTION)
-- ==============================================================================
create table if not exists public.lead_tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade not null,
  title text not null,
  due_date timestamp with time zone not null,
  is_completed boolean default false,
  completed_at timestamp with time zone,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 10. UPDATE TABEL APP SETTINGS & MESSAGE TEMPLATES
-- ==============================================================================
create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  gateway_provider text default 'xsender',
  api_key text,
  sender_number text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'app_settings' and column_name = 'agency_name') then
    alter table public.app_settings add column agency_name text default 'Worrie Digital Agency';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'app_settings' and column_name = 'agency_address') then
    alter table public.app_settings add column agency_address text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'app_settings' and column_name = 'agency_email') then
    alter table public.app_settings add column agency_email text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'app_settings' and column_name = 'agency_phone') then
    alter table public.app_settings add column agency_phone text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'app_settings' and column_name = 'agency_logo_url') then
    alter table public.app_settings add column agency_logo_url text;
  end if;
end $$;

-- ==============================================================================
-- 11. INDEKS PERFORMA QUERY
-- ==============================================================================
create index if not exists idx_campaign_prospects_camp on public.campaign_prospects(campaign_id);
create index if not exists idx_campaign_prospects_curation on public.campaign_prospects(curation_status);
create index if not exists idx_leads_stage on public.leads(stage);
create index if not exists idx_leads_assigned on public.leads(assigned_to);
create index if not exists idx_lead_contacts_lead on public.lead_contacts(lead_id);
create index if not exists idx_lead_activities_lead on public.lead_activities(lead_id, created_at desc);
create index if not exists idx_quotations_lead on public.quotations(lead_id);
create index if not exists idx_lead_tasks_due on public.lead_tasks(due_date, is_completed);

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
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

-- Buat policy jika belum ada
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Allow all profiles') then
    create policy "Allow all profiles" on public.profiles for all using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'campaign_prospects' and policyname = 'Allow all campaign_prospects') then
    create policy "Allow all campaign_prospects" on public.campaign_prospects for all using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_contacts' and policyname = 'Allow all lead_contacts') then
    create policy "Allow all lead_contacts" on public.lead_contacts for all using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quotations' and policyname = 'Allow all quotations') then
    create policy "Allow all quotations" on public.quotations for all using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quotation_items' and policyname = 'Allow all quotation_items') then
    create policy "Allow all quotation_items" on public.quotation_items for all using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_activities' and policyname = 'Allow all lead_activities') then
    create policy "Allow all lead_activities" on public.lead_activities for all using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'lead_tasks' and policyname = 'Allow all lead_tasks') then
    create policy "Allow all lead_tasks" on public.lead_tasks for all using (true);
  end if;
end $$;
