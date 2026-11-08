import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
  Campaign, 
  Lead, 
  MessageTemplate, 
  AppSettings, 
  LeadStatus,
  CampaignProspect,
  LeadContact,
  Quotation,
  QuotationItem,
  LeadActivity,
  LeadTask,
  CurationStatus,
  QuotationStatus,
  UserProfile,
  ServicePackage
} from '@/types/database';
import { calculateProspectScore } from './score';

const ensureLeadScore = (lead: Lead): Lead => ({
  ...lead,
  prospect_score:
    typeof lead.prospect_score === 'number' && lead.prospect_score > 0
      ? lead.prospect_score
      : calculateProspectScore(lead),
});

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tmpl-1',
    title: 'Penawaran Website (Belum Ada Web)',
    body: 'Halo kak, salam kenal dari tim Web Agency. Kami melihat *{business_name}* memiliki reputasi bagus ({rating} ⭐ dari {reviews_count} ulasan) di Google Maps di daerah {address}. Namun kami perhatikan belum memiliki website resmi untuk terima pesanan online. Apakah tertarik kami bantu buatkan landing page modern agar omset makin naik kak?',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'tmpl-2',
    title: 'Follow Up Prospek Tertarik',
    body: 'Halo {business_name}, izin menindaklanjuti pesan kami sebelumnya terkait optimasi Google Maps dan website profesional. Apakah minggu ini ada waktu luang untuk kami presentasikan demo gratisnya kak?',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'tmpl-3',
    title: 'Promo Khusus Minggu Ini',
    body: 'Kabar baik untuk pemilik *{business_name}*! Minggu ini kami sedang ada promo pembuatan website bisnis kilat (2 hari jadi) + bonus integrasi WhatsApp dan Google Maps SEO. Kuota tersisa 2 slot kak, berminat info lengkapnya?',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const DEFAULT_SERVICE_PACKAGES: ServicePackage[] = [
  // 0. Program Unggulan Internal Worrie.id (After School Digital & Remote Work)
  {
    id: 'pkg-afterschool-term',
    category: 'after_school',
    category_name: 'After School Program (Worrie.id)',
    name: 'After School Remote Work Accelerator (1 Term / 3 Bulan)',
    badge: 'Paling Populer',
    target_audience: 'Siswa SMP / SMA / SMK (Kelompok Min. 5 Anak)',
    description: 'Program ekstrakurikuler intensif persiapan karir global remote work. 1 kelas dibimbing 1 mentor industri untuk 5 siswa. Setiap sesi siswa langsung praktik dan pulang membawa project karya nyata.',
    setup_fee: 1320000,
    annual_fee: 0,
    annual_fee_notes: 'Biaya per anak untuk 1 Term (12 sesi x Rp 110.000, bayar per 3 bulan)',
    features: [
      'Rasio Emas 1:5 (1 Mentor Industri : Maksimal 5 Siswa)',
      '12x Pertemuan Intensif (3 Bulan / 1 Term)',
      '12 Karya Portfolio Nyata (1 Project per Pertemuan)',
      'Kurikulum Siap Karir: AI Tools, Global Portfolio, Remote Freelancing',
      'Laporan Hasil Belajar Bulanan & Sertifikat Resmi Worrie.id',
      'Showcase Pameran Karya Akhir Term di Hadapan Orang Tua & Sekolah',
    ],
    is_active: true,
    is_featured: true,
    sort_order: 1,
    created_at: '2026-11-03T00:00:00.000Z',
  },
  {
    id: 'pkg-afterschool-session',
    category: 'after_school',
    category_name: 'After School Program (Worrie.id)',
    name: 'After School Cohort (Per Pertemuan / Kelompok 5 Siswa)',
    badge: 'Min. 5 Anak',
    target_audience: '1 Kelompok Belajar (5 Siswa + 1 Mentor)',
    description: 'Biaya operasional kelas per pertemuan untuk 1 kelompok minimal 5 siswa (Rp 110.000/anak/sesi). Siswa menyelesaikan 1 mini-project nyata dalam sesi ini.',
    setup_fee: 550000,
    annual_fee: 0,
    annual_fee_notes: 'Rp 110.000 per anak per pertemuan (Minimal 5 anak untuk menjalankan kelas)',
    features: [
      '1x Pertemuan Hands-on Praktik Langsung (90-120 menit)',
      'Rasio 1 Mentor Praktisi : 5 Siswa',
      'Pulang Membawa 1 Project / Karya Nyata',
      'Software & Digital Asset Practice Kit',
      'Pendampingan Praktik Step-by-Step Tanpa Teori Membosankan',
    ],
    is_active: true,
    is_featured: false,
    sort_order: 2,
    created_at: '2026-11-03T00:00:00.000Z',
  },

  // 1. Website & PPDB Online Sekolah
  {
    id: 'pkg-web-basic',
    category: 'website_ppdb',
    category_name: 'Website & PPDB Online Sekolah',
    name: 'Basic (Profile)',
    badge: 'Starter',
    target_audience: 'TK / PAUD / Kursus Kecil',
    description: 'Website profil resmi responsif untuk branding dan sarana informasi publik dasar institusi.',
    setup_fee: 3000000,
    annual_fee: 1200000,
    annual_fee_notes: 'Domain .sch.id / .com (gratis tahun 1) & Cloud Hosting',
    features: [
      'Website Profil & Responsif (Mobile & Desktop)',
      'Domain .sch.id / .com gratis thn 1',
      'Sistem PPDB via Form WhatsApp',
      'Batas revisi desain 2 kali',
      'Panduan operasional website',
    ],
    is_active: true,
    is_featured: false,
    sort_order: 1,
    created_at: '2026-11-03T00:00:00.000Z',
  },
  {
    id: 'pkg-web-silver',
    category: 'website_ppdb',
    category_name: 'Website & PPDB Online Sekolah',
    name: 'Silver (PPDB Online)',
    badge: 'Populer',
    target_audience: 'SD / SMP / MTs Berkembang',
    description: 'Website modern dilengkapi sistem pendaftaran siswa baru dan formulir upload berkas online.',
    setup_fee: 5500000,
    annual_fee: 1800000,
    annual_fee_notes: 'Domain .sch.id / .com (gratis tahun 1) & High-Speed Hosting',
    features: [
      'Website Desain Modern & Responsif',
      'Domain .sch.id / .com gratis thn 1',
      'Formulir Pendaftaran & Upload Berkas PPDB',
      'Modul Berita & Informasi Sekolah',
      'Batas revisi desain 3 kali',
      'Pelatihan admin sekolah',
    ],
    is_active: true,
    is_featured: true,
    sort_order: 2,
    created_at: '2026-11-03T00:00:00.000Z',
  },
  {
    id: 'pkg-web-premium',
    category: 'website_ppdb',
    category_name: 'Website & PPDB Online Sekolah',
    name: 'Premium (Official Portal)',
    badge: 'Eksklusif',
    target_audience: 'SMA / SMK / Sekolah Besar',
    description: 'Portal sekolah berstandar tinggi dengan PPDB terpadu, multi-kategori informasi, dan E-Library.',
    setup_fee: 9000000,
    annual_fee: 3000000,
    annual_fee_notes: 'Domain .sch.id & High-Speed Cloud Dedicated',
    features: [
      'Custom Desain Eksklusif Institusi',
      'Domain .sch.id (High-Speed Cloud)',
      'Sistem PPDB Lanjutan & Pengumuman Hasil',
      'Berita Multi-Kategori & Modul E-Library',
      'Batas revisi desain 5 kali',
      'Dukungan teknis prioritas & backup otomatis',
    ],
    is_active: true,
    is_featured: false,
    sort_order: 3,
    created_at: '2026-11-03T00:00:00.000Z',
  },

  // 2. Teacher & Staff Attendance System (Mobile App + HRIS)
  {
    id: 'pkg-att-basic',
    category: 'attendance_hris',
    category_name: 'Teacher & Staff Attendance (Mobile App + HRIS)',
    name: 'Basic (Mobile App Absensi)',
    badge: 'Starter',
    target_audience: 'Sekolah kecil / kursus',
    description: 'Aplikasi mobile praktis untuk absensi harian guru dan staf dengan rekap otomatis.',
    setup_fee: 6000000,
    annual_fee: 2500000,
    annual_fee_notes: 'Server database terisolasi & pemeliharaan berkala',
    features: [
      'Aplikasi Android Guru (Check-in / Check-out)',
      'Rekap bulanan kehadiran (PDF / Excel)',
      'Database mandiri terisolasi per sekolah',
      'Hemat kuota dan ringan',
    ],
    is_active: true,
    is_featured: false,
    sort_order: 4,
    created_at: '2026-11-03T00:00:00.000Z',
  },
  {
    id: 'pkg-att-silver',
    category: 'attendance_hris',
    category_name: 'Teacher & Staff Attendance (Mobile App + HRIS)',
    name: 'Silver (Geofencing + Cuti)',
    badge: 'Best Seller',
    target_audience: 'Sekolah menengah / berkembang',
    description: 'Sistem absensi dengan validasi radius lokasi GPS dan foto selfie serta pengajuan izin/cuti online.',
    setup_fee: 10000000,
    annual_fee: 4500000,
    annual_fee_notes: 'Termasuk cloud server & storage foto selfie terkompresi',
    features: [
      'Aplikasi Absensi + Validasi Radius GPS (Geofencing)',
      'Validasi Foto Selfie (Kompresi Otomatis Hemat Storage)',
      'Modul Pengajuan & Approval Cuti / Izin Online',
      'Web Panel Approval & Notifikasi Admin',
      'Database mandiri terisolasi per sekolah',
    ],
    is_active: true,
    is_featured: true,
    sort_order: 5,
    created_at: '2026-11-03T00:00:00.000Z',
  },
  {
    id: 'pkg-att-premium',
    category: 'attendance_hris',
    category_name: 'Teacher & Staff Attendance (Mobile App + HRIS)',
    name: 'Premium (Enterprise HRIS + Dashboard)',
    badge: 'Enterprise',
    target_audience: 'SMA / SMK / Yayasan Pendidikan',
    description: 'Aplikasi absensi custom branding logo institusi, manajemen shift lengkap, dan dashboard eksekutif.',
    setup_fee: 15000000,
    annual_fee: 7500000,
    annual_fee_notes: 'High-performance cloud server dedicated & garansi uptime',
    features: [
      'Custom Branding Aplikasi (Logo & Warna Sekolah)',
      'Validasi GPS & Foto Selfie Kompresi Otomatis',
      'Manajemen Cuti, Shift Kerja, & Izin Lengkap',
      'Dashboard Eksekutif untuk Yayasan / Kepala Sekolah',
      'Database Terisolasi & Enkripsi Data Aman',
      'Dukungan teknis prioritas & SLA',
    ],
    is_active: true,
    is_featured: false,
    sort_order: 6,
    created_at: '2026-11-03T00:00:00.000Z',
  },

  // 3. Paket Bundling Sekolah Digital
  {
    id: 'pkg-bnd-starter',
    category: 'bundling',
    category_name: 'Paket Bundling Sekolah Digital',
    name: 'Sekolah Digital Starter',
    badge: 'Hemat Rp 500rb',
    target_audience: 'Sekolah Dasar / Kursus Mandiri',
    description: 'Kombinasi Website Basic + Absensi Mobile Basic untuk solusi awal terpadu.',
    setup_fee: 8500000,
    annual_fee: 3700000,
    annual_fee_notes: 'Perpanjangan gabungan domain, hosting, dan server absensi',
    features: [
      'Website Basic (Profile & Form WA)',
      'Mobile App Absensi Basic (Check-in/out)',
      'Rekap kehadiran bulanan Excel/PDF',
      'Domain & Hosting tahun pertama',
    ],
    is_active: true,
    is_featured: false,
    sort_order: 7,
    created_at: '2026-11-03T00:00:00.000Z',
  },
  {
    id: 'pkg-bnd-plus',
    category: 'bundling',
    category_name: 'Paket Bundling Sekolah Digital',
    name: 'Sekolah Digital Plus',
    badge: 'Paling Diminati',
    target_audience: 'Sekolah Menengah / SMP / MTs',
    description: 'Kombinasi Website Silver (PPDB Online) + Absensi Silver (Geofencing GPS & Cuti Online).',
    setup_fee: 14500000,
    annual_fee: 6300000,
    annual_fee_notes: 'Perpanjangan hosting PPDB dan cloud storage absensi foto',
    features: [
      'Website Silver (Form PPDB & Berita)',
      'Mobile App Absensi GPS + Selfie Kompresi',
      'Modul Cuti & Izin Online Approval',
      'Pelatihan gabungan operator & guru',
      'Hemat investasi Rp 1.000.000',
    ],
    is_active: true,
    is_featured: true,
    sort_order: 8,
    created_at: '2026-11-03T00:00:00.000Z',
  },
  {
    id: 'pkg-bnd-premium',
    category: 'bundling',
    category_name: 'Paket Bundling Sekolah Digital',
    name: 'Sekolah Digital Premium',
    badge: 'Solusi Lengkap',
    target_audience: 'SMA / SMK / Yayasan Besar',
    description: 'Solusi transformasi digital menyeluruh: Portal Website Premium + Enterprise HRIS Absensi Mobile.',
    setup_fee: 22000000,
    annual_fee: 10500000,
    annual_fee_notes: 'High-performance dedicated server & storage terpadu',
    features: [
      'Website Portal Premium + PPDB + E-Library',
      'Enterprise HRIS Absensi Custom Brand Sekolah',
      'Dashboard Eksekutif Yayasan & Kepala Sekolah',
      'Manajemen shift, cuti & lembur lengkap',
      'Prioritas SLA & Pendampingan intensif',
      'Hemat investasi Rp 2.000.000',
    ],
    is_active: true,
    is_featured: false,
    sort_order: 9,
    created_at: '2026-11-03T00:00:00.000Z',
  },

  // 4. Add-on Layanan
  {
    id: 'pkg-add-payroll',
    category: 'addon',
    category_name: 'Add-on & Fitur Tambahan',
    name: 'Modul Payroll Terintegrasi',
    badge: 'Add-on HR',
    target_audience: 'Yayasan & Sekolah Swasta',
    description: 'Perhitungan gaji guru/staf otomatis, potongan keterlambatan, dan slip gaji digital terintegrasi absensi.',
    setup_fee: 4500000,
    annual_fee: 1500000,
    annual_fee_notes: 'Dukungan update regulasi & backup slip gaji',
    features: [
      'Perhitungan otomatis gaji pokok & tunjangan',
      'Potongan keterlambatan otomatis dari data absensi',
      'Generate & kirim slip gaji digital (PDF / WhatsApp)',
      'Laporan pengeluaran gaji yayasan',
    ],
    is_active: true,
    is_featured: false,
    sort_order: 10,
    created_at: '2026-11-03T00:00:00.000Z',
  },
  {
    id: 'pkg-add-campus',
    category: 'addon',
    category_name: 'Add-on & Fitur Tambahan',
    name: 'Kampus / Unit Tambahan',
    badge: 'Multi-Cabang',
    target_audience: 'Yayasan dengan banyak lokasi/kampus',
    description: 'Penambahan unit kampus atau cabang baru dalam satu yayasan (per kampus).',
    setup_fee: 2500000,
    annual_fee: 1000000,
    annual_fee_notes: 'Per cabang / unit tambahan per tahun',
    features: [
      'Integrasi multi-cabang dalam 1 dashboard yayasan',
      'Pengaturan geofencing terpisah per kampus',
      'Rekap terpisah dan konsolidasi yayasan',
    ],
    is_active: true,
    is_featured: false,
    sort_order: 11,
    created_at: '2026-11-03T00:00:00.000Z',
  },
];

const DEFAULT_CAMPAIGNS: Campaign[] = [];
export const DEFAULT_PROFILES: UserProfile[] = [];
const DEFAULT_LEADS: Lead[] = [];
const DEFAULT_PROSPECTS: CampaignProspect[] = [];
const DEFAULT_CONTACTS: LeadContact[] = [];
const DEFAULT_QUOTATIONS: Quotation[] = [];
const DEFAULT_QUOTATION_ITEMS: QuotationItem[] = [];
const DEFAULT_ACTIVITIES: LeadActivity[] = [];
const DEFAULT_TASKS: LeadTask[] = [];

const DEFAULT_SETTINGS: AppSettings = {
  id: 'setting-1',
  agency_name: 'Working Remotely Indonesia (Worrie.id)',
  agency_email: 'halo@worrie.id',
  agency_phone: '6281234567890',
  agency_address: 'Indonesia',
  gateway_provider: 'xsender',
  api_key: '',
  sender_number: '6281234567890',
  updated_at: new Date().toISOString(),
};

// Pembersih cache data dummy lama di browser (Auto-Purge Total)
function purgeAllLegacyOfflineCache(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('gmap_prospek_')) {
        keysToRemove.push(k);
      }
    }
    for (const k of keysToRemove) {
      localStorage.removeItem(k);
    }
  } catch {}
}

if (typeof window !== 'undefined') {
  purgeAllLegacyOfflineCache();
}

// Local storage helper (Hanya untuk fallback offline darurat saat env Supabase tidak disetel)
function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(`gmap_prospek_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`gmap_prospek_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

export const DataStore = {
  isCloud: isSupabaseConfigured,

  // CAMPAIGNS (Pure Supabase Online)
  async getCampaigns(): Promise<Campaign[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*, leads(count), campaign_prospects(count)')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((item: any) => ({
            ...item,
            leads_count: item.leads?.[0]?.count || 0,
            prospects_count: item.campaign_prospects?.[0]?.count || 0,
          }));
        }
        if (error) {
          console.error('Supabase getCampaigns error:', error);
        }
        return [];
      } catch (e) {
        console.error('Supabase getCampaigns exception:', e);
        return [];
      }
    }

    return getLocal<Campaign[]>('campaigns', DEFAULT_CAMPAIGNS);
  },

  async getCampaignById(id: string): Promise<Campaign | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*, leads(count), campaign_prospects(count)')
          .eq('id', id)
          .single();
        if (!error && data) {
          return {
            ...data,
            leads_count: data.leads?.[0]?.count || 0,
            prospects_count: data.campaign_prospects?.[0]?.count || 0,
          };
        }
        return null;
      } catch {
        return null;
      }
    }

    const localCampaigns = getLocal<Campaign[]>('campaigns', DEFAULT_CAMPAIGNS);
    return localCampaigns.find((c) => c.id === id) || null;
  },

  async createCampaign(campaign: Omit<Campaign, 'id' | 'created_at'>): Promise<Campaign> {
    const newCampaign: Campaign = {
      ...campaign,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `camp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .insert([newCampaign])
          .select()
          .single();
        if (!error && data) {
          return data;
        }
        if (error) {
          console.error('Supabase createCampaign error:', error);
        }
      } catch (e) {
        console.error('Supabase createCampaign error:', e);
      }
    }

    return newCampaign;
  },

  async deleteCampaign(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('campaign_prospects').delete().eq('campaign_id', id);
        await supabase.from('leads').delete().eq('campaign_id', id);
        await supabase.from('campaigns').delete().eq('id', id);
        return true;
      } catch (e) {
        console.error('Supabase deleteCampaign error', e);
        return false;
      }
    }
    return true;
  },

  // LEADS (Pure Supabase Online)
  async getLeads(campaignId?: string): Promise<Lead[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (campaignId) {
          query = query.eq('campaign_id', campaignId);
        }
        const { data, error } = await query;
        if (!error && data) {
          return data.map(ensureLeadScore);
        }
        if (error) {
          console.error('Supabase getLeads error:', error);
        }
        return [];
      } catch (e) {
        console.error('Supabase getLeads exception:', e);
        return [];
      }
    }

    return [];
  },

  async getLeadById(id: string): Promise<Lead | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();
        if (!error && data) {
          return ensureLeadScore(data);
        }
        return null;
      } catch {
        return null;
      }
    }
    return null;
  },

  async createLeadsBulk(newLeads: Omit<Lead, 'id' | 'created_at'>[]): Promise<Lead[]> {
    const leadsWithMeta: Lead[] = newLeads.map((item, idx) => {
      const score = typeof item.prospect_score === 'number' && item.prospect_score > 0
        ? item.prospect_score
        : calculateProspectScore(item);
      const maybeLead = item as Partial<Lead>;
      const isItemUuid = maybeLead.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(maybeLead.id);
      const newUuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;
      return {
        ...item,
        prospect_score: score,
        id: isItemUuid && maybeLead.id ? maybeLead.id : (newUuid || `lead-${Date.now()}-${idx}`),
        created_at: new Date().toISOString(),
      };
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const supabasePayload = leadsWithMeta.map((lead) => {
          const payload: Record<string, unknown> = {
            business_name: lead.business_name,
            address: lead.address || null,
            phone: lead.phone || null,
            primary_phone: lead.primary_phone || lead.phone || null,
            rating: typeof lead.rating === 'number' ? lead.rating : null,
            reviews_count: typeof lead.reviews_count === 'number' ? lead.reviews_count : 0,
            has_website: Boolean(lead.has_website),
            website_url: lead.website_url || null,
            gmaps_url: lead.gmaps_url || null,
            status: lead.status || 'Belum dihubungi',
            stage: lead.stage || lead.status || 'Belum dihubungi',
            deal_value: typeof lead.deal_value === 'number' ? lead.deal_value : 0,
            assigned_to: lead.assigned_to ? String(lead.assigned_to).trim() : null,
            notes: lead.notes || null,
            prospect_score: typeof lead.prospect_score === 'number' ? lead.prospect_score : 0,
            created_at: lead.created_at,
          };

          if (lead.id && uuidRegex.test(lead.id)) {
            payload.id = lead.id;
          }
          if (lead.campaign_id && uuidRegex.test(lead.campaign_id)) {
            payload.campaign_id = lead.campaign_id;
          }
          if (lead.source_prospect_id && uuidRegex.test(lead.source_prospect_id)) {
            payload.source_prospect_id = lead.source_prospect_id;
          }

          return payload;
        });

        const { data, error } = await supabase.from('leads').insert(supabasePayload).select();
        if (!error && data) {
          return data.map(ensureLeadScore);
        }
        if (error) {
          console.error('Supabase createLeadsBulk error:', error);
          return [];
        }
      } catch (e) {
        console.error('Supabase createLeadsBulk exception:', e);
        return [];
      }
    }

    return leadsWithMeta;
  },

  async createLead(
    newLead: Omit<Lead, 'id' | 'created_at'>,
    actorName: string = 'Tim Sales Worrie'
  ): Promise<Lead | null> {
    const created = await this.createLeadsBulk([newLead]);
    const lead = created[0] || null;
    if (lead) {
      if (newLead.phone) {
        try {
          await this.createLeadContact({
            lead_id: lead.id,
            name: `PIC / Narahubung ${lead.business_name}`,
            role: 'Lainnya',
            phone: newLead.phone,
            email: null,
            is_primary: true,
            notes: 'Kontak utama yang didaftarkan saat pembuatan Lead',
          }, actorName);
        } catch (contactErr) {
          console.warn('Failed to auto-create primary contact:', contactErr);
        }
      }
      try {
        await this.createLeadActivity({
          lead_id: lead.id,
          activity_type: 'note_created',
          title: 'Lead Baru Ditambahkan',
          description: `Lead "${lead.business_name}" berhasil didaftarkan ke Database Leads oleh ${actorName}.`,
          actor_name: actorName,
        });
      } catch (actErr) {
        console.warn('Failed to auto-create lead activity:', actErr);
      }
    }
    return lead;
  },

  async getTeamMembers(): Promise<UserProfile[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: true });
        if (!error && data) {
          return data as UserProfile[];
        }
        return [];
      } catch (err) {
        console.error('Failed to load team profiles from Supabase:', err);
        return [];
      }
    }
    return [];
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    const { prospect_score, ...sanitizedUpdates } = updates;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .update(sanitizedUpdates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          return ensureLeadScore(data);
        }
      } catch (e) {
        console.error('Supabase updateLead error', e);
      }
    }

    return null;
  },

  async deleteLead(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('lead_contacts').delete().eq('lead_id', id);
        await supabase.from('lead_activities').delete().eq('lead_id', id);
        await supabase.from('lead_tasks').delete().eq('lead_id', id);
        await supabase.from('quotations').delete().eq('lead_id', id);
        await supabase.from('leads').delete().eq('id', id);
        return true;
      } catch (e) {
        console.error('Supabase deleteLead error', e);
        return false;
      }
    }
    return true;
  },

  // TEMPLATES
  async getTemplates(): Promise<MessageTemplate[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('message_templates')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.error('Supabase getTemplates error', e);
      }
    }
    return DEFAULT_TEMPLATES;
  },

  async createTemplate(template: Omit<MessageTemplate, 'id' | 'created_at'>): Promise<MessageTemplate> {
    const newTmpl: MessageTemplate = {
      ...template,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tmpl-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('message_templates').insert([newTmpl]).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.error('Supabase createTemplate error', e);
      }
    }

    return newTmpl;
  },

  async updateTemplate(id: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('message_templates')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.error('Supabase updateTemplate error', e);
      }
    }

    return null;
  },

  async deleteTemplate(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('message_templates').delete().eq('id', id);
        return true;
      } catch (e) {
        console.error('Supabase deleteTemplate error', e);
      }
    }
    return true;
  },

  // SETTINGS
  async getSettings(): Promise<AppSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('app_settings').select('*').limit(1).single();
        if (!error && data) return data;
      } catch (e) {
        console.error('Supabase getSettings error', e);
      }
    }
    return DEFAULT_SETTINGS;
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const updated: AppSettings = {
      ...(await this.getSettings()),
      ...settings,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: existing } = await supabase.from('app_settings').select('id').limit(1).single();
        if (existing?.id) {
          const { data } = await supabase
            .from('app_settings')
            .update(updated)
            .eq('id', existing.id)
            .select()
            .single();
          if (data) return data;
        } else {
          const { data } = await supabase.from('app_settings').insert([updated]).select().single();
          if (data) return data;
        }
      } catch (e) {
        console.error('Supabase updateSettings error', e);
      }
    }

    return updated;
  },

  // ==========================================
  // 1. CAMPAIGN PROSPECTS (DRAFT LIST) - Pure Supabase Online
  // ==========================================
  async getCampaignProspects(campaignId?: string): Promise<CampaignProspect[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('campaign_prospects')
          .select('*')
          .order('created_at', { ascending: false });
        if (campaignId) {
          query = query.eq('campaign_id', campaignId);
        }
        const { data, error } = await query;
        if (!error && data) {
          return data;
        }
        return [];
      } catch (e) {
        console.error('Supabase getCampaignProspects exception:', e);
        return [];
      }
    }

    return [];
  },

  async createCampaignProspectsBulk(
    prospects: Omit<CampaignProspect, 'id' | 'created_at'>[]
  ): Promise<CampaignProspect[]> {
    const list: CampaignProspect[] = prospects.map((p, idx) => ({
      ...p,
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `prosp-${Date.now()}-${idx}`,
      created_at: new Date().toISOString(),
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('campaign_prospects')
          .insert(list)
          .select();
        if (!error && data) {
          return data;
        }
      } catch (e) {
        console.error('Supabase createCampaignProspectsBulk error:', e);
      }
    }

    return list;
  },

  async updateProspectCuration(
    prospectId: string,
    curation_status: CurationStatus,
    reason?: string
  ): Promise<CampaignProspect | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('campaign_prospects')
          .update({
            curation_status,
            disqualified_reason: reason ?? null,
          })
          .eq('id', prospectId)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.error('Supabase updateProspectCuration error:', e);
      }
    }
    return null;
  },

  async convertProspectToPipeline(
    prospectId: string,
    actorName: string = 'Tim Marketing'
  ): Promise<Lead | null> {
    const prospects = await this.getCampaignProspects();
    const prospect = prospects.find((p) => p.id === prospectId);
    if (!prospect) return null;

    // 1. Create Lead in Pipeline
    const newLeadData: Omit<Lead, 'id' | 'created_at'> = {
      source_prospect_id: prospect.id,
      campaign_id: prospect.campaign_id,
      business_name: prospect.business_name,
      address: prospect.address,
      phone: prospect.phone,
      primary_phone: prospect.phone,
      rating: prospect.rating,
      reviews_count: prospect.reviews_count,
      has_website: prospect.has_website,
      website_url: prospect.website_url,
      gmaps_url: prospect.gmaps_url,
      status: 'Belum dihubungi',
      deal_value: 0,
      assigned_to: actorName || null,
      notes: `Dikonversi dari draft scraping. Skor awal: ${prospect.prospect_score ?? 0}%.`,
      prospect_score: prospect.prospect_score,
    };

    const createdLeads = await this.createLeadsBulk([newLeadData]);
    const createdLead = createdLeads[0];
    if (!createdLead) return null;

    // 2. Automatically create primary contact if phone or name is present
    if (prospect.phone) {
      await this.createLeadContact({
        lead_id: createdLead.id,
        name: `PIC / Kontak ${prospect.business_name.split(' ')[0]}`,
        role: 'Owner',
        phone: prospect.phone,
        email: null,
        is_primary: true,
        notes: 'Kontak utama yang diekstrak dari Google Maps',
      }, actorName);
    }

    // 3. Mark prospect as converted
    await this.updateProspectCuration(prospect.id, 'converted');
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('campaign_prospects')
          .update({
            curation_status: 'converted',
            converted_lead_id: createdLead.id,
            converted_at: new Date().toISOString(),
            converted_by: actorName,
          })
          .eq('id', prospect.id);
      } catch (e) {
        console.error('Supabase update converted prospect error', e);
      }
    }

    // 4. Log 360° Activity
    await this.createLeadActivity({
      lead_id: createdLead.id,
      activity_type: 'converted_from_draft',
      title: 'Prospek Dikonversi ke Pipeline Aktif',
      description: `Prospek "${prospect.business_name}" telah diverifikasi dan dipindahkan dari draft scraping ke pipeline CRM.`,
      actor_name: actorName,
    });

    return createdLead;
  },

  async batchConvertProspectsToPipeline(
    prospectIds: string[],
    actorName: string = 'Tim Marketing'
  ): Promise<Lead[]> {
    const results: Lead[] = [];
    for (const pid of prospectIds) {
      const res = await this.convertProspectToPipeline(pid, actorName);
      if (res) results.push(res);
    }
    return results;
  },

  // ==========================================
  // 2. MULTI-CONTACTS (lead_contacts) - Pure Supabase Online
  // ==========================================
  async getLeadContacts(leadId: string): Promise<LeadContact[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('lead_contacts')
          .select('*')
          .eq('lead_id', leadId)
          .order('is_primary', { ascending: false });
        if (!error && data) {
          return data;
        }
        return [];
      } catch (e) {
        console.error('Supabase getLeadContacts error:', e);
        return [];
      }
    }

    return [];
  },

  async createLeadContact(
    contact: Omit<LeadContact, 'id' | 'created_at'>,
    actorName: string = 'Tim Worrie'
  ): Promise<LeadContact> {
    const newContact: LeadContact = {
      ...contact,
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `cont-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const current = getLocal<LeadContact[]>('lead_contacts', DEFAULT_CONTACTS);
    setLocal('lead_contacts', [newContact, ...current]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('lead_contacts')
          .insert([newContact])
          .select()
          .single();
        if (!error && data) {
          // Log Activity
          await this.createLeadActivity({
            lead_id: contact.lead_id,
            activity_type: 'contact_added',
            title: `Kontak Ditambahkan: ${contact.name} (${contact.role})`,
            description: `Nomor telepon: ${contact.phone}${contact.email ? ` • Email: ${contact.email}` : ''}`,
            actor_name: actorName,
          });
          return data;
        }
      } catch (e) {
        console.error('Supabase createLeadContact error:', e);
      }
    }

    return newContact;
  },

  async updateLeadContact(
    id: string,
    updates: Partial<LeadContact>,
    actorName: string = 'Tim Worrie'
  ): Promise<LeadContact | null> {
    let updated: LeadContact | null = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('lead_contacts')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) updated = data;
      } catch (e) {
        console.error('Supabase updateLeadContact error:', e);
      }
    }

    if (updated) {
      await this.createLeadActivity({
        lead_id: updated.lead_id,
        activity_type: 'contact_updated',
        title: `Kontak Diperbarui: ${updated.name}`,
        description: `Informasi kontak ${updated.role} telah diperbarui.`,
        actor_name: actorName,
      });
    }

    return updated;
  },

  async deleteLeadContact(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('lead_contacts').delete().eq('id', id);
        return true;
      } catch (e) {
        console.error('Supabase deleteLeadContact error:', e);
        return false;
      }
    }
    return true;
  },

  // ==========================================
  // 3. QUOTATIONS & ITEMS (Pure Supabase Online)
  // ==========================================
  async getQuotations(leadId: string): Promise<Quotation[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('quotations')
          .select('*, items:quotation_items(*)')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data;
        }
        return [];
      } catch (e) {
        console.error('Supabase getQuotations error:', e);
        return [];
      }
    }

    return [];
  },

  async createQuotation(
    quote: Omit<Quotation, 'id' | 'created_at' | 'items'>,
    items: Omit<QuotationItem, 'id' | 'quotation_id'>[],
    actorName: string = 'Tim Worrie'
  ): Promise<Quotation> {
    const quoteId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `quot-${Date.now()}`;
    const quoteNumber =
      quote.quote_number ||
      `Q-WORRIE/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${Math.floor(
        1000 + Math.random() * 9000
      )}`;

    const newQuote: Quotation = {
      ...quote,
      id: quoteId,
      quote_number: quoteNumber,
      created_at: new Date().toISOString(),
    };

    const newItems: QuotationItem[] = items.map((item, idx) => ({
      ...item,
      id: `qi-${Date.now()}-${idx}`,
      quotation_id: quoteId,
      sort_order: idx + 1,
    }));

    // Supabase Save
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: qData, error: qErr } = await supabase
          .from('quotations')
          .insert([newQuote])
          .select()
          .single();
        if (!qErr && qData) {
          if (newItems.length > 0) {
            await supabase.from('quotation_items').insert(newItems);
          }
        }
      } catch (e) {
        console.error('Supabase createQuotation error:', e);
      }
    }

    // Automatically update lead status to 'Quotation' and update deal_value
    await this.updateLead(quote.lead_id, {
      status: 'Quotation',
      deal_value: quote.grand_total,
    });

    // Log Activity
    await this.createLeadActivity({
      lead_id: quote.lead_id,
      activity_type: 'quotation_created',
      title: `Quotation Dibuat: ${quoteNumber}`,
      description: `Penawaran "${quote.title}" senilai Rp ${quote.grand_total.toLocaleString('id-ID')} berhasil diterbitkan.`,
      actor_name: actorName,
    });

    return { ...newQuote, items: newItems };
  },

  async updateQuotationStatus(
    quoteId: string,
    status: QuotationStatus,
    actorName: string = 'Tim Worrie'
  ): Promise<Quotation | null> {
    let updated: Quotation | null = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('quotations')
          .update({ status })
          .eq('id', quoteId)
          .select()
          .single();
        if (!error && data) updated = data;
      } catch (e) {
        console.error('Supabase updateQuotationStatus error:', e);
      }
    }

    if (updated) {
      await this.createLeadActivity({
        lead_id: updated.lead_id,
        activity_type: 'quotation_sent',
        title: `Status Quotation Diperbarui: ${updated.quote_number} → ${status.toUpperCase()}`,
        description: `Status penawaran "${updated.title}" diubah menjadi ${status}.`,
        actor_name: actorName,
      });

      // If accepted, advance lead to Closing
      if (status === 'accepted') {
        await this.updateLead(updated.lead_id, { status: 'Closing' });
      }
    }

    return updated;
  },

  async deleteQuotation(quoteId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('quotation_items').delete().eq('quotation_id', quoteId);
        await supabase.from('quotations').delete().eq('id', quoteId);
        return true;
      } catch (e) {
        console.error('Supabase deleteQuotation error:', e);
        return false;
      }
    }
    return true;
  },

  // ==========================================
  // 4. ACTIVITY TIMELINE (360° View) - Pure Supabase Online
  // ==========================================
  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('lead_activities')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data;
        }
        return [];
      } catch (e) {
        console.error('Supabase getLeadActivities error:', e);
        return [];
      }
    }

    return [];
  },

  async createLeadActivity(
    activity: Omit<LeadActivity, 'id' | 'created_at'>
  ): Promise<LeadActivity> {
    const newActivity: LeadActivity = {
      ...activity,
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `act-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('lead_activities')
          .insert([newActivity])
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.error('Supabase createLeadActivity error:', e);
      }
    }

    return newActivity;
  },

  // ==========================================
  // 5. TASKS / FOLLOW-UP REMINDERS - Pure Supabase Online
  // ==========================================
  async getLeadTasks(leadId: string): Promise<LeadTask[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('lead_tasks')
          .select('*')
          .eq('lead_id', leadId)
          .order('is_completed', { ascending: true })
          .order('due_date', { ascending: true });
        if (!error && data) {
          return data;
        }
        return [];
      } catch (e) {
        console.error('Supabase getLeadTasks error:', e);
        return [];
      }
    }

    return [];
  },

  async createLeadTask(
    task: Omit<LeadTask, 'id' | 'created_at'>,
    actorName: string = 'Tim Worrie'
  ): Promise<LeadTask> {
    const newTask: LeadTask = {
      ...task,
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `task-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('lead_tasks')
          .insert([newTask])
          .select()
          .single();
        if (!error && data) {
          await this.createLeadActivity({
            lead_id: task.lead_id,
            activity_type: 'note_created',
            title: `Pengingat Dibuat: ${task.title}`,
            description: `Tenggat waktu: ${task.due_date}`,
            actor_name: actorName,
          });
          return data;
        }
      } catch (e) {
        console.error('Supabase createLeadTask error:', e);
      }
    }

    return newTask;
  },

  async toggleLeadTask(
    taskId: string,
    is_completed: boolean,
    actorName: string = 'Tim Worrie'
  ): Promise<LeadTask | null> {
    let updated: LeadTask | null = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('lead_tasks')
          .update({
            is_completed,
            completed_at: is_completed ? new Date().toISOString() : null,
          })
          .eq('id', taskId)
          .select()
          .single();
        if (!error && data) updated = data;
      } catch (e) {
        console.error('Supabase toggleLeadTask error:', e);
      }
    }

    if (updated && is_completed) {
      await this.createLeadActivity({
        lead_id: updated.lead_id,
        activity_type: 'note_created',
        title: `Tugas Selesai: ${updated.title}`,
        description: 'Tugas follow up telah ditandai selesai.',
        actor_name: actorName,
      });
    }

    return updated;
  },

  async deleteLeadTask(taskId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('lead_tasks').delete().eq('id', taskId);
        return true;
      } catch (e) {
        console.error('Supabase deleteLeadTask error:', e);
        return false;
      }
    }
    return true;
  },

  // ==========================================
  // 6. GLOBAL AGGREGATIONS & CROSS-LEAD QUERIES (Pure Supabase Online)
  // ==========================================
  async getAllQuotations(): Promise<Array<Quotation & { lead?: Lead }>> {
    let cloudQuotes: Quotation[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('quotations')
          .select('*, items:quotation_items(*)')
          .order('created_at', { ascending: false });
        if (!error && data) {
          cloudQuotes = data;
        }
      } catch (e) {
        console.error('Supabase getAllQuotations error:', e);
      }
    }

    const leads = await this.getLeads();
    const leadsMap = new Map(leads.map((l) => [l.id, l]));

    return cloudQuotes.map((q) => ({
      ...q,
      lead: leadsMap.get(q.lead_id),
    }));
  },

  async getAllTasks(): Promise<Array<LeadTask & { lead?: Lead }>> {
    let cloudTasks: LeadTask[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('lead_tasks')
          .select('*')
          .order('due_date', { ascending: true });
        if (!error && data) {
          cloudTasks = data;
        }
      } catch (e) {
        console.error('Supabase getAllTasks error:', e);
      }
    }

    const leads = await this.getLeads();
    const leadsMap = new Map(leads.map((l) => [l.id, l]));

    return cloudTasks.map((t) => ({
      ...t,
      lead: leadsMap.get(t.lead_id),
    }));
  },

  async getAllActivities(limit: number = 20): Promise<Array<LeadActivity & { lead?: Lead }>> {
    let cloudActs: LeadActivity[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('lead_activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (!error && data) {
          cloudActs = data;
        }
      } catch (e) {
        console.error('Supabase getAllActivities error:', e);
      }
    }

    const leads = await this.getLeads();
    const leadsMap = new Map(leads.map((l) => [l.id, l]));

    return cloudActs.map((a) => ({
      ...a,
      lead: leadsMap.get(a.lead_id),
    }));
  },

  async getAllContacts(): Promise<Array<LeadContact & { lead?: Lead }>> {
    let cloudContacts: LeadContact[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('lead_contacts')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          cloudContacts = data;
        }
      } catch (e) {
        console.error('Supabase getAllContacts error:', e);
      }
    }

    const leads = await this.getLeads();
    const leadsMap = new Map(leads.map((l) => [l.id, l]));

    return cloudContacts.map((c) => ({
      ...c,
      lead: leadsMap.get(c.lead_id),
    }));
  },

  // ==========================================
  // SERVICE PACKAGES (Katalog & Daftar Harga)
  // ==========================================
  async getServicePackages(): Promise<ServicePackage[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('service_packages')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.error('Supabase getServicePackages error', e);
      }
    }
    // Fallback to localStorage or DEFAULT_SERVICE_PACKAGES
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('worrie_service_packages');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return DEFAULT_SERVICE_PACKAGES;
  },

  async createServicePackage(pkg: Omit<ServicePackage, 'id' | 'created_at' | 'updated_at'>): Promise<ServicePackage> {
    const newPkg: ServicePackage = {
      ...pkg,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pkg-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('service_packages')
          .insert([newPkg])
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.error('Supabase createServicePackage error', e);
      }
    }

    if (typeof window !== 'undefined') {
      const current = await this.getServicePackages();
      const updated = [...current, newPkg];
      localStorage.setItem('worrie_service_packages', JSON.stringify(updated));
    }
    return newPkg;
  },

  async updateServicePackage(id: string, updates: Partial<ServicePackage>): Promise<ServicePackage | null> {
    const timestamp = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('service_packages')
          .update({ ...updates, updated_at: timestamp })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.error('Supabase updateServicePackage error', e);
      }
    }

    if (typeof window !== 'undefined') {
      const current = await this.getServicePackages();
      const index = current.findIndex((p) => p.id === id);
      if (index !== -1) {
        const updated = { ...current[index], ...updates, updated_at: timestamp };
        current[index] = updated;
        localStorage.setItem('worrie_service_packages', JSON.stringify(current));
        return updated;
      }
    }
    return null;
  },

  async deleteServicePackage(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('service_packages')
          .delete()
          .eq('id', id);
        if (!error) return true;
      } catch (e) {
        console.error('Supabase deleteServicePackage error', e);
      }
    }

    if (typeof window !== 'undefined') {
      const current = await this.getServicePackages();
      const filtered = current.filter((p) => p.id !== id);
      localStorage.setItem('worrie_service_packages', JSON.stringify(filtered));
      return true;
    }
    return false;
  },

  async resetServicePackagesToDefault(): Promise<ServicePackage[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('service_packages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        const toInsert = DEFAULT_SERVICE_PACKAGES.map((p) => ({
          ...p,
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined,
        }));
        const { data, error } = await supabase.from('service_packages').insert(toInsert).select();
        if (!error && data) return data;
      } catch (e) {
        console.error('Supabase resetServicePackagesToDefault error', e);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('worrie_service_packages', JSON.stringify(DEFAULT_SERVICE_PACKAGES));
    }
    return DEFAULT_SERVICE_PACKAGES;
  },
};

