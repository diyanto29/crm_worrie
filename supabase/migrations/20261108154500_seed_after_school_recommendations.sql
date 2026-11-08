-- =========================================================================
-- MIGRATION: 20261108154500_seed_after_school_recommendations.sql
-- Description: Injeksi Paket Rekomendasi Lanjutan After School Program Worrie.id
-- (1 Year Career Pathway, B2B School Partnership, Holiday Bootcamp, dan Domain Portfolio Siswa)
-- =========================================================================

-- Pastikan tabel service_packages ada
create table if not exists public.service_packages (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  category_name text not null,
  name text not null,
  badge text,
  target_audience text,
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

-- Injeksi Paket Rekomendasi After School & Kemitraan Sekolah
insert into public.service_packages (
  category, category_name, name, badge, target_audience, description, setup_fee, annual_fee, annual_fee_notes, features, is_featured, sort_order
)
select * from (
  values 
    -- 1. Full Academic Year (4 Terms / 1 Tahun)
    (
      'after_school',
      'After School Program (Worrie.id)',
      'After School Full Year Career Pathway (4 Terms / 1 Tahun)',
      'Jalur Karir Terbaik',
      'Siswa SMP / SMA / SMK (Kelompok Min. 5 Anak)',
      'Program percepatan karir global 1 tahun ajaran penuh (48 pertemuan). Dari dasar hingga mahir dengan portofolio komprehensif, persiapan marketplace freelance internasional, dan bimbingan magang remote.',
      4750000::numeric,
      0::numeric,
      'Biaya per anak untuk 1 Tahun (48 sesi intensif, hemat Rp 530.000 dibanding per term)',
      '["48x Pertemuan Intensif (4 Terms / 1 Tahun Penuh)", "Rasio Emas 1 Mentor Industri : Maksimal 5 Siswa", "48 Portofolio Karya Nyata + Akun Freelance Internasional", "Kurikulum Lengkap: AI Tools, UI/UX, Web Builder & Global Remote Freelancing", "4x Pameran Showcase Karya per Kuartal di Hadapan Sekolah & Orang Tua", "Sertifikat Kelulusan Karir Digital Resmi & Surat Rekomendasi Profesional"]'::jsonb,
      true,
      3
    ),

    -- 2. Kemitraan B2B Sekolah (Ekskul Resmi Sekolah)
    (
      'after_school',
      'After School Program (Worrie.id)',
      'B2B Kemitraan Sekolah (Ekskul Resmi Institusi)',
      'Kemitraan Sekolah B2B',
      'Pihak Sekolah (Kepala Sekolah, Waka Kurikulum, Humas)',
      'Kemitraan resmi pembukaan ekstrakurikuler digital di sekolah. Sekolah memfasilitasi lab komputer & pendaftaran, Worrie.id menyediakan kurikulum industri, instruktur praktisi, modul, dan showcase.',
      0::numeric,
      0::numeric,
      'Biaya Setup Rp 0 untuk Sekolah + Skema Bagi Hasil 10-15% ke Kas Sekolah/Guru Pembina',
      '["Biaya Setup Rp 0 (Free Onboarding untuk Pihak Sekolah)", "Bagi Hasil 10% - 15% untuk Kas Sekolah / Guru Pendamping", "Worrie.id Menyiapkan Mentor Industri Teruji & Kurikulum Global", "Laporan Perkembangan & Dashboard Absensi Siswa untuk Pihak Sekolah", "Penyelenggaraan Showcase / Digital Day Tahunan di Sekolah", "Mendukung Akreditasi Sekolah & Daya Tarik Pendaftaran Siswa Baru (PPDB)"]'::jsonb,
      false,
      4
    ),

    -- 3. Holiday Intensive Bootcamp
    (
      'after_school',
      'After School Program (Worrie.id)',
      'Holiday Remote Camp (Bootcamp Liburan 5 Hari - 5 Karya)',
      'Camp Liburan',
      'Siswa SD Kelas Atas / SMP / SMA saat Libur Semester',
      'Program liburan sekolah produktif 5 hari intensif (Senin - Jumat @ 120 menit). Siswa membuat 5 karya digital nyata: Desain AI, Web Portofolio, Video Pendek, Chatbot AI, dan Presentasi Karya.',
      650000::numeric,
      0::numeric,
      'Biaya per anak untuk 5 hari sesi intensif liburan (Senin - Jumat)',
      '["5 Hari Berturut-turut Praktik Langsung (Senin - Jumat @ 120 menit)", "Rasio 1 Mentor Praktisi : 5 Siswa", "Menghasilkan 5 Karya Digital Nyata Siap Pamer", "Modul Belajar Digital & Software Practice Kit", "E-Certificate Kelulusan Camp Resmi Worrie.id"]'::jsonb,
      false,
      5
    ),

    -- 4. Add-on Personal Portfolio Siswa
    (
      'addon',
      'Add-on & Fitur Tambahan',
      'Domain & Website Portofolio Siswa (namasiswa.dev / .site)',
      'Add-on Siswa',
      'Siswa After School Program Worrie.id',
      'Website portofolio online pribadi atas nama siswa sendiri untuk memamerkan semua hasil karya kelas ke publik, perguruan tinggi, maupun klien remote global.',
      175000::numeric,
      175000::numeric,
      'Domain kustom (.my.id / .site / .dev) & Cloud Hosting aktif 1 tahun',
      '["Domain kustom atas nama siswa sendiri (contoh: budi-karya.site)", "Cloud Hosting Berkecepatan Tinggi & SSL HTTPS Aman", "Template Portofolio Responsif Siap Kerja", "Tautan Terintegrasi ke LinkedIn, GitHub, Behance & WhatsApp", "Panduan update karya mandiri setelah lulus kelas"]'::jsonb,
      false,
      14
    )
) as t(category, category_name, name, badge, target_audience, description, setup_fee, annual_fee, annual_fee_notes, features, is_featured, sort_order)
where not exists (
  select 1 from public.service_packages where name = 'After School Full Year Career Pathway (4 Terms / 1 Tahun)'
);

