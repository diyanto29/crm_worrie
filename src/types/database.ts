export type LeadStatus = 'Belum dihubungi' | 'Dihubungi' | 'Follow Up' | 'Quotation' | 'Closing' | 'Ditolak';

export type CurationStatus = 'draft' | 'reviewed' | 'disqualified' | 'converted';

export type ContactRole = 'Owner' | 'Direktur' | 'Manajer Marketing' | 'Staff Operasional' | 'Admin' | 'Lainnya';

export type QuotationStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';

export type ActivityType = 
  | 'converted_from_draft'
  | 'contact_added'
  | 'contact_updated'
  | 'stage_changed'
  | 'whatsapp_sent'
  | 'phone_call'
  | 'meeting'
  | 'note_created'
  | 'quotation_created'
  | 'quotation_sent'
  | 'deal_value_changed';

export type UserRole = 'superadmin' | 'admin' | 'sales_manager' | 'marketing';

export interface UserProfile {
  id: string;
  user_id?: string;
  full_name: string;
  email?: string | null;
  role: UserRole;
  phone?: string | null;
  avatar_url?: string | null;
  is_active?: boolean;
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  keyword: string;
  location: string;
  max_results: number;
  target_results?: number;
  status?: 'draft' | 'scraping' | 'completed' | 'archived';
  created_by?: string | null;
  created_at: string;
  updated_at?: string;
  // Computed or aggregated
  leads_count?: number;
  prospects_count?: number;
}

// 1. Draft Prospek Mentah (Hasil Scrape sebelum masuk Pipeline)
export interface CampaignProspect {
  id: string;
  campaign_id: string;
  business_name: string;
  category?: string | null;
  address?: string | null;
  phone?: string | null;
  rating?: number | null;
  reviews_count?: number;
  has_website?: boolean;
  website_url?: string | null;
  gmaps_url?: string | null;
  prospect_score?: number;
  curation_status: CurationStatus;
  disqualified_reason?: string | null;
  converted_lead_id?: string | null;
  converted_at?: string | null;
  converted_by?: string | null;
  created_at: string;
}

// 2. Leads / Pipeline CRM Resmi
export interface Lead {
  id: string;
  source_prospect_id?: string | null;
  campaign_id?: string;
  business_name: string;
  brand_name?: string | null;
  address?: string | null;
  primary_phone?: string | null;
  phone?: string | null;
  rating?: number | null;
  reviews_count?: number;
  has_website?: boolean;
  website_url?: string | null;
  gmaps_url?: string | null;
  status: LeadStatus;
  stage?: LeadStatus;
  deal_value?: number;
  target_close_date?: string | null;
  lost_reason?: string | null;
  assigned_to?: string | null;
  next_action_at?: string | null;
  next_action_notes?: string | null;
  document_links?: Array<{ id: string; title: string; url: string; category?: string }>;
  prospect_score?: number;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

// 3. Multi-Kontak (Kontak A, B, C per Bisnis)
export interface LeadContact {
  id: string;
  lead_id: string;
  name: string;
  role: ContactRole;
  phone: string;
  email?: string | null;
  is_primary: boolean;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string;
}

// 4. Quotation & Quotation Items (Penawaran Harga)
export interface QuotationItem {
  id: string;
  quotation_id: string;
  item_name: string;
  description?: string | null;
  qty: number;
  unit_price: number;
  total_price: number;
  sort_order?: number;
}

export interface Quotation {
  id: string;
  lead_id: string;
  contact_id?: string | null;
  quote_number: string;
  title: string;
  status: QuotationStatus;
  subtotal: number;
  discount: number;
  tax: number;
  grand_total: number;
  valid_until: string;
  terms_conditions?: string | null;
  notes?: string | null;
  pdf_url?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string;
  items?: QuotationItem[];
}

// 5. Activity Log (Timeline 360° View)
export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: ActivityType;
  title: string;
  description?: string | null;
  metadata?: Record<string, unknown>;
  actor_name: string;
  created_by?: string | null;
  created_at: string;
}

// 6. Tasks / Reminder Follow-Up
export interface LeadTask {
  id: string;
  lead_id: string;
  title: string;
  due_date: string;
  is_completed: boolean;
  completed_at?: string | null;
  assigned_to?: string | null;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  category?: 'first_contact' | 'follow_up' | 'quotation' | 'closing';
  body: string;
  created_at: string;
}

export interface AppSettings {
  id: string;
  agency_name?: string;
  agency_address?: string | null;
  agency_email?: string | null;
  agency_phone?: string | null;
  agency_logo_url?: string | null;
  gateway_provider: 'xsender' | 'fonnte' | 'waha' | 'other';
  api_key: string | null;
  sender_number: string | null;
  updated_at: string;
}
