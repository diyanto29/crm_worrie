-- ==============================================================================
-- MIGRATION: 20261027200500_seed_initial_crm_b2b_data.sql
-- TANGGAL  : 2026-10-27
-- DESKRIPSI: Injeksi data awal (Seed Data) resmi kemitraan B2B Worrie.id
--            ke tabel campaigns, leads, campaign_prospects, lead_contacts,
--            quotations, quotation_items, lead_activities, dan app_settings.
-- ==============================================================================

do $$
declare
  v_camp_smk uuid := 'c1111111-1111-4111-8111-111111111111';
  v_camp_univ uuid := 'c2222222-2222-4222-8222-222222222222';
  v_lead_1 uuid := 'd1111111-1111-4111-8111-111111111111';
  v_lead_2 uuid := 'd2222222-2222-4222-8222-222222222222';
  v_lead_3 uuid := 'd3333333-3333-4333-8333-333333333333';
  v_lead_4 uuid := 'd4444444-4444-4444-8444-444444444444';
  v_lead_5 uuid := 'd5555555-5555-4555-8555-555555555555';
  v_prospect_1 uuid := 'e1111111-1111-4111-8111-111111111111';
  v_prospect_2 uuid := 'e2222222-2222-4222-8222-222222222222';
  v_prospect_3 uuid := 'e3333333-3333-4333-8333-333333333333';
  v_prospect_4 uuid := 'e4444444-4444-4444-8444-444444444444';
  v_quote_1 uuid := 'f1111111-1111-4111-8111-111111111111';
begin

  -- 1. CAMPAIGNS
  insert into public.campaigns (id, name, keyword, location, max_results, status, created_at)
  values
    (v_camp_smk, 'SMK Pusat Keunggulan Jakarta & Jabar', 'SMK Pusat Keunggulan', 'Jabodetabek', 25, 'completed', now() - interval '3 days'),
    (v_camp_univ, 'Kampus & Universitas Vokasi Digital', 'Universitas Fakultas Vokasi', 'Bandung & Jakarta', 20, 'completed', now() - interval '2 days')
  on conflict (id) do nothing;

  -- 2. CAMPAIGN PROSPECTS (DRAFT KURASI)
  insert into public.campaign_prospects (
    id, campaign_id, business_name, category, address, phone, rating, reviews_count, has_website, website_url, gmaps_url, prospect_score, curation_status, created_at
  )
  values
    (v_prospect_1, v_camp_smk, 'SMK Negeri 1 Jakarta (Pusat Kejuruan Bisnis & TI)', 'Sekolah Menengah Kejuruan', 'Jl. Budi Utomo No. 7, Sawah Besar, Jakarta Pusat', '081298765432', 4.8, 98, true, 'https://smkn1jakarta.sch.id', 'https://maps.google.com/?q=SMKN+1+Jakarta', 95, 'draft', now() - interval '3 days'),
    (v_prospect_2, v_camp_smk, 'SMA Labschool Kebayoran Jakarta', 'Sekolah Menengah Atas', 'Jl. KH. Ahmad Dahlan No. 14, Kebayoran Baru, Jakarta Selatan', '081345678901', 4.9, 145, true, 'https://labschool-unj.sch.id', 'https://maps.google.com/?q=Labschool+Kebayoran', 92, 'draft', now() - interval '3 days'),
    (v_prospect_3, v_camp_smk, 'SMK Taruna Bhakti Depok', 'Sekolah Menengah Kejuruan', 'Jl. Pekapuran No. 1, Curug, Cimanggis, Depok', '081199887766', 4.7, 210, true, 'https://smktarunabhakti.net', 'https://maps.google.com/?q=SMK+Taruna+Bhakti', 89, 'reviewed', now() - interval '2 days'),
    (v_prospect_4, v_camp_univ, 'SMK Telkom Bandung', 'Sekolah Menengah Kejuruan', 'Jl. Radio Palasari, Dayeuhkolot, Bandung', '082155667788', 4.9, 180, true, 'https://smktelkom-bdg.sch.id', 'https://maps.google.com/?q=SMK+Telkom+Bandung', 96, 'converted', now() - interval '1 day')
  on conflict (id) do nothing;

  -- 3. LEADS (PIPELINE AKTIF)
  insert into public.leads (
    id, campaign_id, business_name, address, phone, rating, reviews_count, has_website, website_url, gmaps_url, status, deal_value, prospect_score, notes, created_at
  )
  values
    (v_lead_1, v_camp_smk, 'SMK Taruna Bhakti Depok', 'Jl. Pekapuran No. 1, Curug, Cimanggis, Depok', '081199887766', 4.7, 210, true, 'https://smktarunabhakti.net', 'https://maps.google.com/?q=SMK+Taruna+Bhakti', 'Follow Up', 7500000, 89, 'Tertarik program Bootcamp Kesiapan Kerja Remote & Digital Skills. Menunggu jadwal audiensi Zoom.', now() - interval '2 days'),
    (v_lead_2, v_camp_smk, 'SMK Negeri 1 Jakarta', 'Jl. Budi Utomo No. 7, Sawah Besar, Jakarta Pusat', '081298765432', 4.8, 98, true, 'https://smkn1jakarta.sch.id', 'https://maps.google.com/?q=SMKN+1+Jakarta', 'Dihubungi', 5000000, 95, 'Proposal kemitraan magang industri telah dikirim via WhatsApp kepada Kepala Sekolah.', now() - interval '2 days'),
    (v_lead_3, v_camp_univ, 'SMK Telkom Bandung', 'Jl. Radio Palasari, Dayeuhkolot, Bandung', '082155667788', 4.9, 180, true, 'https://smktelkom-bdg.sch.id', 'https://maps.google.com/?q=SMK+Telkom+Bandung', 'Closing', 12500000, 96, 'Deal paket Kemitraan Kurikulum Industri & Penyaluran Talenta Remote Work 2026. MoU siap ditandatangani.', now() - interval '1 day'),
    (v_lead_4, v_camp_smk, 'SMA Labschool Kebayoran Jakarta', 'Jl. KH. Ahmad Dahlan No. 14, Kebayoran Baru, Jakarta Selatan', '081345678901', 4.9, 145, true, 'https://labschool-unj.sch.id', 'https://maps.google.com/?q=Labschool+Kebayoran', 'Belum dihubungi', 0, 92, 'Target prospek prioritas tinggi untuk seminar karir global siswa kelas XII.', now() - interval '1 day'),
    (v_lead_5, v_camp_univ, 'Politeknik Negeri Media Kreatif (Polimedia)', 'Jl. Srengseng Sawah, Jagakarsa, Jakarta Selatan', '087788990011', 4.6, 120, true, 'https://polimedia.ac.id', 'https://maps.google.com/?q=Polimedia', 'Ditolak', 0, 75, 'Jadwal semester ini sudah penuh dengan agenda internal kampus.', now() - interval '1 day')
  on conflict (id) do nothing;

  -- 4. MULTI-KONTAK PIC (LEAD CONTACTS)
  insert into public.lead_contacts (id, lead_id, name, role, phone, email, is_primary, notes, created_at)
  values
    ('a1111111-1111-4111-8111-111111111111', v_lead_1, 'Dr. H. Bambang Sutrisno, M.Pd', 'Owner', '081199887766', 'bambang.s@tarunabhakti.sch.id', true, 'Kepala Sekolah - Pembuat keputusan akhir MOU kemitraan', now() - interval '2 days'),
    ('a2222222-2222-4222-8222-222222222222', v_lead_1, 'Ibu Ratna Dewi, S.Psi', 'Staff Operasional', '081299887766', 'ratna.bk@tarunabhakti.sch.id', false, 'Koordinator Bimbingan Konseling (BK) untuk seminar karir digital', now() - interval '2 days'),
    ('a3333333-3333-4333-8333-333333333333', v_lead_1, 'Pak Dimas Anggoro, S.Kom', 'Manajer Marketing', '081388776655', 'humas@tarunabhakti.sch.id', false, 'Ketua Hubungan Industri (Hubin) & Humas', now() - interval '2 days')
  on conflict (id) do nothing;

  -- 5. QUOTATIONS & ITEMS
  insert into public.quotations (id, lead_id, quote_number, title, status, subtotal, discount, tax, grand_total, valid_until, notes, created_at)
  values
    (v_quote_1, v_lead_1, 'Q-WORRIE/2026/X/001', 'Proposal Kemitraan Bootcamp Kesiapan Kerja Remote 2026', 'sent', 7500000, 0, 0, 7500000, current_date + interval '14 days', 'Paket kemitraan resmi SMK Pusat Keunggulan dengan kurikulum terintegrasi.', now() - interval '1 day')
  on conflict (id) do nothing;

  insert into public.quotation_items (id, quotation_id, item_name, description, qty, unit_price, total_price, sort_order)
  values
    ('b1111111-1111-4111-8111-111111111111', v_quote_1, 'Kurikulum & Modul Pelatihan Remote Work Standar Global', 'Kurikulum terstandarisasi industri', 1, 3500000, 3500000, 0),
    ('b2222222-2222-4222-8222-222222222222', v_quote_1, 'Workshop Bedah Portofolio & Optimasi Akun Upwork/LinkedIn (3 Sesi)', '3 sesi interaktif bersama praktisi', 1, 2500000, 2500000, 1),
    ('b3333333-3333-4333-8333-333333333333', v_quote_1, 'Sertifikat Kemitraan Industri Resmi & Penyaluran Portofolio Siswa', 'Sertifikat digital resmi industri', 1, 1500000, 1500000, 2)
  on conflict (id) do nothing;

  -- 6. TIMELINE 360° ACTIVITIES
  insert into public.lead_activities (id, lead_id, activity_type, title, description, actor_name, created_at)
  values
    ('f0000001-0001-4001-8001-000000000001', v_lead_1, 'converted_from_draft', 'Lead Masuk ke Pipeline', 'Hasil konversi dari kurasi prospek kampanye SMK Pusat Keunggulan.', 'Sistem CRM', now() - interval '2 days'),
    ('f0000002-0002-4002-8002-000000000002', v_lead_1, 'stage_changed', 'Status Berubah: Follow Up', 'Marketer menghubungi sekolah via WhatsApp dan telah terhubung dengan Humas.', 'Diyanto TI', now() - interval '1 day'),
    ('f0000003-0003-4003-8003-000000000003', v_lead_1, 'whatsapp_sent', 'WhatsApp Pengantar Proposal Terkirim', 'Mengirimkan surat pengantar program kemitraan edukasi digital remote work.', 'Marketing Worrie', now() - interval '1 day'),
    ('f0000004-0004-4004-8004-000000000004', v_lead_1, 'quotation_created', 'Quotation Q-WORRIE/2026/X/001 Diterbitkan', 'Penawaran paket kemitraan bootcamp senilai Rp 7.500.000 diterbitkan.', 'Diyanto TI', now() - interval '1 day')
  on conflict (id) do nothing;

  -- 7. TASKS
  insert into public.lead_tasks (id, lead_id, title, due_date, is_completed, created_at)
  values
    ('e0000001-0001-4001-8001-000000000001', v_lead_1, 'Follow-up telepon ke Bu Ratna (Guru BK) untuk konfirmasi jadwal presentasi online', now() + interval '2 days', false, now())
  on conflict (id) do nothing;

  -- 8. APP SETTINGS
  insert into public.app_settings (id, gateway_provider, api_key, sender_number)
  values
    ('01111111-1111-4111-8111-111111111111', 'xsender', '', '6281234567890')
  on conflict (id) do nothing;

end $$;
