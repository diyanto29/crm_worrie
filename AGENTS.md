<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Worrie.id CRM Engineering Rules

Aturan permanen pengembangan aplikasi CRM Working Remotely Indonesia (Worrie.id):

1. **Light Theme & Brand Identity**:
   - Tema wajib **Light Theme**.
   - Warna senada logo resmi [public/logo.png](file:///Users/diyanto/crm_worrie/public/logo.png): Primary Navy Blue `#004a87`, Aksen Kuning/Gold `#f59e0b` / `#eab308`, dan Putih bersih.
   - Tata letak harus rapi, proporsional, dan berstandar SaaS modern (hindari komponen mengambang kecil di ruang kosong).

2. **Aturan Migrasi SQL Database (MANDATORI)**:
   - Setiap kali membuat atau mengubah tabel/kolom database, **WAJIB membuat file migrasi bertanggal**: `supabase/migrations/YYYYMMDDHHMMSS_<nama>.sql`.
   - Skrip migrasi harus idempotent (`if not exists`, `do $$ begin ... end $$;`).
   - Wajib catat riwayatnya di [MIGRATIONS.md](file:///Users/diyanto/crm_worrie/MIGRATIONS.md).

3. **Keamanan Server & Role-Based Access Control (RBAC)**:
   - Proteksi sesi server-side di [src/middleware.ts](file:///Users/diyanto/crm_worrie/src/middleware.ts) (anti-URL injection tanpa login).
   - Rute admin (`/team`, `/settings`) hanya boleh diakses oleh pengguna dengan `role = 'admin'`. Jika staf `marketing` mengakses URL tersebut, middleware otomatis mengalihkan ke `/?error=unauthorized_admin_only`.
   - Menu admin disembunyikan dari sidebar untuk pengguna non-admin.

4. **Alur CRM & Pipeline B2B/B2C**:
   - Hasil ekstraksi masuk ke `campaign_prospects` (Draft) untuk diseleksi oleh marketer, bukan langsung ke pipeline.
   - Menggunakan fitur multi-kontak (`lead_contacts`) untuk mencatat banyak PIC (Kepala Sekolah, Guru BK, Humas).
   - Setiap aktivitas interaksi dan perubahan status wajib dicatat otomatis di `lead_activities` (Timeline 360° View).
   - Sistem quotation / proposal kerjasama via `quotations` & `quotation_items`.

5. **Kualitas Kode**:
   - TypeScript ketat tanpa tipe data `any` sembarangan.
   - Verifikasi selalu dengan `npx tsc --noEmit` untuk memastikan 0 error kompilasi.

