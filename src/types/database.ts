export type LeadStatus = 'Belum dihubungi' | 'Dihubungi' | 'Follow Up' | 'Closing' | 'Ditolak';

export interface Campaign {
  id: string;
  name: string;
  keyword: string;
  location: string;
  max_results: number;
  created_at: string;
  // Computed or aggregated
  leads_count?: number;
}

export interface Lead {
  id: string;
  campaign_id?: string;
  business_name: string;
  address?: string | null;
  phone?: string | null;
  rating?: number | null;
  reviews_count?: number;
  has_website?: boolean;
  website_url?: string | null;
  gmaps_url?: string | null;
  status: LeadStatus;
  deal_value?: number;
  prospect_score?: number;
  notes?: string | null;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

export interface AppSettings {
  id: string;
  gateway_provider: 'xsender' | 'fonnte' | 'waha' | 'other';
  api_key: string | null;
  sender_number: string | null;
  updated_at: string;
}
