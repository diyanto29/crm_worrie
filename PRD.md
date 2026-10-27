# Product Requirements Document (PRD)
## Worrie.id CRM — B2B Educational & Career Readiness Pipeline

> **Versi Dokumen**: 1.0.0  
> **Status**: Living Document (Feature Checklist & Roadmap)  
> **Brand & Identitas**: Working Remotely Indonesia (*EDUCATION • DIGITAL SKILLS • CAREER READINESS*)  
> **Arsitektur**: Next.js 16 (App Router) + Supabase PostgreSQL + Edge Middleware RBAC  

---

## 📌 1. Ringkasan Eksekutif & Visi Produk

**Worrie.id CRM** adalah platform manajemen prospek dan siklus kemitraan B2B yang dirancang untuk mendukung ekspansi program edukasi karir remote work Worrie.id ke institusi pendidikan (SMK/SMA, Perguruan Tinggi, LPK) serta mitra industri. 

Aplikasi ini menyatukan proses pencarian prospek via Google Maps Scraper, penyaringan prospek kurasi (*Draft Screening*), eksekusi penjangkauan via WhatsApp Gateway, manajemen multi-kontak PIC institusi (Kepala Sekolah, Guru BK, Humas), penerbitan surat penawaran berkop resmi, dan pemantauan aktivitas interaksi 360° secara real-time.

---

## 👥 2. Persona Pengguna & Peran Sistem (RBAC)

| Peran (Role) | Target Pengguna | Akses & Wewenang Utama |
|---|---|---|
| **Superadmin** | Owner / Co-founder Worrie.id (`diyanto2911@gmail.com`) | Akses mutlak ke seluruh sistem, kebal hapus (*Anti-Delete Protected*), konfigurasi gateway, dan pengelolaan user tim. |
| **Administrator** | Head of Operations / Tim IT Internal | Akses manajemen tim, konfigurasi WhatsApp Gateway, manajemen template pesan global, dan supervisi database. |
| **Sales Manager** | Koordinator Kemitraan Kampus & Sekolah | Penugasan prospek (*Sales Assignment*), validasi penawaran harga, audit log aktivitas tim sales, analisis alasan penolakan (*Lost Reason*). |
| **Marketing Staff** | Staf Pelaksana Outreach & Follow-Up | Kurasi draft prospek, penjangkauan WhatsApp, update status Kanban, pencatatan log interaksi 360°, dan eksekusi reminder tugas. |

---

## 📊 3. Matriks Checklist Fitur (Status Pelaksanaan)

Gunakan matriks ini untuk melacak status pengerjaan fitur-fitur CRM:

### A. 5 Fitur Utama Penjualan & Supervisi (Fokus Permintaan)
- [x] **Fitur 1: Next Action & Reminder Follow-Up**
  - [x] Modul agenda tugas terpusat di `/tasks` (Hari Ini, Terlewat/Overdue, Mendatang, Selesai).
  - [x] Input tenggat waktu & jam follow-up di detail prospek 360°.
  - [x] Widget Agenda Follow-Up di Dashboard eksekutif (`/`).
  - [x] 1-Click Checkbox selesai yang otomatis tercatat ke log aktivitas prospek.
  - [x] *Badge Janji Follow-Up Berikutnya (Next Action)* langsung terpampang di header Lead 360° & kartu Kanban.
  - [x] Modal popup khusus penentuan janji tanggal/jam & catatan tindak lanjut berikutnya.
- [x] **Fitur 2: Sales Assignment (PIC Marketing)**
  - [x] Kolom `assigned_to` pada skema basis data PostgreSQL tabel `leads`.
  - [x] Dropdown pemilihan PIC Marketing langsung di kartu Kanban `/crm`.
  - [x] Dropdown PIC Marketing di header halaman Lead 360° `/crm/[id]`.
  - [x] Filter Kanban berdasarkan nama PIC Marketing yang bertugas.
  - [x] Log aktivitas otomatis setiap terjadi perubahan atau penugasan PIC baru.
- [x] **Fitur 3: Lost Reason (Alasan Ditolak / Batal)**
  - [x] Kolom `lost_reason` pada skema basis data tabel `leads`.
  - [x] Tahap status `Ditolak` pada siklus pipeline Kanban.
  - [x] Modal Popup otomatis saat status dipindah ke `Ditolak` (Opsi: *Kemahalan*, *Sudah punya vendor lain*, *Belum butuh*, *Nomor tidak aktif/salah sambung*, *Lainnya*).
  - [x] Tampilan banner alasan penolakan pada ringkasan detail prospek untuk bahan evaluasi promosi.
- [x] **Fitur 4: Quick Activity Box di 360° View**
  - [x] Tab cepat di atas timeline: `[ Catatan ]`, `[ Telepon ]`, `[ Meeting / Zoom ]`, `[ WhatsApp ]`.
  - [x] Form input judul & deskripsi interaksi ringkas.
  - [x] Tombol "Simpan ke Timeline" yang langsung memperbarui audit trail riwayat tanpa reload halaman.
  - [x] Badge warna & ikon visual pembeda jenis interaksi pada timeline.
- [x] **Fitur 5: Dokumen & Proposal Links**
  - [x] Modul penawaran harga & rincian line item quotation di tabel `quotations`.
  - [x] Pratinjau surat penawaran resmi berkop Worrie.id.
  - [x] Widget kartu khusus *"Dokumen & Proposal Links"* di sidebar kanan Lead 360°.
  - [x] Penyimpanan tautan eksternal (Google Drive MoU, Draft Kontrak, Portofolio PDF, Invoice DP).
  - [x] Tautan langsung dapat diklik untuk membuka dokumen di tab baru.

---

### B. Fitur Arsitektur & Modul Lengkap Sistem
- [x] **Modul 1: Dashboard Eksekutif (`/`)**
  - [x] Kartu KPI: Total Prospek, Prospek Hot, Omset Closing, Proposal Disetujui.
  - [x] Funnel konversi 6 tahap CRM.
  - [x] Widget Riwayat Aktivitas 360° Real-Time lintas prospek.
  - [x] Widget Agenda Follow-Up terdekat.
  - [x] Tabel Hot Leads (Skor kesiapan tertinggi).
- [x] **Modul 2: Kampanye & Scraper Google Maps (`/projects`)**
  - [x] Form pencarian keyword & wilayah (e.g., "SMK Negeri", "Universitas").
  - [x] Integrasi scraper Google Maps.
  - [x] **Dual-Layer Workflow**: Hasil ekstraksi masuk ke `campaign_prospects` (Draft Screening), tidak langsung mengotori database leads.
  - [x] **Convert to Leads**: Seleksi massal atau satuan untuk mengonversi prospek terverifikasi menjadi Lead resmi di database.
  - [x] Ekspor data prospek ke format Microsoft Excel (.xlsx).
- [x] **Modul 2B: Database Leads Directory (`/leads`)**
  - [x] Tabel direktori terpusat seluruh prospek dan mitra sekolah/kampus.
  - [x] Filter status pipeline: `Prospek Baru`, `Dihubungi`, `Follow Up`, `Quotation`, `Closing`, `Ditolak`.
  - [x] Filter PIC Marketing (Sales Assignment) dan sortir cerdas (Nama, Nilai Deal, Rating).
  - [x] **Modal Tambah Lead Baru**: Form manual untuk mendaftarkan mitra sekolah baru (rujukan, event offline, telepon masuk).
  - [x] **Export Excel (.xlsx)**: Unduh seluruh basis data leads terfilter ke format spreadsheet resmi.
  - [x] **Import Excel & CSV (.xlsx/.csv)**: Unggah data prospek massal dengan template resmi Worrie, auto mapping kolom, pratinjau data (preview), dan penugasan PIC otomatis.
  - [x] Integrasi 1-klik menuju halaman detail 360° lead (`/crm/[id]`) dan chat WhatsApp.
- [x] **Modul 3: Pipeline CRM Kanban (`/crm`)**
  - [x] 6 Kolom Status: `Belum dihubungi`, `Dihubungi`, `Follow Up`, `Quotation`, `Closing`, `Ditolak`.
  - [x] Kartu visual dengan Deal Value (Rp), nomor kontak, dan tombol cepat WhatsApp.
  - [x] Drag & Drop / Stage Switcher.
- [x] **Modul 4: Detail Lead 360° View (`/crm/[id]`)**
  - [x] Breadcrumbs navigasi kembali ke CRM.
  - [x] Multi-Kontak PIC (Kontak A: Kepala Sekolah, B: Guru BK, C: Humas).
  - [x] Tab Generator Penawaran & Kalkulasi Diskon/PPN.
  - [x] Tab Timeline Riwayat 360° dengan Quick Input Composer.
  - [x] Integrasi WhatsApp Gateway & Tombol Direct WhatsApp.
- [x] **Modul 5: Penawaran & Proposal Hub (`/quotations`)**
  - [x] Agregasi seluruh surat penawaran dari berbagai instansi.
  - [x] Filter status penawaran: `Draft`, `Terkirim`, `Disetujui`, `Ditolak`.
  - [x] **Modal Buat Penawaran Langsung**: Form penyusunan proposal baru langsung dari hub penawaran dengan pemilih instansi, item dinamis, diskon, PPN 11%, dan kalkulasi otomatis.
  - [x] **Pratinjau PDF Murni (Pure PDF Viewer)**: Surat penawaran kop Worrie.id A4 resmi tanpa web print preview, langsung unduh `.pdf`, buka di tab baru, dan cetak.
  - [x] Tombol kirim ringkasan penawaran langsung ke WhatsApp klien.
- [x] **Modul 6: Agenda & Follow-Up Reminders (`/tasks`)**
  - [x] **3 Mode Tampilan Interaktif (View Modes)**:
    - **List View**: Daftar agenda terstruktur dengan indikator keterlambatan, status selesai, kontak WhatsApp, dan direct click ke halaman 360° lead.
    - **Timeline View**: Rangkaian kronologis agenda per tanggal dengan visual vertical connector rail, penanda waktu (WIB), dan kartu interaktif menuju detail prospek.
    - **Calendar View**: Kalender bulanan penuh dengan navigasi bulan (sebelumnya/berikutnya/hari ini), pill agenda per tanggal, badge total tugas, dan **Modal Popup Multi-List Agenda Harian** dengan kartu animasi interaktif (*staggered motion, hover lift, body scroll locking, light dismiss ESC/backdrop, dan tombol langsung ke 360° lead*).
  - [x] **Direct Lead Navigation**: Mengklik agenda pada mode mana pun (List/Timeline/Kalender) langsung membuka halaman 360° Lead (`/crm/[id]`).
  - [x] Tab filter status: `Semua`, `Hari Ini`, `Terlewat`, `Mendatang`, `Selesai`.
  - [x] Modal tambah follow-up baru dengan pemilih instansi dan datetime.
  - [x] Direct button WhatsApp untuk follow-up instan dengan template pesan otomatis.
- [x] **Modul 7: Template Pesan WhatsApp & AI (`/templates`)**
  - [x] Generator AI pesan penawaran berdasarkan tone bahasa.
  - [x] Placeholder variabel otomatis (`{business_name}`, `{rating}`, `{address}`).
- [x] **Modul 8: Manajemen Tim & RBAC (`/team`)**
  - [x] Daftar pengguna internal dan penetapan peran (*superadmin, admin, sales_manager, marketing*).
  - [x] **Fitur Tambah Anggota Tim (Pre-Register)**: Admin & Superadmin dapat mendaftarkan nama, email Google, dan nomor WhatsApp staf baru.
  - [x] **Penautan Otomatis Google SSO**: Saat staf login dengan email yang didaftarkan, sistem otomatis menautkan akun Google ke profil dan peran yang telah disiapkan admin.
  - [x] **Kirim Undangan Akses**: Tombol 1-klik kirim undangan via WhatsApp & Salin teks kredensial/link login.
  - [x] **PostgreSQL Anti-Delete Protection**: Akun Superadmin tidak bisa dihapus atau diturunkan.
- [x] **Modul 9: Pengaturan Gateway & Database (`/settings`)**
  - [x] Form konfigurasi WhatsApp API Gateway (Xsender, Fonnte, Waha).
  - [x] Profil instansi Worrie.id.
- [x] **Modul 10: Autentikasi Google SSO (`/login`)**
  - [x] Light Theme login portal dengan branding Worrie.id.
  - [x] Proteksi Edge Middleware anti-URL injection (Redirect 307 ke login jika belum login).
  - [x] Proteksi admin-only: Staf marketing dialihkan ke `/?error=unauthorized_admin_only` jika membuka `/team` atau `/settings`.

---

## 🧭 4. Navigasi & Cara Mengakses Halaman Lead 360° View

Bagi pengguna baru atau tim marketing, halaman **Lead 360° View** dapat diakses melalui beberapa jalur:

1. **Dari Pipeline CRM (`/crm`)**:
   - Klik kartu prospek manapun di papan Kanban, atau klik tombol **"Buka 360° Lead"** pada kartu.
2. **Dari Dashboard Eksekutif (`/`)**:
   - Pada tabel **Prospek Potensial (Hot Leads)** atau widget **Riwayat Aktivitas 360°**, klik nama institusi atau ikon panah `→`.
3. **Dari Penawaran & Proposal Hub (`/quotations`)**:
   - Pada baris penawaran, klik nama institusi atau ikon tautan eksternal untuk melompat langsung ke halaman 360° prospek bersangkutan.
4. **Dari Agenda Follow-Up (`/tasks`)**:
   - Klik nama institusi atau tombol tautan pada daftar agenda follow-up.
5. **Format URL Langsung**:
   - `http://localhost:3000/crm/[lead_id]` (contoh: `/crm/lead-1`).

---

## 🛠️ 5. Spesifikasi Detail 5 Fitur Penjualan (Action Items)

### 5.1 Fitur 1: Next Action & Reminder Follow-Up
* **Masalah**: Prospek yang telah dihubungi sering terlupakan karena tim tidak mencatat kapan harus menghubungi kembali.
* **Solusi**:
  - Kolom input tanggal dan jam janji tindak lanjut berikutnya langsung di profil lead.
  - Tampilan visual *Next Action Badge* di header Lead 360°: `"Follow up: 29 Okt 14:00"`.
  - Sinkronisasi otomatis ke agenda `/tasks` dan widget dashboard.

### 5.2 Fitur 2: Sales Assignment (PIC Marketing)
* **Masalah**: Anggota tim sales berebut prospek atau saling melempar tanggung jawab.
* **Solusi**:
  - Dropdown daftar staf tim marketing di header Lead 360° dan di kartu Kanban.
  - Setiap perubahan PIC otomatis dicatat ke riwayat aktivitas timeline 360°: `"Prospek ditugaskan ke Dika oleh Admin"`.

### 5.3 Fitur 3: Lost Reason (Alasan Ditolak)
* **Masalah**: Prospek yang menolak tawaran kemitraan tidak terdokumentasi alasannya, sehingga manajemen tidak bisa mengevaluasi pricing atau kurikulum penawaran.
* **Solusi**:
  - Saat status diubah menjadi `Ditolak` (baik di Kanban maupun di 360° view), tampilkan modal popup:
    1. *Kemahalan / Anggaran Tidak Tersedia*
    2. *Sudah Ada Vendor / Mitra Pelatihan Lain*
    3. *Belum Butuh Program Remote Work Saat Ini*
    4. *Nomor Tidak Aktif / Salah Sambung*
    5. *Lainnya (Teks kustom)*
  - Alasan tersimpan di kolom `lost_reason` tabel `leads` dan tercatat di timeline audit trail.

### 5.4 Fitur 4: Quick Activity Box di 360° View
* **Masalah**: Mengetik catatan ke sistem seringkali rumit dan memakan waktu.
* **Solusi**:
  - Widget cepat tepat di atas timeline dengan 4 tombol tab instan: `[ 📝 Catatan ]`, `[ 📞 Log Panggilan ]`, `[ 🤝 Janji Temu / Zoom ]`, `[ 💬 Kirim WA ]`.
  - Cukup ketik ringkasan 1-2 baris lalu tekan Enter / "Simpan ke Timeline".

### 5.5 Fitur 5: Dokumen & Proposal Links
* **Masalah**: Tautan Google Drive materi, portofolio pembicara, MoU draft, atau bukti transfer DP berserakan di chat WhatsApp pribadi.
* **Solusi**:
  - Widget kartu *"Tautan & Dokumen Pendukung"* di sidebar kanan halaman 360° view.
  - Kemampuan menyimpan label dokumen (misal: "Draft MoU 2026", "Folder Google Drive Foto Seminar", "Bukti DP 50%") beserta URL langsungnya.

---

## 🗄️ 6. Skema Basis Data Pendukung (PostgreSQL)

```sql
-- Cuplikan Kolom Pendukung Fitur Baru pada tabel leads:
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS assigned_to text,
  ADD COLUMN IF NOT EXISTS lost_reason text,
  ADD COLUMN IF NOT EXISTS next_action_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_action_notes text,
  ADD COLUMN IF NOT EXISTS document_links jsonb DEFAULT '[]'::jsonb;
```

---

## 🏁 7. Kriteria Keberhasilan (Definition of Done)

1. [x] Seluruh antarmuka menggunakan **Light Theme** bersih dengan identitas resmi Worrie.id.
2. [x] Rute admin (`/team`, `/settings`) terproteksi server-side middleware (anti-URL injection).
3. [x] Akun Superadmin memiliki proteksi kebal hapus (*anti-delete trigger*).
4. [x] Setiap perubahan status ke `Ditolak` memicu popup alasan penolakan dan tersimpan di basis data.
5. [x] PIC Marketing dapat dipilih langsung via dropdown pada halaman Lead 360° dan kartu Kanban.
6. [x] Tautan dokumen Google Drive/MoU dapat disimpan dan dibuka langsung dari Lead 360°.
7. [x] Verifikasi tipe data `npx tsc --noEmit` lolos dengan **0 error**.
8. [x] Build produksi Next.js `npm run build` sukses 100%.

---

&copy; 2026 **Worrie.id** — Working Remotely Indonesia. Product Engineering Team.
