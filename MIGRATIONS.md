# Dokumentasi Migrasi Database CRM Worrie

Dokumentasi ini mencatat riwayat perubahan dan penambahan skema database (*database migration log*) untuk aplikasi CRM Worrie. Setiap kali ada penambahan tabel atau kolom baru, dokumentasikan di file ini dan sertakan file SQL-nya di dalam folder `supabase/migrations/`.

---

## Riwayat Migrasi (Migration History)

### 📌 [2026-10-28] - Perbaikan Tipe Kolom assigned_to & Fleksibilitas RLS Leads
* **File Migrasi:** [`supabase/migrations/20261028175500_fix_leads_assigned_to_type_and_rls.sql`](supabase/migrations/20261028175500_fix_leads_assigned_to_type_and_rls.sql)
* **Tanggal:** 28 Oktober 2026
* **Status:** Ready to Apply
* **Tipe Perubahan:** Mengubah tipe kolom `public.leads.assigned_to` dari `uuid references profiles(id)` menjadi `text`, serta mengizinkan policy RLS penuh pada tabel CRM operasional (`leads`, `lead_contacts`, `lead_activities`, `campaign_prospects`).
* **Tujuan:** Memperbaiki kegagalan insert lead manual dan convert prospect yang terjadi karena nilai nama PIC teks ("Diyanto", "Tim Sales Worrie") ditolak oleh kolom bertipe UUID (`invalid input syntax for type uuid`).

---

### 📌 [2026-10-28] - Hardening Row Level Security (RLS) & Anti-Privilege Escalation
* **File Migrasi:** [`supabase/migrations/20261028174500_hardening_rls_security_policies.sql`](supabase/migrations/20261028174500_hardening_rls_security_policies.sql)
* **Tanggal:** 28 Oktober 2026
* **Status:** Ready to Apply
* **Tipe Perubahan:** Pengetatan RLS Kebijakan `authenticated`, Trigger `prevent_self_role_escalation`, Proteksi Khusus `app_settings` (Admin/Superadmin Only)
* **Tujuan:** Menutup celah permissive `USING (true)` pada Supabase PostgREST API, memastikan hanya pengguna terautentikasi yang dapat mengakses data bisnis, serta mencegah pengguna non-admin menaikkan hak akses (role) mereka sendiri.

---

### 📌 [2026-10-27] - Injeksi Data Awal Resmi Kemitraan B2B (Initial CRM Seed)
* **File Migrasi:** [`supabase/migrations/20261027200500_seed_initial_crm_b2b_data.sql`](supabase/migrations/20261027200500_seed_initial_crm_b2b_data.sql)
* **Tanggal:** 27 Oktober 2026
* **Status:** Applied
* **Tipe Perubahan:** Seed Data Idempotent pada tabel `campaigns`, `campaign_prospects`, `leads`, `lead_contacts`, `quotations`, `quotation_items`, `lead_activities`, `lead_tasks`, dan `app_settings`.
* **Tujuan:** Mengisi data awal resmi kemitraan edukasi B2B Worrie.id langsung ke cloud database Supabase sehingga aplikasi bekerja 100% pure cloud dari Supabase tanpa bergantung pada fallback localStorage browser.

---

### 📌 [2026-10-27] - Penambahan Anggota Tim (Marketing / Admin) & Penautan Google SSO
* **File Migrasi:** [`supabase/migrations/20261027114700_team_management_add_member_and_link_sso.sql`](supabase/migrations/20261027114700_team_management_add_member_and_link_sso.sql)
* **Tanggal:** 27 Oktober 2026
* **Status:** Ready to Apply
* **Tipe Perubahan:** Unique Index `profiles_email_lower_uidx`, Kebijakan RLS INSERT & DELETE pada `profiles`, Pembaruan Trigger `handle_new_user()`
* **Tujuan:** Memungkinkan Admin dan Superadmin mendaftarkan anggota tim marketing baru sebelum mereka login via Google SSO. Ketika anggota tim login dengan email yang telah didaftarkan, akun Google mereka otomatis tertaut dengan profil dan peran yang telah disiapkan admin.

---

### 📌 [2026-10-27] - Penambahan Kolom Next Action & Dokumen Links pada Leads
* **File Migrasi:** [`supabase/migrations/20261027113500_add_next_action_and_document_links_to_leads.sql`](supabase/migrations/20261027113500_add_next_action_and_document_links_to_leads.sql)
* **Tanggal:** 27 Oktober 2026
* **Status:** Ready to Apply
* **Tipe Perubahan:** Penambahan kolom `next_action_at`, `next_action_notes`, dan `document_links` pada tabel `leads`.
* **Tujuan:** Mendukung fitur janji follow-up berikutnya (tanggal & jam), catatan janji temu, dan penyimpanan tautan eksternal (Google Drive MoU, portofolio PDF, invoice DP).

---

### 📌 [2026-10-27] - Penambahan Role 'superadmin' & Proteksi Database Anti-Delete
* **File Migrasi:** [`supabase/migrations/20261027105500_add_superadmin_role_and_anti_delete_protection.sql`](supabase/migrations/20261027105500_add_superadmin_role_and_anti_delete_protection.sql)
* **Tanggal:** 27 Oktober 2026
* **Status:** Ready to Apply
* **Tipe Perubahan:** Update Check Constraint Role, Trigger `protect_superadmin()` Anti-Delete & Anti-Deactivation, Promosi Master Account ke Superadmin
* **Tujuan:** Membedakan antara Administrator biasa dengan **Superadmin**. Akun Superadmin memiliki proteksi permanen di level database PostgreSQL sehingga **TIDAK DAPAT DIHAPUS (Anti-Delete)** atau dinonaktifkan oleh siapa pun, baik dari UI aplikasi maupun API.

---

### 📌 [2026-10-27] - Injeksi & Garansi Hak Akses Master Admin
* **File Migrasi:** [`supabase/migrations/20261027105000_inject_master_admin_account.sql`](supabase/migrations/20261027105000_inject_master_admin_account.sql)
* **Tanggal:** 27 Oktober 2026
* **Status:** Ready to Apply
* **Tipe Perubahan:** Update Trigger Database `handle_new_user()` & Update Hak Akses Master Account
* **Tujuan:** Menjamin akun master (`diyanto2911@gmail.com`) selalu mendapatkan hak akses penuh `admin` secara otomatis pada level basis data (Database Trigger & RLS) tanpa perlu hardcode email tersebut di dalam kode Next.js (TypeScript/Frontend).

---

### 📌 [2026-10-27] - Otomatisasi Google SSO & Sinkronisasi Profil Pengguna
* **File Migrasi:** [`supabase/migrations/20261027100800_auth_google_sso_and_profiles_trigger.sql`](supabase/migrations/20261027100800_auth_google_sso_and_profiles_trigger.sql)
* **Tanggal:** 27 Oktober 2026
* **Status:** Ready to Apply
* **Tipe Perubahan:** Penambahan Kolom Email & Status di `profiles`, Database Trigger `on_auth_user_created`, Sinkronisasi Otomatis Nama & Avatar Google

#### Latar Belakang & Kebutuhan:
1. Mendukung login SSO Google (Gmail) untuk tim marketing dan admin.
2. Setiap kali staf login via Google, data nama lengkap dan foto profil avatar dari Google otomatis tersinkronisasi ke tabel `public.profiles`.
3. Pengguna pertama otomatis mendapatkan role `'admin'`, sedangkan anggota tim berikutnya menjadi `'marketing'`.
4. Menyediakan dasar untuk penugasan prospek (*Lead Assignment*) dan atribusi pelaku aktivitas (*Actor Name* di 360 View).

---

### 📌 [2026-10-27] - Upgrade Arsitektur CRM: Draft Kampanye, Multi-Kontak, Activity 360°, Quotations, & Tasks
* **File Migrasi:** [`supabase/migrations/20261027094500_crm_upgrade_draft_contacts_activities_quotations.sql`](supabase/migrations/20261027094500_crm_upgrade_draft_contacts_activities_quotations.sql)
* **Tanggal:** 27 Oktober 2026
* **Status:** Ready to Apply
* **Tipe Perubahan:** Penambahan Tabel Baru, Modifikasi Kolom, Indeks, & RLS

#### Latar Belakang & Kebutuhan:
1. **Pemisahan Draft Kampanye dari Pipeline**: Hasil scraping Google Maps tidak boleh langsung mengotori pipeline CRM aktif. Prospek mentah kini masuk ke `campaign_prospects` dalam status `draft` untuk dikurasi/diseleksi terlebih dahulu oleh marketer.
2. **Multi-Kontak per Bisnis (Kontak A, B, C)**: Satu profil bisnis sering memiliki beberapa PIC (misal: Owner, Manajer Marketing, Admin). Disediakan tabel `lead_contacts`.
3. **Audit Trail & Timeline 360° View**: Semua aksi (convert prospek, tambah kontak baru, kirim penawaran WA, telepon, meeting, ubah status) dicatat secara kronologis di `lead_activities`.
4. **Sistem Quotation / Penawaran Harga**: Pembuatan draft penawaran resmi, paket harga, diskon, dan tempo berlaku di `quotations` & `quotation_items`.
5. **Jadwal & Pengingat Follow-up**: Tabel `lead_tasks` untuk memastikan marketer tidak lupa follow-up prospek.

#### Rincian Tabel Baru & Modifikasi:
| Nama Tabel | Tipe | Deskripsi & Fungsi |
|---|---|---|
| `profiles` | Baru | Menyimpan akun tim sales/marketing agensi. |
| `campaign_prospects` | Baru | Draft prospek mentah hasil scraping sebelum di-convert ke pipeline. |
| `lead_contacts` | Baru | Menyimpan kontak A, B, C (Owner, Manajer, Admin) per bisnis. |
| `lead_activities` | Baru | Catatan log kronologis untuk halaman 360° View. |
| `quotations` | Baru | Header penawaran harga (nomor quote, PIC, total, status). |
| `quotation_items` | Baru | Rincian item paket layanan website/SEO pada penawaran. |
| `lead_tasks` | Baru | Pengingat jadwal follow-up / janji temu bagi tim marketing. |
| `campaigns` | Alter | Tambah kolom `target_results`, `status`, `created_by`. |
| `leads` | Alter | Tambah kolom `source_prospect_id`, `stage`, `target_close_date`, `lost_reason`, `assigned_to`. |
| `app_settings` | Alter | Tambah info agensi (`agency_name`, `agency_address`, `agency_logo_url`). |

---

### 📌 [2026-10-20] - Skema Awal (Initial Schema)
* **Deskripsi:** Pembuatan tabel awal dasar (`campaigns`, `leads`, `message_templates`, `app_settings`).

---

## Panduan Menjalankan Migrasi di Supabase

### Cara 1: Menggunakan Supabase Dashboard (SQL Editor) - Paling Cepat & Mudah
1. Buka dashboard proyek Anda di [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Pilih proyek Anda, lalu klik menu **SQL Editor** pada sidebar kiri.
3. Klik tombol **New Query**.
4. Buka file [`supabase/migrations/20261027094500_crm_upgrade_draft_contacts_activities_quotations.sql`](supabase/migrations/20261027094500_crm_upgrade_draft_contacts_activities_quotations.sql), salin (*copy*) seluruh isinya.
5. Tempel (*paste*) ke dalam SQL Editor Supabase, lalu klik tombol **Run**.
6. Pastikan muncul pesan `Success. No rows returned`.

### Cara 2: Menggunakan Supabase CLI
Jika proyek sudah terhubung dengan Supabase CLI lokal:
```bash
# Login & tautkan project
npx supabase login
npx supabase link --project-ref <PROJECT_REF_ANDA>

# Terapkan migrasi ke database remote
npx supabase db push
```

---

## Standar Penamaan File Migrasi Baru Selanjutnya
Jika di masa mendatang Anda ingin menambahkan tabel atau field baru:
1. Buat file baru di folder `supabase/migrations/` dengan format:
   ```text
   YYYYMMDDHHMMSS_<deskripsi_singkat>.sql
   Contoh: 20261101103000_add_invoice_tracking.sql
   ```
2. Selalu gunakan klausa aman seperti `create table if not exists` atau blok `do $$ ... end $$;` agar migrasi bersifat *idempotent* (dapat dijalankan berulang tanpa error).
3. Catat ringkasan perubahannya di file `MIGRATIONS.md` ini.
