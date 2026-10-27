# Worrie.id CRM — Working Remotely Indonesia

> **EDUCATION • DIGITAL SKILLS • CAREER READINESS**  
> Sistem Manajemen Kemitraan & Pipeline CRM untuk Sekolah (SMK/SMA), Kampus, dan Talenta Digital.

![Worrie.id Logo](/public/logo.png)

---

## 🌟 Modul Aplikasi

- 📊 **Dashboard Eksekutif (`/`)**: KPI Matrix, Funnel Konversi CRM, Riwayat Aktivitas 360° Real-Time, Agenda Follow-Up, dan Hot Leads.
- 🔍 **Kampanye & Scraper Google Maps (`/projects`)**: Dual-Layer Workflow (Hasil Scraping ➔ Skrining Draft Prospek ➔ Batch Konversi ke Pipeline Resmi) + Ekspor Excel (.xlsx).
- 📌 **Pipeline CRM Kanban (`/crm`)**: Visual 6 Tahap Penjualan (*Belum dihubungi, Dihubungi, Follow Up, Quotation, Closing, Ditolak*) dengan nilai deal.
- 🏢 **Tampilan Lead 360° (`/crm/[id]`)**: Multi-Kontak PIC (Kepala Sekolah, Guru BK, Humas), Generator Dokumen Penawaran, Timeline Aktivitas Interaksi, dan Pengingat Follow-Up.
- 📑 **Penawaran & Proposal Hub (`/quotations`)**: Pusat Dokumen Penawaran B2B, status tracking, Pratinjau & Cetak PDF Kop Resmi Worrie.id, dan share ringkasan via WhatsApp.
- 📅 **Agenda & Follow-Up Reminders (`/tasks`)**: Daftar tugas terstruktur (Hari Ini, Overdue, Mendatang, Selesai), 1-klik checkbox selesai, dan integrasi WhatsApp.
- 💬 **Template Pesan WhatsApp & AI (`/templates`)**: AI Generator pesan penawaran otomatis berdasarkan tone, dan placeholder variabel cerdas.
- 👥 **Manajemen Tim & RBAC (`/team`)**: Hak akses bertingkat (*superadmin, admin, sales_manager, marketing*) dengan **Proteksi Anti-Delete Akun Superadmin**.
- ⚙️ **Pengaturan Gateway (`/settings`)**: Integrasi WhatsApp API (Xsender, Fonnte, Waha) & Profil Agensi.
- 🔐 **Autentikasi Google SSO (`/login`)**: Single Sign-On resmi dengan pengalihan sesi server-side middleware anti-URL injection.

---

## 📖 Dokumentasi Lengkap

Untuk panduan arsitektur sistem, manual pengguna setiap modul, skema ERD PostgreSQL, aturan keamanan middleware, dan panduan setup:
👉 **[Buka Dokumen Lengkap: DOCUMENTATION.md](file:///Users/diyanto/crm_worrie/DOCUMENTATION.md)**

Untuk riwayat dan struktur migrasi database SQL:
👉 **[Buka Riwayat Migrasi: MIGRATIONS.md](file:///Users/diyanto/crm_worrie/MIGRATIONS.md)**

---

## 🚀 Menjalankan Proyek

```bash
# 1. Jalankan development server
npm run dev

# 2. Verifikasi tipe TypeScript
npx tsc --noEmit

# 3. Validasi build produksi
npm run build
```

Buka peramban di `http://localhost:3000`.

---

&copy; 2026 **Worrie.id** — Working Remotely Indonesia.
