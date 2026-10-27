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
  UserProfile
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

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Klinik Gigi & Dental Jaksel',
    keyword: 'Klinik Gigi',
    location: 'Jakarta Selatan',
    max_results: 20,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'camp-2',
    name: 'Cafe & Resto Aesthetic Bandung',
    keyword: 'Cafe aesthetic',
    location: 'Bandung',
    max_results: 15,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user-asep',
    full_name: 'Asep Gustiawan',
    email: 'asep@worrie.id',
    role: 'superadmin',
    phone: '081234567890',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'user-budi',
    full_name: 'Budi Santoso',
    email: 'budi.santoso@worrie.id',
    role: 'admin',
    phone: '081398765432',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'user-siti',
    full_name: 'Siti Aisyah',
    email: 'siti.aisyah@worrie.id',
    role: 'marketing',
    phone: '081122334455',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'user-rian',
    full_name: 'Rian Pratama',
    email: 'rian.pratama@worrie.id',
    role: 'marketing',
    phone: '085678901234',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

const DEFAULT_LEADS: Lead[] = [
  {
    id: 'lead-1',
    campaign_id: 'camp-1',
    business_name: 'Drg. Senyum Sehat Dental Care',
    address: 'Jl. Fatmawati Raya No. 42, Cilandak, Jakarta Selatan',
    phone: '081234567890',
    rating: 4.8,
    reviews_count: 142,
    has_website: false,
    website_url: null,
    gmaps_url: 'https://maps.google.com/?q=Drg.+Senyum+Sehat+Dental+Care',
    status: 'Belum dihubungi',
    deal_value: 0,
    assigned_to: 'Asep Gustiawan',
    notes: 'Klinik ramai tapi belum punya website pemesanan janji temu.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'lead-2',
    campaign_id: 'camp-1',
    business_name: 'South Smiles Aesthetic Dentistry',
    address: 'Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan',
    phone: '081398765432',
    rating: 4.9,
    reviews_count: 230,
    has_website: true,
    website_url: 'https://southsmilesdental.com',
    gmaps_url: 'https://maps.google.com/?q=South+Smiles+Aesthetic',
    status: 'Follow Up',
    deal_value: 2500000,
    assigned_to: 'Budi Santoso',
    notes: 'Sudah ada website lama, tertarik redesign dan integrasi WhatsApp booking.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'lead-3',
    campaign_id: 'camp-1',
    business_name: 'Praktek Dokter Gigi Kemang Family',
    address: 'Jl. Kemang Raya No. 12, Bangka, Jakarta Selatan',
    phone: '081122334455',
    rating: 4.7,
    reviews_count: 88,
    has_website: false,
    website_url: null,
    gmaps_url: 'https://maps.google.com/?q=Praktek+Dokter+Gigi+Kemang',
    status: 'Closing',
    deal_value: 3500000,
    assigned_to: 'Siti Aisyah',
    notes: 'Deal paket Web Custom + Google Maps SEO. DP 50% sudah diterima.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'lead-4',
    campaign_id: 'camp-2',
    business_name: 'Kopi Ruang Tenang Bandung',
    address: 'Jl. Riau No. 105, Bandung',
    phone: '085678901234',
    rating: 4.6,
    reviews_count: 312,
    has_website: false,
    website_url: null,
    gmaps_url: 'https://maps.google.com/?q=Kopi+Ruang+Tenang+Bandung',
    status: 'Dihubungi',
    deal_value: 1200000,
    assigned_to: 'Rian Pratama',
    notes: 'Pesan WA sudah dibaca, pemilik meminta dikirimkan pricelist.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'lead-5',
    campaign_id: 'camp-2',
    business_name: 'Dago Forest Eatery & Coffee',
    address: 'Jl. Ir. H. Juanda No. 340, Dago, Bandung',
    phone: '087788990011',
    rating: 4.5,
    reviews_count: 95,
    has_website: true,
    website_url: 'https://dagoforesteatery.co.id',
    gmaps_url: 'https://maps.google.com/?q=Dago+Forest+Eatery',
    status: 'Ditolak',
    deal_value: 0,
    assigned_to: null,
    notes: 'Sudah ada tim in-house marketing.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

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

const DEFAULT_PROSPECTS: CampaignProspect[] = [
  {
    id: 'prospect-1',
    campaign_id: 'camp-1',
    business_name: 'SMK Negeri 1 Jakarta (Pusat Kejuruan Bisnis & TI)',
    category: 'Sekolah Menengah Kejuruan',
    address: 'Jl. Budi Utomo No. 7, Sawah Besar, Jakarta Pusat',
    phone: '081298765432',
    rating: 4.8,
    reviews_count: 98,
    has_website: true,
    website_url: 'https://smkn1jakarta.sch.id',
    gmaps_url: 'https://maps.google.com/?q=SMKN+1+Jakarta',
    prospect_score: 95,
    curation_status: 'draft',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'prospect-2',
    campaign_id: 'camp-1',
    business_name: 'SMA Labschool Kebayoran Jakarta',
    category: 'Sekolah Menengah Atas',
    address: 'Jl. KH. Ahmad Dahlan No. 14, Kebayoran Baru, Jakarta Selatan',
    phone: '081345678901',
    rating: 4.9,
    reviews_count: 145,
    has_website: true,
    website_url: 'https://labschool-unj.sch.id',
    gmaps_url: 'https://maps.google.com/?q=Labschool+Kebayoran',
    prospect_score: 92,
    curation_status: 'draft',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'prospect-3',
    campaign_id: 'camp-1',
    business_name: 'SMK Taruna Bhakti Depok',
    category: 'Sekolah Menengah Kejuruan',
    address: 'Jl. Pekapuran No. 1, Curug, Cimanggis, Depok',
    phone: '081199887766',
    rating: 4.7,
    reviews_count: 210,
    has_website: true,
    website_url: 'https://smktarunabhakti.net',
    gmaps_url: 'https://maps.google.com/?q=SMK+Taruna+Bhakti',
    prospect_score: 89,
    curation_status: 'reviewed',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'prospect-4',
    campaign_id: 'camp-2',
    business_name: 'SMK Telkom Bandung',
    category: 'Sekolah Menengah Kejuruan',
    address: 'Jl. Radio Palasari, Dayeuhkolot, Bandung',
    phone: '082155667788',
    rating: 4.9,
    reviews_count: 180,
    has_website: true,
    website_url: 'https://smktelkom-bdg.sch.id',
    gmaps_url: 'https://maps.google.com/?q=SMK+Telkom+Bandung',
    prospect_score: 96,
    curation_status: 'converted',
    converted_lead_id: 'lead-1',
    converted_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const DEFAULT_CONTACTS: LeadContact[] = [
  {
    id: 'cont-1',
    lead_id: 'lead-1',
    name: 'Dr. H. Bambang Sutrisno, M.Pd',
    role: 'Owner',
    phone: '081234567890',
    email: 'bambang.s@institusi.sch.id',
    is_primary: true,
    notes: 'Kepala Sekolah - Pembuat keputusan akhir MOU kemitraan',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'cont-2',
    lead_id: 'lead-1',
    name: 'Ibu Ratna Dewi, S.Psi',
    role: 'Staff Operasional',
    phone: '081299887766',
    email: 'ratna.bk@institusi.sch.id',
    is_primary: false,
    notes: 'Koordinator Bimbingan Konseling (BK) untuk seminar karir digital',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'cont-3',
    lead_id: 'lead-1',
    name: 'Pak Dimas Anggoro, S.Kom',
    role: 'Manajer Marketing',
    phone: '081388776655',
    email: 'humas@institusi.sch.id',
    is_primary: false,
    notes: 'Ketua Hubungan Industri (Hubin) & Humas',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const DEFAULT_QUOTATIONS: Quotation[] = [
  {
    id: 'quot-1',
    lead_id: 'lead-1',
    quote_number: 'Q-WORRIE/2026/X/001',
    title: 'Paket Kemitraan Seminar & Bootcamp Digital Remote Work 2026',
    status: 'sent',
    subtotal: 8500000,
    discount: 1000000,
    tax: 0,
    grand_total: 7500000,
    valid_until: '2026-11-30',
    terms_conditions: 'DP 50% setelah penandatanganan MOU kemitraan, sisa 50% H-3 pelaksanaan.',
    notes: 'Termasuk sertifikat resmi Worrie.id, modul materi PDF, dan akses LMS 6 bulan untuk 150 siswa.',
    created_by: 'Tim Kemitraan Worrie.id',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const DEFAULT_QUOTATION_ITEMS: QuotationItem[] = [
  {
    id: 'qi-1',
    quotation_id: 'quot-1',
    item_name: 'Workshop Intensive: Remote Work Readiness & Global Portfolio',
    description: 'Pelatihan 2 hari offline/hybrid: LinkedIn profile, Upwork/Fiverr setup, portfolio digital',
    qty: 1,
    unit_price: 5000000,
    total_price: 5000000,
    sort_order: 1,
  },
  {
    id: 'qi-2',
    quotation_id: 'quot-1',
    item_name: 'Seminar Inspiratif: Peluang Karir Internasional dari Rumah',
    description: 'Sesi stadium general untuk 150 siswa & guru pembimbing',
    qty: 1,
    unit_price: 3500000,
    total_price: 3500000,
    sort_order: 2,
  },
];

const DEFAULT_ACTIVITIES: LeadActivity[] = [
  {
    id: 'act-1',
    lead_id: 'lead-1',
    activity_type: 'converted_from_draft',
    title: 'Prospek Dikonversi dari Draft Hasil Screening',
    description: 'Prospek disetujui masuk ke pipeline aktif CRM setelah verifikasi nomor WA.',
    actor_name: 'Admin Worrie',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'act-2',
    lead_id: 'lead-1',
    activity_type: 'contact_added',
    title: 'Kontak A Ditambahkan: Dr. H. Bambang Sutrisno (Kepala Sekolah)',
    description: 'Kontak utama ditambahkan dengan nomor WA 081234567890.',
    actor_name: 'Admin Worrie',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'act-3',
    lead_id: 'lead-1',
    activity_type: 'whatsapp_sent',
    title: 'WhatsApp Pengantar Proposal Terkirim',
    description: 'Mengirimkan surat pengantar program kemitraan edukasi digital remote work.',
    actor_name: 'Marketing Worrie',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'act-4',
    lead_id: 'lead-1',
    activity_type: 'quotation_created',
    title: 'Quotation Q-WORRIE/2026/X/001 Diterbitkan',
    description: 'Penawaran paket kemitraan seminar & bootcamp senilai Rp 7.500.000 diterbitkan.',
    actor_name: 'Admin Worrie',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const DEFAULT_TASKS: LeadTask[] = [
  {
    id: 'task-1',
    lead_id: 'lead-1',
    title: 'Follow-up telepon ke Bu Ratna (Guru BK) untuk jadwal presentasi online',
    due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    is_completed: false,
    created_at: new Date().toISOString(),
  },
];

// Local storage helper
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

  // CAMPAIGNS
  // CAMPAIGNS
  async getCampaigns(): Promise<Campaign[]> {
    let cloudCampaigns: Campaign[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*, leads(count)')
          .order('created_at', { ascending: false });
        if (!error && data) {
          cloudCampaigns = data.map((item: any) => ({
            ...item,
            leads_count: item.leads?.[0]?.count || 0,
          }));
        }
      } catch (e) {
        console.warn('Falling back to local campaigns', e);
      }
    }

    const localCampaigns = getLocal<Campaign[]>('campaigns', DEFAULT_CAMPAIGNS);
    const localLeads = getLocal<Lead[]>('leads', DEFAULT_LEADS);
    const localProspects = getLocal<CampaignProspect[]>('campaign_prospects', DEFAULT_PROSPECTS);

    // Merge: Include cloud campaigns, plus any local campaigns not present in cloud
    const cloudIds = new Set(cloudCampaigns.map((c) => c.id));
    const merged: Campaign[] = [...cloudCampaigns];

    for (const lc of localCampaigns) {
      if (!cloudIds.has(lc.id)) {
        merged.push({
          ...lc,
          leads_count: localLeads.filter((l) => l.campaign_id === lc.id).length,
          prospects_count: localProspects.filter((p) => p.campaign_id === lc.id).length,
        });
      }
    }

    // Ensure accurate counts from local
    return merged.map((c) => {
      const localCount = localLeads.filter((l) => l.campaign_id === c.id).length;
      const localProspectCount = localProspects.filter((p) => p.campaign_id === c.id).length;
      return {
        ...c,
        leads_count: Math.max(c.leads_count || 0, localCount),
        prospects_count: Math.max(c.prospects_count || 0, localProspectCount),
      };
    });
  },

  async getCampaignById(id: string): Promise<Campaign | null> {
    const campaigns = await this.getCampaigns();
    const found = campaigns.find((c) => c.id === id);
    if (found) return found;

    // Fallback directly to local storage
    const localCampaigns = getLocal<Campaign[]>('campaigns', DEFAULT_CAMPAIGNS);
    return localCampaigns.find((c) => c.id === id) || null;
  },

  async createCampaign(campaign: Omit<Campaign, 'id' | 'created_at'>): Promise<Campaign> {
    const newCampaign: Campaign = {
      ...campaign,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `camp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    // Save to local storage first for instant reliability
    const current = getLocal<Campaign[]>('campaigns', DEFAULT_CAMPAIGNS);
    setLocal('campaigns', [newCampaign, ...current]);

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
          console.warn('Supabase createCampaign error, using local:', error);
        }
      } catch (e) {
        console.warn('Falling back to local createCampaign', e);
      }
    }

    return newCampaign;
  },

  async deleteCampaign(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('campaigns').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteCampaign error', e);
      }
    }
    const current = getLocal<Campaign[]>('campaigns', DEFAULT_CAMPAIGNS);
    setLocal('campaigns', current.filter((c) => c.id !== id));
    
    // Also remove leads associated with this campaign
    const leads = getLocal<Lead[]>('leads', DEFAULT_LEADS);
    setLocal('leads', leads.filter((l) => l.campaign_id !== id));
    return true;
  },

  // LEADS
  async getLeads(campaignId?: string): Promise<Lead[]> {
    let cloudLeads: Lead[] = [];
    let cloudHasData = false;

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (campaignId) {
          query = query.eq('campaign_id', campaignId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          cloudLeads = data.map(ensureLeadScore);
          cloudHasData = true;
        }
      } catch (e) {
        console.warn('Falling back to local leads', e);
      }
    }

    // Always inspect local leads
    const localLeads = getLocal<Lead[]>('leads', DEFAULT_LEADS).map(ensureLeadScore);
    const filteredLocal = campaignId ? localLeads.filter((l) => l.campaign_id === campaignId) : localLeads;

    // If cloud has leads for this query, return cloud leads (plus any unique local ones)
    if (cloudHasData) {
      const cloudIds = new Set(cloudLeads.map((l) => l.id));
      const extraLocal = filteredLocal.filter((l) => !cloudIds.has(l.id));
      return [...cloudLeads, ...extraLocal];
    }

    // If cloud had 0 records or failed, use local leads
    if (filteredLocal.length > 0) {
      return filteredLocal;
    }

    return cloudLeads;
  },

  async getLeadById(id: string): Promise<Lead | null> {
    const leads = await this.getLeads();
    return leads.find((l) => l.id === id) || null;
  },

  async createLeadsBulk(newLeads: Omit<Lead, 'id' | 'created_at'>[]): Promise<Lead[]> {
    const leadsWithMeta: Lead[] = newLeads.map((item, idx) => {
      const score = typeof item.prospect_score === 'number' && item.prospect_score > 0
        ? item.prospect_score
        : calculateProspectScore(item);
      return {
        ...item,
        prospect_score: score,
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `lead-${Date.now()}-${idx}`,
        created_at: new Date().toISOString(),
      };
    });

    // Save to local storage immediately so data is NEVER lost
    const current = getLocal<Lead[]>('leads', DEFAULT_LEADS);
    const updated = [...leadsWithMeta, ...current];
    setLocal('leads', updated);

    // Sync to Supabase in cloud (strip prospect_score because column is not in SQL schema)
    if (isSupabaseConfigured && supabase) {
      try {
        const supabasePayload = leadsWithMeta.map(({ prospect_score, ...rest }) => rest);
        const { data, error } = await supabase.from('leads').insert(supabasePayload).select();
        if (!error && data && data.length > 0) {
          return data.map(ensureLeadScore);
        }
        if (error) {
          console.warn('Supabase createLeadsBulk error, using local copy:', error);
        }
      } catch (e) {
        console.warn('Falling back to local createLeadsBulk', e);
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
        await this.createLeadContact({
          lead_id: lead.id,
          name: `PIC / Narahubung ${lead.business_name}`,
          role: 'Lainnya',
          phone: newLead.phone,
          email: null,
          is_primary: true,
          notes: 'Kontak utama yang didaftarkan saat pembuatan Lead',
        }, actorName);
      }
      await this.createLeadActivity({
        lead_id: lead.id,
        activity_type: 'note_created',
        title: 'Lead Baru Ditambahkan',
        description: `Lead "${lead.business_name}" berhasil didaftarkan ke Database Leads oleh ${actorName}.`,
        actor_name: actorName,
      });
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
        if (!error && data && data.length > 0) {
          return data as UserProfile[];
        }
      } catch (err) {
        console.warn('Failed to load team profiles from Supabase:', err);
      }
    }
    const local = getLocal<UserProfile[]>('crm_profiles', []);
    if (local && local.length > 0) {
      return local;
    }
    return DEFAULT_PROFILES;
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    const { prospect_score, ...sanitizedUpdates } = updates;

    // Update local storage
    const current = getLocal<Lead[]>('leads', DEFAULT_LEADS);
    const index = current.findIndex((l) => l.id === id);
    let updatedLead: Lead | null = null;
    if (index !== -1) {
      updatedLead = ensureLeadScore({ ...current[index], ...updates });
      current[index] = updatedLead;
      setLocal('leads', current);
    }

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
        console.warn('Falling back to local updateLead', e);
      }
    }

    return updatedLead;
  },

  async deleteLead(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('leads').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteLead error', e);
      }
    }
    const current = getLocal<Lead[]>('leads', DEFAULT_LEADS);
    setLocal('leads', current.filter((l) => l.id !== id));
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
        if (!error && data) return data;
      } catch (e) {
        console.warn('Falling back to local templates', e);
      }
    }
    return getLocal<MessageTemplate[]>('templates', DEFAULT_TEMPLATES);
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
        console.warn('Falling back to local createTemplate', e);
      }
    }

    const current = getLocal<MessageTemplate[]>('templates', DEFAULT_TEMPLATES);
    const updated = [newTmpl, ...current];
    setLocal('templates', updated);
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
        console.warn('Falling back to local updateTemplate', e);
      }
    }

    const current = getLocal<MessageTemplate[]>('templates', DEFAULT_TEMPLATES);
    const idx = current.findIndex(t => t.id === id);
    if (idx === -1) return null;
    current[idx] = { ...current[idx], ...updates };
    setLocal('templates', current);
    return current[idx];
  },

  async deleteTemplate(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('message_templates').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteTemplate error', e);
      }
    }
    const current = getLocal<MessageTemplate[]>('templates', DEFAULT_TEMPLATES);
    setLocal('templates', current.filter(t => t.id !== id));
    return true;
  },

  // SETTINGS
  async getSettings(): Promise<AppSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('app_settings').select('*').limit(1).single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Falling back to local settings', e);
      }
    }
    return getLocal<AppSettings>('settings', DEFAULT_SETTINGS);
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
        console.warn('Falling back to local updateSettings', e);
      }
    }

    setLocal('settings', updated);
    return updated;
  },

  // ==========================================
  // 1. CAMPAIGN PROSPECTS (DRAFT LIST)
  // ==========================================
  async getCampaignProspects(campaignId?: string): Promise<CampaignProspect[]> {
    let cloudProspects: CampaignProspect[] = [];
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
        if (!error && data && data.length > 0) {
          cloudProspects = data;
        }
      } catch (e) {
        console.warn('Falling back to local campaign prospects', e);
      }
    }

    const localProspects = getLocal<CampaignProspect[]>('campaign_prospects', DEFAULT_PROSPECTS);
    const filteredLocal = campaignId
      ? localProspects.filter((p) => p.campaign_id === campaignId)
      : localProspects;

    if (cloudProspects.length > 0) {
      const cloudIds = new Set(cloudProspects.map((p) => p.id));
      const extra = filteredLocal.filter((p) => !cloudIds.has(p.id));
      return [...cloudProspects, ...extra];
    }
    return filteredLocal;
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

    const current = getLocal<CampaignProspect[]>('campaign_prospects', DEFAULT_PROSPECTS);
    setLocal('campaign_prospects', [...list, ...current]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('campaign_prospects')
          .insert(list)
          .select();
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (e) {
        console.warn('Falling back to local createCampaignProspectsBulk', e);
      }
    }

    return list;
  },

  async updateProspectCuration(
    prospectId: string,
    curation_status: CurationStatus,
    reason?: string
  ): Promise<CampaignProspect | null> {
    const current = getLocal<CampaignProspect[]>('campaign_prospects', DEFAULT_PROSPECTS);
    const idx = current.findIndex((p) => p.id === prospectId);
    let updated: CampaignProspect | null = null;
    if (idx !== -1) {
      current[idx] = {
        ...current[idx],
        curation_status,
        disqualified_reason: reason || current[idx].disqualified_reason,
      };
      setLocal('campaign_prospects', current);
      updated = current[idx];
    }

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
        console.warn('Falling back to local updateProspectCuration', e);
      }
    }
    return updated;
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
        console.warn('Supabase update converted prospect error', e);
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
  // 2. MULTI-CONTACTS (lead_contacts)
  // ==========================================
  async getLeadContacts(leadId: string): Promise<LeadContact[]> {
    let cloudContacts: LeadContact[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('lead_contacts')
          .select('*')
          .eq('lead_id', leadId)
          .order('is_primary', { ascending: false });
        if (!error && data) {
          cloudContacts = data;
        }
      } catch (e) {
        console.warn('Falling back to local contacts', e);
      }
    }

    const localContacts = getLocal<LeadContact[]>('lead_contacts', DEFAULT_CONTACTS);
    const filteredLocal = localContacts.filter((c) => c.lead_id === leadId);

    if (cloudContacts.length > 0) {
      const cloudIds = new Set(cloudContacts.map((c) => c.id));
      const extra = filteredLocal.filter((c) => !cloudIds.has(c.id));
      return [...cloudContacts, ...extra];
    }
    return filteredLocal;
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
        console.warn('Falling back to local createLeadContact', e);
      }
    }

    // Log Activity locally
    await this.createLeadActivity({
      lead_id: contact.lead_id,
      activity_type: 'contact_added',
      title: `Kontak Ditambahkan: ${contact.name} (${contact.role})`,
      description: `Nomor telepon: ${contact.phone}${contact.email ? ` • Email: ${contact.email}` : ''}`,
      actor_name: actorName,
    });

    return newContact;
  },

  async updateLeadContact(
    id: string,
    updates: Partial<LeadContact>,
    actorName: string = 'Tim Worrie'
  ): Promise<LeadContact | null> {
    const current = getLocal<LeadContact[]>('lead_contacts', DEFAULT_CONTACTS);
    const idx = current.findIndex((c) => c.id === id);
    let updated: LeadContact | null = null;
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates, updated_at: new Date().toISOString() };
      setLocal('lead_contacts', current);
      updated = current[idx];
    }

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
        console.warn('Falling back to local updateLeadContact', e);
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
      } catch (e) {
        console.warn('Supabase deleteLeadContact error', e);
      }
    }
    const current = getLocal<LeadContact[]>('lead_contacts', DEFAULT_CONTACTS);
    setLocal('lead_contacts', current.filter((c) => c.id !== id));
    return true;
  },

  // ==========================================
  // 3. QUOTATIONS & ITEMS
  // ==========================================
  async getQuotations(leadId: string): Promise<Quotation[]> {
    let cloudQuotes: Quotation[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('quotations')
          .select('*, items:quotation_items(*)')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false });
        if (!error && data) {
          cloudQuotes = data;
        }
      } catch (e) {
        console.warn('Falling back to local quotations', e);
      }
    }

    const localQuotes = getLocal<Quotation[]>('quotations', DEFAULT_QUOTATIONS);
    const localItems = getLocal<QuotationItem[]>('quotation_items', DEFAULT_QUOTATION_ITEMS);

    const mergedLocal = localQuotes
      .filter((q) => q.lead_id === leadId)
      .map((q) => ({
        ...q,
        items: localItems.filter((i) => i.quotation_id === q.id),
      }));

    if (cloudQuotes.length > 0) {
      const cloudIds = new Set(cloudQuotes.map((q) => q.id));
      const extra = mergedLocal.filter((q) => !cloudIds.has(q.id));
      return [...cloudQuotes, ...extra];
    }
    return mergedLocal;
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

    // Local Storage Save
    const currentQuotes = getLocal<Quotation[]>('quotations', DEFAULT_QUOTATIONS);
    setLocal('quotations', [newQuote, ...currentQuotes]);

    const currentItems = getLocal<QuotationItem[]>('quotation_items', DEFAULT_QUOTATION_ITEMS);
    setLocal('quotation_items', [...newItems, ...currentItems]);

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
        console.warn('Falling back to local createQuotation', e);
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
    const current = getLocal<Quotation[]>('quotations', DEFAULT_QUOTATIONS);
    const idx = current.findIndex((q) => q.id === quoteId);
    let updated: Quotation | null = null;
    if (idx !== -1) {
      current[idx] = { ...current[idx], status, updated_at: new Date().toISOString() };
      setLocal('quotations', current);
      updated = current[idx];
    }

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
        console.warn('Falling back to local updateQuotationStatus', e);
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
      } catch (e) {
        console.warn('Supabase deleteQuotation error', e);
      }
    }
    const currentQuotes = getLocal<Quotation[]>('quotations', DEFAULT_QUOTATIONS);
    setLocal('quotations', currentQuotes.filter((q) => q.id !== quoteId));
    const currentItems = getLocal<QuotationItem[]>('quotation_items', DEFAULT_QUOTATION_ITEMS);
    setLocal('quotation_items', currentItems.filter((i) => i.quotation_id !== quoteId));
    return true;
  },

  // ==========================================
  // 4. ACTIVITY TIMELINE (360° View)
  // ==========================================
  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    let cloudActivities: LeadActivity[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('lead_activities')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false });
        if (!error && data) {
          cloudActivities = data;
        }
      } catch (e) {
        console.warn('Falling back to local activities', e);
      }
    }

    const localActivities = getLocal<LeadActivity[]>('lead_activities', DEFAULT_ACTIVITIES);
    const filteredLocal = localActivities.filter((a) => a.lead_id === leadId);

    if (cloudActivities.length > 0) {
      const cloudIds = new Set(cloudActivities.map((a) => a.id));
      const extra = filteredLocal.filter((a) => !cloudIds.has(a.id));
      return [...cloudActivities, ...extra].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return filteredLocal.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
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

    const current = getLocal<LeadActivity[]>('lead_activities', DEFAULT_ACTIVITIES);
    setLocal('lead_activities', [newActivity, ...current]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('lead_activities')
          .insert([newActivity])
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Falling back to local createLeadActivity', e);
      }
    }

    return newActivity;
  },

  // ==========================================
  // 5. TASKS / FOLLOW-UP REMINDERS
  // ==========================================
  async getLeadTasks(leadId: string): Promise<LeadTask[]> {
    let cloudTasks: LeadTask[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('lead_tasks')
          .select('*')
          .eq('lead_id', leadId)
          .order('is_completed', { ascending: true })
          .order('due_date', { ascending: true });
        if (!error && data) {
          cloudTasks = data;
        }
      } catch (e) {
        console.warn('Falling back to local tasks', e);
      }
    }

    const localTasks = getLocal<LeadTask[]>('lead_tasks', DEFAULT_TASKS);
    const filteredLocal = localTasks.filter((t) => t.lead_id === leadId);

    if (cloudTasks.length > 0) {
      const cloudIds = new Set(cloudTasks.map((t) => t.id));
      const extra = filteredLocal.filter((t) => !cloudIds.has(t.id));
      return [...cloudTasks, ...extra];
    }
    return filteredLocal;
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

    const current = getLocal<LeadTask[]>('lead_tasks', DEFAULT_TASKS);
    setLocal('lead_tasks', [newTask, ...current]);

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
        console.warn('Falling back to local createLeadTask', e);
      }
    }

    await this.createLeadActivity({
      lead_id: task.lead_id,
      activity_type: 'note_created',
      title: `Pengingat Dibuat: ${task.title}`,
      description: `Tenggat waktu: ${task.due_date}`,
      actor_name: actorName,
    });

    return newTask;
  },

  async toggleLeadTask(
    taskId: string,
    is_completed: boolean,
    actorName: string = 'Tim Worrie'
  ): Promise<LeadTask | null> {
    const current = getLocal<LeadTask[]>('lead_tasks', DEFAULT_TASKS);
    const idx = current.findIndex((t) => t.id === taskId);
    let updated: LeadTask | null = null;
    if (idx !== -1) {
      current[idx] = {
        ...current[idx],
        is_completed,
        completed_at: is_completed ? new Date().toISOString() : null,
      };
      setLocal('lead_tasks', current);
      updated = current[idx];
    }

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
        console.warn('Falling back to local toggleLeadTask', e);
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
      } catch (e) {
        console.warn('Supabase deleteLeadTask error', e);
      }
    }
    const current = getLocal<LeadTask[]>('lead_tasks', DEFAULT_TASKS);
    setLocal('lead_tasks', current.filter((t) => t.id !== taskId));
    return true;
  },

  // ==========================================
  // 6. GLOBAL AGGREGATIONS & CROSS-LEAD QUERIES
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
        console.warn('Falling back to local quotations', e);
      }
    }

    const localQuotes = getLocal<Quotation[]>('quotations', DEFAULT_QUOTATIONS);
    const localItems = getLocal<QuotationItem[]>('quotation_items', DEFAULT_QUOTATION_ITEMS);
    const mergedLocal = localQuotes.map((q) => ({
      ...q,
      items: localItems.filter((i) => i.quotation_id === q.id),
    }));

    const allQuotes = cloudQuotes.length > 0 ? cloudQuotes : mergedLocal;
    const leads = await this.getLeads();
    const leadsMap = new Map(leads.map((l) => [l.id, l]));

    return allQuotes.map((q) => ({
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
        console.warn('Falling back to local tasks', e);
      }
    }

    const localTasks = getLocal<LeadTask[]>('lead_tasks', DEFAULT_TASKS);
    const allTasks = cloudTasks.length > 0 ? cloudTasks : localTasks;
    const leads = await this.getLeads();
    const leadsMap = new Map(leads.map((l) => [l.id, l]));

    return allTasks.map((t) => ({
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
        console.warn('Falling back to local activities', e);
      }
    }

    const localActs = getLocal<LeadActivity[]>('lead_activities', DEFAULT_ACTIVITIES);
    const allActs = (cloudActs.length > 0 ? cloudActs : localActs)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    const leads = await this.getLeads();
    const leadsMap = new Map(leads.map((l) => [l.id, l]));

    return allActs.map((a) => ({
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
        console.warn('Falling back to local contacts', e);
      }
    }

    const localContacts = getLocal<LeadContact[]>('lead_contacts', DEFAULT_CONTACTS);
    const allContacts = cloudContacts.length > 0 ? cloudContacts : localContacts;
    const leads = await this.getLeads();
    const leadsMap = new Map(leads.map((l) => [l.id, l]));

    return allContacts.map((c) => ({
      ...c,
      lead: leadsMap.get(c.lead_id),
    }));
  },
};
