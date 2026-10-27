'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Key, 
  Phone, 
  Radio, 
  Save, 
  CheckCircle2, 
  Database, 
  Copy, 
  Check, 
  Send, 
  Loader2, 
  ShieldCheck, 
  HelpCircle,
  ExternalLink,
  Lock,
  KeyRound,
  Shield
} from 'lucide-react';
import { DataStore } from '@/lib/dataStore';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { 
  isPinProtectionEnabled, 
  getStoredPin, 
  setCustomPin, 
  setPinProtectionEnabled, 
  lockWorkspace 
} from '@/components/PinProtection';
import { AppSettings } from '@/types/database';
import { useAuth } from '@/lib/authContext';

const SQL_SCHEMA_SCRIPT = `-- ==============================================================================
-- MIGRATION: 20261027094500_crm_upgrade_draft_contacts_activities_quotations.sql
-- TANGGAL  : 2026-10-27
-- DESKRIPSI: Skema Lengkap CRM Worrie (Draft Kampanye, Multi-Kontak, Activity 360, Quotation)
-- ==============================================================================

create extension if not exists "uuid-ossp";

-- 1. Profiles Tim Marketing
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  role text default 'marketing' check (role in ('admin', 'sales_manager', 'marketing')),
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Campaigns
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  keyword text not null,
  location text not null,
  target_results integer default 20,
  status text default 'completed' check (status in ('draft', 'scraping', 'completed', 'archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Draft Prospek Mentah (Sebelum masuk Pipeline)
create table if not exists public.campaign_prospects (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  business_name text not null,
  category text,
  address text,
  phone text,
  rating numeric(2,1),
  reviews_count integer default 0,
  has_website boolean default false,
  website_url text,
  gmaps_url text,
  prospect_score integer default 0,
  curation_status text default 'draft' check (curation_status in ('draft', 'reviewed', 'disqualified', 'converted')),
  disqualified_reason text,
  converted_lead_id uuid,
  converted_at timestamp with time zone,
  converted_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Leads / Deals Pipeline Aktif
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  source_prospect_id uuid references public.campaign_prospects(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  business_name text not null,
  brand_name text,
  address text,
  primary_phone text,
  phone text,
  rating numeric(2,1),
  reviews_count integer default 0,
  has_website boolean default false,
  website_url text,
  gmaps_url text,
  prospect_score integer default 0,
  stage text default 'Belum dihubungi' check (
    stage in ('Belum dihubungi', 'Dihubungi', 'Follow Up', 'Quotation', 'Negosiasi', 'Closing Won', 'Lost')
  ),
  deal_value numeric(14,2) default 0,
  target_close_date date,
  lost_reason text,
  assigned_to uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Multi-Kontak (Kontak A, B, C)
create table if not exists public.lead_contacts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade not null,
  name text not null,
  role text default 'Owner' check (role in ('Owner', 'Direktur', 'Manajer Marketing', 'Staff Operasional', 'Admin', 'Lainnya')),
  phone text not null,
  email text,
  is_primary boolean default false,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Quotation & Rincian Item Penawaran
create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade not null,
  contact_id uuid references public.lead_contacts(id) on delete set null,
  quote_number text unique not null,
  title text not null,
  status text default 'draft' check (status in ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  subtotal numeric(14,2) default 0 not null,
  discount numeric(14,2) default 0 not null,
  tax numeric(14,2) default 0 not null,
  grand_total numeric(14,2) default 0 not null,
  valid_until date not null,
  terms_conditions text,
  notes text,
  pdf_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid references public.quotations(id) on delete cascade not null,
  item_name text not null,
  description text,
  qty integer default 1 not null,
  unit_price numeric(14,2) not null,
  total_price numeric(14,2) not null,
  sort_order integer default 0
);

-- 7. Audit Trail & Timeline 360° View
create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade not null,
  activity_type text not null,
  title text not null,
  description text,
  metadata jsonb default '{}'::jsonb,
  actor_name text default 'Marketing',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Tasks & Reminder Follow-Up
create table if not exists public.lead_tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade not null,
  title text not null,
  due_date timestamp with time zone not null,
  is_completed boolean default false,
  completed_at timestamp with time zone,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Message Templates & Settings
create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text default 'first_contact',
  body text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  agency_name text default 'Worrie Digital Agency',
  agency_address text,
  agency_email text,
  agency_phone text,
  agency_logo_url text,
  gateway_provider text default 'xsender',
  api_key text,
  sender_number text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indeks
create index if not exists idx_campaign_prospects_camp on public.campaign_prospects(campaign_id);
create index if not exists idx_leads_stage on public.leads(stage);
create index if not exists idx_lead_contacts_lead on public.lead_contacts(lead_id);
create index if not exists idx_lead_activities_lead on public.lead_activities(lead_id, created_at desc);
create index if not exists idx_quotations_lead on public.quotations(lead_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_prospects enable row level security;
alter table public.leads enable row level security;
alter table public.lead_contacts enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.lead_activities enable row level security;
alter table public.lead_tasks enable row level security;
alter table public.message_templates enable row level security;
alter table public.app_settings enable row level security;

create policy "Allow all profiles" on public.profiles for all using (true);
create policy "Allow all campaigns" on public.campaigns for all using (true);
create policy "Allow all campaign_prospects" on public.campaign_prospects for all using (true);
create policy "Allow all leads" on public.leads for all using (true);
create policy "Allow all lead_contacts" on public.lead_contacts for all using (true);
create policy "Allow all quotations" on public.quotations for all using (true);
create policy "Allow all quotation_items" on public.quotation_items for all using (true);
create policy "Allow all lead_activities" on public.lead_activities for all using (true);
create policy "Allow all lead_tasks" on public.lead_tasks for all using (true);
create policy "Allow all message_templates" on public.message_templates for all using (true);
create policy "Allow all app_settings" on public.app_settings for all using (true);`;

export default function SettingsPage() {
  const { profile } = useAuth();
  const [provider, setProvider] = useState<'xsender' | 'fonnte' | 'waha' | 'other'>('xsender');
  const [apiKey, setApiKey] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Testing WhatsApp Gateway
  const [testPhone, setTestPhone] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // PIN Protection State
  const [pinEnabled, setPinEnabled] = useState(true);
  const [currentPin, setCurrentPin] = useState('123456');
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  useEffect(() => {
    setPinEnabled(isPinProtectionEnabled());
    setCurrentPin(getStoredPin());
  }, []);

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim() || newPin.trim().length < 4) {
      alert('PIN minimal harus terdiri dari 4 digit atau karakter.');
      return;
    }
    setCustomPin(newPin.trim());
    setCurrentPin(newPin.trim());
    setNewPin('');
    setPinSuccess(true);
    setTimeout(() => setPinSuccess(false), 3000);
  };

  const handleTogglePin = (enabled: boolean) => {
    setPinEnabled(enabled);
    setPinProtectionEnabled(enabled);
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await DataStore.getSettings();
        if (settings) {
          setProvider(settings.gateway_provider || 'xsender');
          setApiKey(settings.api_key || '');
          setSenderNumber(settings.sender_number || '');
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await DataStore.updateSettings({
        gateway_provider: provider,
        api_key: apiKey.trim(),
        sender_number: senderNumber.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleTestGateway = async () => {
    if (!testPhone) {
      alert('Masukkan nomor WhatsApp tujuan uji coba.');
      return;
    }
    setTestSending(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone,
          message: 'Halo! Ini adalah pesan uji coba dari sistem Gmap Prospek CRM.',
          provider,
          apiKey,
          senderNumber,
        }),
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Berhasil dikirim' : data.error),
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Gagal menghubungi endpoint gateway.',
      });
    } finally {
      setTestSending(false);
    }
  };

  if (profile && profile.role !== 'admin' && profile.role !== 'superadmin') {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Akses Dibatasi</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Halaman Pengaturan Gateway & Database hanya dapat diakses oleh Administrator Working Remotely Indonesia.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-emerald-600" />
          Pengaturan WhatsApp Gateway & Database
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Konfigurasi penyedia layanan WhatsApp API Gateway, proteksi akses, dan status koneksi database Supabase.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: WhatsApp Gateway Settings */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Konfigurasi WhatsApp Gateway</h2>
              </div>
              {saveSuccess && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan!
                </span>
              )}
            </div>

            {/* Provider selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Penyedia Layanan Gateway (Provider)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'xsender', name: 'xSender API' },
                  { id: 'fonnte', name: 'Fonnte' },
                  { id: 'waha', name: 'WAHA (Self-host)' },
                  { id: 'other', name: 'Kustom / Lainnya' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProvider(item.id as any)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      provider === item.id
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                API Token / Secret Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Masukkan API Key dari dashboard provider Anda"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Kunci ini digunakan backend server untuk autentikasi pengiriman pesan otomatis.
              </p>
            </div>

            {/* Sender Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Nomor WhatsApp Pengirim (Sender Number)
              </label>
              <input
                type="text"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="Cth: 6281234567890"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Format nomor internasional diawali kode negara (62).
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/10 cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Konfigurasi
              </button>
            </div>
          </form>

          {/* Test WhatsApp Gateway Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              Uji Coba Kirim Pesan (Live Test)
            </h3>
            <p className="text-xs text-slate-500">
              Kirim pesan uji coba ke nomor Anda sendiri untuk memastikan koneksi gateway berjalan lancar.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="Nomor WA Tujuan (cth: 08123456789)"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={handleTestGateway}
                disabled={testSending}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {testSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-emerald-600" />}
                Kirim Pesan Uji
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : null}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Keamanan Akses PIN Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Keamanan Akses PIN Workspace</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{pinEnabled ? 'Proteksi Aktif' : 'Nonaktif'}</span>
                <button
                  type="button"
                  onClick={() => handleTogglePin(!pinEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    pinEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                  title="Toggle Proteksi PIN"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      pinEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Kunci layar workspace Anda saat dibuka pertama kali agar data prospek dan pengaturan aman ketika diakses di browser atau di-install di HP.
            </p>

            {pinEnabled && (
              <form onSubmit={handleUpdatePin} className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">PIN Aktif Saat Ini:</span>
                  <span className="font-mono text-emerald-700 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    {currentPin}
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={10}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Masukkan PIN baru (cth: 654321)"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/10 cursor-pointer shrink-0"
                  >
                    Simpan PIN
                  </button>
                </div>

                {pinSuccess && (
                  <p className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PIN berhasil diperbarui!
                  </p>
                )}
              </form>
            )}

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Kunci layar workspace sekarang?')) {
                    lockWorkspace();
                  }
                }}
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-600" /> Kunci Layar Sekarang
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Database Status & SQL Script */}
        <div className="space-y-6">
          {/* Supabase Status Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Status Database Supabase</h3>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Mode Penyimpanan:</span>
                {isSupabaseConfigured ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Cloud PostgreSQL
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Browser Local Storage
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {isSupabaseConfigured
                  ? 'Aplikasi terhubung langsung ke database Supabase Anda. Semua data tersinkronisasi secara realtime dan aman.'
                  : 'Variabel lingkungan Supabase belum diisi di .env.local. Aplikasi saat ini menggunakan penyimpanan lokal browser (mode demo).'}
              </p>
            </div>

            {/* SQL Script Button */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-700 mb-2">Skrip SQL Tabel Supabase:</p>
              <button
                type="button"
                onClick={handleCopySql}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedSql ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copiedSql ? 'Skrip SQL Tersalin!' : 'Salin Skrip SQL Supabase'}
              </button>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Jalankan skrip ini di menu <strong>SQL Editor</strong> dashboard Supabase Anda.
              </p>
            </div>
          </div>

          {/* Quick Guide to Vercel Deploy */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Siap Deploy ke Vercel
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tinggal hubungkan repositori ini ke Vercel dan tambahkan variabel environment berikut:
            </p>
            <ul className="text-[11px] font-mono text-emerald-800 space-y-1 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              <li>SUPABASE_SERVICE_ROLE_KEY</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
