# Worrie.id CRM Engineering Rules & Standards
> Diadopsi dari best-practices `alirezarezvani/claude-skills` (senior-frontend, database-designer, ship-gate, ui-designer, b2b-sales-engineer).

Aturan ini bersifat **MANDATORI** dan harus dipatuhi oleh semua AI Agent dan pengembang yang bekerja pada proyek **Worrie.id CRM (Working Remotely Indonesia)**.

---

## 1. Identitas Brand & Design System (UI/UX)
* **Nama Resmi:** Working Remotely Indonesia (Worrie.id)
* **Pilar:** `EDUCATION • DIGITAL SKILLS • CAREER READINESS`
* **Tema Visual:** **LIGHT THEME ONLY** (Bersih, elegan, modern, dan berstandar SaaS B2B).
* **Palet Warna Senada Logo (`public/logo.png`):**
  - **Primary Navy Blue:** `#004a87` (Tombol utama, heading brand, badge aktif, border fokus).
  - **Secondary Gold / Yellow:** `#f59e0b` / `#eab308` (Aksen, highlight bintang, skor potensi, pilar edukasi).
  - **Background Canvas:** Putih bersih (`#ffffff`) dengan aksen soft slate (`#f8fafc` / `#f1f5f9`) dan border halus (`#e2e8f0`).
* **Aset Logo:** Selalu gunakan [public/logo.png](file:///Users/diyanto/crm_worrie/public/logo.png) yang sudah dipangkas (*cropped*) tanpa ruang transparan kosong.
* **Anti-AI-Slop Layout:** Jangan membuat kartu kecil yang melayang di ruang kosong. Gunakan tata letak yang proporsional (seperti *Split-Screen* pada halaman login atau *2-Column 360° Layout* pada halaman CRM).

---

## 2. Aturan Database & Migrasi SQL (MANDATORI)
* **Setiap penambahan atau perubahan skema database WAJIB dibuatkan file migrasi resmi:**
  - Format lokasi: `supabase/migrations/YYYYMMDDHHMMSS_<nama_perubahan>.sql`
  - Contoh: `supabase/migrations/20261027100800_auth_google_sso_and_profiles_trigger.sql`
* **Sifat Script Migrasi:** Wajib **Idempotent** (dapat dijalankan berulang tanpa error):
  - Gunakan `create table if not exists`.
  - Gunakan blok `do $$ begin if not exists (...) then alter table ... end if; end $$;` untuk penambahan kolom.
  - Pasang indeks pencarian (`lead_id`, `stage`, `due_date`, `is_active`).
  - Aktifkan Row Level Security: `alter table <nama_tabel> enable row level security;`.
* **Dokumentasi Changelog:** Wajib mencatat ringkasan perubahan di file [MIGRATIONS.md](file:///Users/diyanto/crm_worrie/MIGRATIONS.md).

---

## 3. Keamanan Server & Otorisasi Pengguna (RBAC)
* **Pencegahan URL Injection:** Proteksi rute internal dashboard harus selalu divalidasi di [src/middleware.ts](file:///Users/diyanto/crm_worrie/src/middleware.ts) pada level server (HTTP 307 Redirect ke `/login` jika belum ada sesi).
* **Pemisahan Peran Admin vs Marketing:**
  - Halaman sensitif **`/team`** (Manajemen Tim) dan **`/settings`** (API Gateway & DB) **HANYA boleh diakses oleh akun dengan `role = 'admin'`**.
  - Jika akun `marketing` mencoba mengetik URL admin, middleware wajib mencegat dan mengalihkan ke `/?error=unauthorized_admin_only`.
  - Pada navigasi [src/components/Sidebar.tsx](file:///Users/diyanto/crm_worrie/src/components/Sidebar.tsx), menu admin otomatis disembunyikan (*hidden*) dari pengguna non-admin.
  - Setiap halaman admin wajib memiliki pertahanan lapis ganda (*client-side guard*).
* **Penanganan Akun Nonaktif:** Pengguna dengan `is_active === false` langsung diblokir dan diarahkan keluar.

---

## 4. Alur Bisnis & Pipeline CRM (Working Remotely Indonesia)
* **Dua Model Segmen Layanan:**
  1. **B2B Institusi:** Kemitraan Sekolah, SMA/SMK, dan Kampus (Seminar karir digital, workshop, kurikulum, sponsorship).
  2. **B2C Talenta Muda:** Pelatihan kerja remote (Content Creation, Virtual Assistant, Copywriting, Career Readiness).
* **Pemisahan Draft Kampanye vs Pipeline CRM:**
  - Hasil scraping atau impor prospek **TIDAK boleh langsung masuk ke pipeline deal**.
  - Data mentah masuk ke `campaign_prospects` dalam status `draft`.
  - Marketer memilah (*screening*) dan memilih data yang valid, lalu menekan tombol **"Convert to Pipeline"** untuk masuk ke `leads`.
* **Multi-Kontak per Bisnis/Sekolah (`lead_contacts`):**
  - Satu sekolah/institusi dapat memiliki banyak kontak (Kontak A: Kepala Sekolah, Kontak B: Guru BK, Kontak C: Humas).
* **Timeline Riwayat Aktivitas 360° (`lead_activities`):**
  - Setiap aksi (konversi prospek, penambahan kontak A/B/C, perubahan status deal, pengiriman WA, telepon, dan pembuatan quotation) harus otomatis tercatat secara time-series dengan nama pelakunya (*actor attribution*).
* **Sistem Quotation / Penawaran Kerjasama (`quotations` & `quotation_items`):**
  - Pembuatan surat penawaran harga/proposal resmi dengan nomor quote otomatis, rincian paket, diskon, dan status penawaran.

---

## 5. Standar Rekayasa Kode (Clean Code & TypeScript)
* **Strict TypeScript:** Dilarang menggunakan tipe data `any` secara sembarangan. Gunakan tipe data dari [src/types/database.ts](file:///Users/diyanto/crm_worrie/src/types/database.ts).
* **Next.js 16 / App Router:**
  - Hindari `'use client'` di level layout utama kecuali diperlukan untuk state otentikasi global.
  - Setiap pemanggilan `useSearchParams()` wajib dibungkus komponen `<Suspense>`.
* **Verifikasi Sebelum Selesai:** Selalu jalankan `npx tsc --noEmit` untuk memastikan **0 error kompilasi** sebelum menyerahkan hasil ke pengguna.
