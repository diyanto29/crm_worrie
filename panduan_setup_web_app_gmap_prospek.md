# Panduan Lengkap: Web App Gmap Prospek (Next.js + Supabase + Vercel)

Dokumentasi ini dirancang khusus untuk membangun aplikasi web tools pribadi berbasis **Next.js (App Router)** dan **Supabase**, yang di-deploy sebagai Web App mandiri (dapat diakses via browser dan di-install sebagai **PWA** di Android/iOS/Desktop).

---

## 1. Arsitektur Web Application

* **Frontend & Backend API:** Next.js (TypeScript, Tailwind CSS, Lucide Icons).
* **Database & Auth:** Supabase (PostgreSQL, Realtime, Row Level Security).
* **Ekstraksi Data (Scraping):** Next.js Server Actions / API Route terhubung ke Google Places API atau scraping worker.
* **Integrasi WhatsApp:** API Gateway (xSender, Fonnte, Waha, dll.).
* **Deployment & Hosting:** Vercel (CI/CD langsung dari GitHub repository) + Custom Domain.
* **Akses Mobile:** PWA (Progressive Web App) dengan opsi *"Add to Home Screen"*.

---

## 2. Skema Database Supabase (PostgreSQL)

Buka dashboard Supabase Anda, masuk ke menu **SQL Editor**, dan jalankan skrip berikut:

```sql
-- 1. Inisialisasi Ekstensi
create extension if not exists "uuid-ossp";

-- 2. Tabel Kampanye Pencarian
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  keyword text not null,
  location text not null,
  max_results integer default 20,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabel Leads / Prospek Bisnis
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  business_name text not null,
  address text,
  phone text,
  rating numeric(2,1),
  reviews_count integer default 0,
  has_website boolean default false,
  website_url text,
  gmaps_url text,
  status text default 'Belum dihubungi' check (status in ('Belum dihubungi', 'Dihubungi', 'Follow Up', 'Closing', 'Ditolak')),
  deal_value numeric(14,2) default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabel Template Pesan WhatsApp
create table public.message_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabel Konfigurasi WA Gateway
create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  gateway_provider text default 'xsender',
  api_key text,
  sender_number text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Optimasi Indeks
create index idx_leads_campaign on public.leads(campaign_id);
create index idx_leads_status on public.leads(status);
create index idx_leads_has_website on public.leads(has_website);

-- RLS (Row Level Security)
alter table public.campaigns enable row level security;
alter table public.leads enable row level security;
alter table public.message_templates enable row level security;
alter table public.app_settings enable row level security;

-- Policy (Akses penuh untuk kebutuhan web tools mandiri)
create policy "Allow all on campaigns" on public.campaigns for all using (true);
create policy "Allow all on leads" on public.leads for all using (true);
create policy "Allow all on templates" on public.message_templates for all using (true);
create policy "Allow all on settings" on public.app_settings for all using (true);
```

---

## 3. Langkah Setup Project Next.js

### 3.1. Buat Project & Dependensi
Jalankan perintah berikut pada terminal:

```bash
npx create-next-app@latest gmap-prospek --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd gmap-prospek
npm install @supabase/supabase-js lucide-react xlsx clsx tailwind-merge
```

### 3.2. Konfigurasi Environment (`.env.local`)
Buat file `.env.local` pada direktori root proyek:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

### 3.3. Inisialisasi Supabase Client (`src/lib/supabaseClient.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 4. Struktur Halaman & Routing Web (App Router)

```text
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx             # Sidebar navigasi tetap & header
│   │   ├── page.tsx               # Ringkasan Bisnis (Metrik kartu: Total prospek, omset, dll.)
│   │   ├── projects/
│   │   │   ├── page.tsx           # Form pencarian lead baru & list kampanye
│   │   │   └── [id]/page.tsx      # Tabel list lead hasil ekstraksi + filter web terdeteksi
│   │   ├── crm/
│   │   │   ├── page.tsx           # Pipeline CRM prospek (Status filter & aksi WA)
│   │   │   └── [id]/page.tsx      # Detail lead (Edit status, catatan prospek, nilai deal)
│   │   ├── templates/
│   │   │   └── page.tsx           # Daftar & editor template salam WA
│   │   └── settings/
│   │       └── page.tsx           # Form setting WhatsApp Gateway (API Key & Nomor)
│   ├── api/
│   │   ├── scrape/route.ts        # Endpoint ekstraksi data Google Maps
│   │   └── whatsapp/send/route.ts # Endpoint trigger kirim pesan WA
│   ├── manifest.ts                # Konfigurasi PWA (Web App Manifest)
│   └── globals.css
├── components/
│   ├── Sidebar.tsx                # Navigasi kiri
│   ├── MetricCard.tsx             # Kartu indikator angka
│   └── ExtractProgressModal.tsx   # Modal loading animasi "Sedang Mengekstrak Data"
└── lib/
    └── supabaseClient.ts
```

---

## 5. Setup PWA (Agar Bisa Di-install di HP / Desktop)

Dengan PWA, aplikasi web Anda bisa langsung "di-install" dari browser ke layar HP tanpa Play Store.

### 5.1. Buat Web App Manifest (`src/app/manifest.ts`)

```typescript
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gmap Prospek Workspace',
    short_name: 'GmapProspek',
    description: 'Tools Manajemen Prospek Google Maps & CRM WhatsApp',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#059669',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
```

---

## 6. Integrasi WhatsApp Gateway (`src/app/api/whatsapp/send/route.ts`)

Contoh endpoint untuk menghubungkan tombol **"Buka WhatsApp" / "Broadcast"** ke gateway xSender atau Fonnte:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { phone, message } = await req.json();

    // 1. Ambil API Key dari tabel pengaturan
    const { data: setting } = await supabase
      .from('app_settings')
      .select('*')
      .single();

    if (!setting?.api_key) {
      return NextResponse.json({ error: 'API Key WhatsApp belum diatur di menu Pengaturan.' }, { status: 400 });
    }

    // 2. Request ke WhatsApp Gateway (Contoh format HTTP POST)
    /*
    const response = await fetch('https://api.gateway-anda.com/send', {
      method: 'POST',
      headers: {
        'Authorization': setting.api_key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: phone,
        message: message
      })
    });
    */

    return NextResponse.json({ success: true, message: 'Pesan berhasil diteruskan ke gateway' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

---

## 7. Panduan Deployment ke Vercel (Produksi)

1. **Push ke GitHub:**
   ```bash
   git init
   git add .
   git commit -m "feat: initial gmap prospek web app"
   git branch -M main
   git remote add origin https://github.com/username/gmap-prospek.git
   git push -u origin main
   ```
2. **Koneksikan ke Vercel:**
   * Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
   * Klik **Add New...** -> **Project**.
   * Pilih repositori `gmap-prospek`.
3. **Set Environment Variables di Vercel:**
   * Pada kolom *Environment Variables*, tambahkan:
     * `NEXT_PUBLIC_SUPABASE_URL`
     * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     * `SUPABASE_SERVICE_ROLE_KEY`
4. **Deploy:**
   * Klik tombol **Deploy**. Dalam waktu 1-2 menit, web tools Anda sudah online dan dapat diakses dari browser mana pun melalui domain publik HTTPS.