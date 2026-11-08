-- =========================================================================
-- MIGRATION: 20261108152000_seed_after_school_packages.sql
-- Description: Injeksi Paket After School Program (Remote Work by Worrie.id)
-- =========================================================================

insert into public.service_packages (
  category, category_name, name, badge, target_audience, description, setup_fee, annual_fee, annual_fee_notes, features, is_featured, sort_order
)
select * from (
  values 
    (
      'after_school',
      'After School Program (Worrie.id)',
      'After School Remote Work Accelerator (1 Term / 3 Bulan)',
      'Paling Populer',
      'Siswa SMP / SMA / SMK (Kelompok Min. 5 Anak)',
      'Program ekstrakurikuler intensif persiapan karir global remote work. 1 kelas dibimbing 1 mentor industri untuk 5 siswa. Setiap sesi siswa langsung praktik dan pulang membawa project karya nyata.',
      1320000::numeric,
      0::numeric,
      'Biaya per anak untuk 1 Term (12 sesi x Rp 110.000, bayar per 3 bulan)',
      '["Rasio Emas 1:5 (1 Mentor Industri : Maksimal 5 Siswa)", "12x Pertemuan Intensif (3 Bulan / 1 Term)", "12 Karya Portfolio Nyata (1 Project per Pertemuan)", "Kurikulum Siap Karir: AI Tools, Global Portfolio, Remote Freelancing", "Laporan Hasil Belajar Bulanan & Sertifikat Resmi Worrie.id", "Showcase Pameran Karya Akhir Term di Hadapan Orang Tua & Sekolah"]'::jsonb,
      true,
      1
    ),
    (
      'after_school',
      'After School Program (Worrie.id)',
      'After School Cohort (Per Pertemuan / Kelompok 5 Siswa)',
      'Min. 5 Anak',
      '1 Kelompok Belajar (5 Siswa + 1 Mentor)',
      'Biaya operasional kelas per pertemuan untuk 1 kelompok minimal 5 siswa (Rp 110.000/anak/sesi). Siswa menyelesaikan 1 mini-project nyata dalam sesi ini.',
      550000::numeric,
      0::numeric,
      'Rp 110.000 per anak per pertemuan (Minimal 5 anak untuk menjalankan kelas)',
      '["1x Pertemuan Hands-on Praktik Langsung (90-120 menit)", "Rasio 1 Mentor Praktisi : 5 Siswa", "Pulang Membawa 1 Project / Karya Nyata", "Software & Digital Asset Practice Kit", "Pendampingan Praktik Step-by-Step Tanpa Teori Membosankan"]'::jsonb,
      false,
      2
    )
) as t(category, category_name, name, badge, target_audience, description, setup_fee, annual_fee, annual_fee_notes, features, is_featured, sort_order)
where not exists (
  select 1 from public.service_packages where name = 'After School Remote Work Accelerator (1 Term / 3 Bulan)'
);

