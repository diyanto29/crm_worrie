'use client';

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Campaign, Lead, MessageTemplate, AppSettings, LeadStatus } from '@/types/database';
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
    notes: 'Sudah ada tim in-house marketing.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  id: 'setting-1',
  gateway_provider: 'xsender',
  api_key: '',
  sender_number: '6281234567890',
  updated_at: new Date().toISOString(),
};

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

    // Merge: Include cloud campaigns, plus any local campaigns not present in cloud
    const cloudIds = new Set(cloudCampaigns.map((c) => c.id));
    const merged: Campaign[] = [...cloudCampaigns];

    for (const lc of localCampaigns) {
      if (!cloudIds.has(lc.id)) {
        merged.push({
          ...lc,
          leads_count: localLeads.filter((l) => l.campaign_id === lc.id).length,
        });
      }
    }

    // Ensure accurate leads_count from local if cloud reported 0
    return merged.map((c) => {
      const localCount = localLeads.filter((l) => l.campaign_id === c.id).length;
      return {
        ...c,
        leads_count: Math.max(c.leads_count || 0, localCount),
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
};
