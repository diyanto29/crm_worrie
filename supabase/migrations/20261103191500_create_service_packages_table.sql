-- =========================================================================
-- MIGRATION: 20261103191500_create_service_packages_table.sql
-- Description: Tabel Katalog & Daftar Harga Paket Transformasi Digital Sekolah
-- (Website, PPDB Online, Absensi Mobile Guru + HRIS, Bundling & Add-on)
-- =========================================================================

create table if not exists public.service_packages (
  id uuid primary key default gen_random_uuid(),
  category text not null, -- 'website_ppdb' | 'attendance_hris' | 'bundling' | 'addon'
  category_name text not null, -- 'Website & PPDB Online', 'Absensi & HRIS Guru', dll.
  name text not null,
  badge text, -- 'Starter', 'Populer', 'Best Value', 'Enterprise', dll.
  target_audience text, -- 'TK / PAUD / Kursus Kecil', 'SD / SMP', 'SMA / SMK', dll.
  description text,
  setup_fee numeric(15,2) not null default 0,
  annual_fee numeric(15,2) not null default 0,
  annual_fee_notes text,
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indeks Kategori & Urutan
create index if not exists idx_service_packages_cat on public.service_packages(category);
create index if not exists idx_service_packages_sort on public.service_packages(sort_order);

-- Enable Row Level Security (RLS)
alter table public.service_packages enable row level security;

-- Policies Idempotent
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'service_packages' and policyname = 'Allow read service_packages') then
    create policy "Allow read service_packages" on public.service_packages for select using (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'service_packages' and policyname = 'Allow insert service_packages') then
    create policy "Allow insert service_packages" on public.service_packages for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'service_packages' and policyname = 'Allow update service_packages') then
    create policy "Allow update service_packages" on public.service_packages for update using (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'service_packages' and policyname = 'Allow delete service_packages') then
    create policy "Allow delete service_packages" on public.service_packages for delete using (true);
  end if;
end $$;

-- Trigger updated_at
create or replace function public.handle_service_packages_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_service_packages_updated_at on public.service_packages;
create trigger set_service_packages_updated_at
  before update on public.service_packages
  for each row execute function public.handle_service_packages_updated_at();

-- Seed Data Awal Resmi Sesuai Proposal (Mudahkan.online × Mas Diyanto & Working Remotely Indonesia)
insert into public.service_packages (
  category, category_name, name, badge, target_audience, description, setup_fee, annual_fee, annual_fee_notes, features, is_featured, sort_order
)
select * from (
  values 
    -- 1. Website & PPDB Online
    (
      'website_ppdb',
      'Website & PPDB Online Sekolah',
      'Basic (Profile)',
      'Starter',
      'TK / PAUD / Kursus Kecil',
      'Website profil resmi responsif untuk branding dan sarana informasi publik dasar institusi.',
      3000000::numeric,
      1200000::numeric,
      'Domain .sch.id / .com (gratis tahun 1) & Cloud Hosting',
      '["Website Profil & Responsif (Mobile & Desktop)", "Domain .sch.id / .com gratis thn 1", "Sistem PPDB via Form WhatsApp", "Batas revisi desain 2 kali", "Panduan operasional website"]'::jsonb,
      false,
      1
    ),
    (
      'website_ppdb',
      'Website & PPDB Online Sekolah',
      'Silver (PPDB Online)',
      'Populer',
      'SD / SMP / MTs Berkembang',
      'Website modern dilengkapi sistem pendaftaran siswa baru dan formulir upload berkas online.',
      5500000::numeric,
      1800000::numeric,
      'Domain .sch.id / .com (gratis tahun 1) & High-Speed Hosting',
      '["Website Desain Modern & Responsif", "Domain .sch.id / .com gratis thn 1", "Formulir Pendaftaran & Upload Berkas PPDB", "Modul Berita & Informasi Sekolah", "Batas revisi desain 3 kali", "Pelatihan admin sekolah"]'::jsonb,
      true,
      2
    ),
    (
      'website_ppdb',
      'Website & PPDB Online Sekolah',
      'Premium (Official Portal)',
      'Eksklusif',
      'SMA / SMK / Sekolah Besar',
      'Portal sekolah berstandar tinggi dengan PPDB terpadu, multi-kategori informasi, dan E-Library.',
      9000000::numeric,
      3000000::numeric,
      'Domain .sch.id & High-Speed Cloud Dedicated',
      '["Custom Desain Eksklusif Institusi", "Domain .sch.id (High-Speed Cloud)", "Sistem PPDB Lanjutan & Pengumuman Hasil", "Berita Multi-Kategori & Modul E-Library", "Batas revisi desain 5 kali", "Dukungan teknis prioritas & backup otomatis"]'::jsonb,
      false,
      3
    ),

    -- 2. Teacher & Staff Attendance System (Mobile App + HRIS)
    (
      'attendance_hris',
      'Teacher & Staff Attendance (Mobile App + HRIS)',
      'Basic (Mobile App Absensi)',
      'Starter',
      'Sekolah kecil / kursus',
      'Aplikasi mobile praktis untuk absensi harian guru dan staf dengan rekap otomatis.',
      6000000::numeric,
      2500000::numeric,
      'Server database terisolasi & pemeliharaan berkala',
      '["Aplikasi Android Guru (Check-in / Check-out)", "Rekap bulanan kehadiran (PDF / Excel)", "Database mandiri terisolasi per sekolah", "Hemat kuota dan ringan"]'::jsonb,
      false,
      4
    ),
    (
      'attendance_hris',
      'Teacher & Staff Attendance (Mobile App + HRIS)',
      'Silver (Geofencing + Cuti)',
      'Best Seller',
      'Sekolah menengah / berkembang',
      'Sistem absensi dengan validasi radius lokasi GPS dan foto selfie serta pengajuan izin/cuti online.',
      10000000::numeric,
      4500000::numeric,
      'Termasuk cloud server & storage foto selfie terkompresi',
      '["Aplikasi Absensi + Validasi Radius GPS (Geofencing)", "Validasi Foto Selfie (Kompresi Otomatis Hemat Storage)", "Modul Pengajuan & Approval Cuti / Izin Online", "Web Panel Approval & Notifikasi Admin", "Database mandiri terisolasi per sekolah"]'::jsonb,
      true,
      5
    ),
    (
      'attendance_hris',
      'Teacher & Staff Attendance (Mobile App + HRIS)',
      'Premium (Enterprise HRIS + Dashboard)',
      'Enterprise',
      'SMA / SMK / Yayasan Pendidikan',
      'Aplikasi absensi custom branding logo institusi, manajemen shift lengkap, dan dashboard eksekutif.',
      15000000::numeric,
      7500000::numeric,
      'High-performance cloud server dedicated & garansi uptime',
      '["Custom Branding Aplikasi (Logo & Warna Sekolah)", "Validasi GPS & Foto Selfie Kompresi Otomatis", "Manajemen Cuti, Shift Kerja, & Izin Lengkap", "Dashboard Eksekutif untuk Yayasan / Kepala Sekolah", "Database Terisolasi & Enkripsi Data Aman", "Dukungan teknis prioritas & SLA"]'::jsonb,
      false,
      6
    ),

    -- 3. Paket Bundling Sekolah Digital
    (
      'bundling',
      'Paket Bundling Sekolah Digital',
      'Sekolah Digital Starter',
      'Hemat Rp 500rb',
      'Sekolah Dasar / Kursus Mandiri',
      'Kombinasi Website Basic + Absensi Mobile Basic untuk solusi awal terpadu.',
      8500000::numeric,
      3700000::numeric,
      'Perpanjangan gabungan domain, hosting, dan server absensi',
      '["Website Basic (Profile & Form WA)", "Mobile App Absensi Basic (Check-in/out)", "Rekap kehadiran bulanan Excel/PDF", "Domain & Hosting tahun pertama"]'::jsonb,
      false,
      7
    ),
    (
      'bundling',
      'Paket Bundling Sekolah Digital',
      'Sekolah Digital Plus',
      'Paling Diminati',
      'Sekolah Menengah / SMP / MTs',
      'Kombinasi Website Silver (PPDB Online) + Absensi Silver (Geofencing GPS & Cuti Online).',
      14500000::numeric,
      6300000::numeric,
      'Perpanjangan hosting PPDB dan cloud storage absensi foto',
      '["Website Silver (Form PPDB & Berita)", "Mobile App Absensi GPS + Selfie Kompresi", "Modul Cuti & Izin Online Approval", "Pelatihan gabungan operator & guru", "Hemat investasi Rp 1.000.000"]'::jsonb,
      true,
      8
    ),
    (
      'bundling',
      'Paket Bundling Sekolah Digital',
      'Sekolah Digital Premium',
      'Solusi Lengkap',
      'SMA / SMK / Yayasan Besar',
      'Solusi transformasi digital menyeluruh: Portal Website Premium + Enterprise HRIS Absensi Mobile.',
      22000000::numeric,
      10500000::numeric,
      'High-performance dedicated server & storage terpadu',
      '["Website Portal Premium + PPDB + E-Library", "Enterprise HRIS Absensi Custom Brand Sekolah", "Dashboard Eksekutif Yayasan & Kepala Sekolah", "Manajemen shift, cuti & lembur lengkap", "Prioritas SLA & Pendampingan intensif", "Hemat investasi Rp 2.000.000"]'::jsonb,
      false,
      9
    ),

    -- 4. Add-on Layanan
    (
      'addon',
      'Add-on & Fitur Tambahan',
      'Modul Payroll Terintegrasi',
      'Add-on HR',
      'Yayasan & Sekolah Swasta',
      'Perhitungan gaji guru/staf otomatis, potongan keterlambatan, dan slip gaji digital terintegrasi absensi.',
      4500000::numeric,
      1500000::numeric,
      'Dukungan update regulasi & backup slip gaji',
      '["Perhitungan otomatis gaji pokok & tunjangan", "Potongan keterlambatan otomatis dari data absensi", "Generate & kirim slip gaji digital (PDF / WhatsApp)", "Laporan pengeluaran gaji yayasan"]'::jsonb,
      false,
      10
    ),
    (
      'addon',
      'Add-on & Fitur Tambahan',
      'Kampus / Unit Tambahan',
      'Multi-Cabang',
      'Yayasan dengan banyak lokasi/kampus',
      'Penambahan unit kampus atau cabang baru dalam satu yayasan (per kampus).',
      2500000::numeric,
      1000000::numeric,
      'Per cabang / unit tambahan per tahun',
      '["Integrasi multi-cabang dalam 1 dashboard yayasan", "Pengaturan geofencing terpisah per kampus", "Rekap terpisah dan konsolidasi yayasan"]'::jsonb,
      false,
      11
    )
) as t(category, category_name, name, badge, target_audience, description, setup_fee, annual_fee, annual_fee_notes, features, is_featured, sort_order)
where not exists (select 1 from public.service_packages limit 1);
