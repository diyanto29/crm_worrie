'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { 
  ArrowLeft, 
  Download, 
  Search, 
  Globe, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ExternalLink, 
  Trash2,
  CheckCircle2,
  Star,
  Users,
  Check,
  Flame,
  ArrowUpDown,
  Sparkles,
  Send,
  Layers,
  ArrowRight,
  UserCheck,
  XCircle,
  Clock,
  Filter,
  Briefcase
} from 'lucide-react';
import { DataStore } from '@/lib/dataStore';
import { 
  Campaign, 
  Lead, 
  CampaignProspect, 
  LeadStatus, 
  CurationStatus, 
  MessageTemplate 
} from '@/types/database';
import { calculateProspectScore, getProspectScoreBadge } from '@/lib/score';
import BroadcastModal from '@/components/BroadcastModal';
import { useAuth } from '@/lib/authContext';

function CampaignDetailContent() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const { profile } = useAuth();
  const actorName = profile?.full_name || 'Tim Marketing';

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [prospects, setProspects] = useState<CampaignProspect[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'drafts' (Scraped Drafts to Screen) vs 'pipeline' (Active CRM Deals)
  const [activeTab, setActiveTab] = useState<'drafts' | 'pipeline'>('drafts');

  // Filters & Sorting for Drafts
  const [draftSearch, setDraftSearch] = useState('');
  const [curationFilter, setCurationFilter] = useState<'all' | CurationStatus>('all');
  const [selectedProspectIds, setSelectedProspectIds] = useState<string[]>([]);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [batchConverting, setBatchConverting] = useState(false);

  // Filters & Sorting for Leads
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');

  // Broadcast modal state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [camp, campProspects, campLeads, tmpls] = await Promise.all([
          DataStore.getCampaignById(campaignId),
          DataStore.getCampaignProspects(campaignId),
          DataStore.getLeads(campaignId),
          DataStore.getTemplates(),
        ]);
        setCampaign(camp);
        setProspects(campProspects);
        setLeads(campLeads);
        setTemplates(tmpls);
        if (tmpls.length > 0) {
          setSelectedTemplateId(tmpls[0].id);
        }
      } catch (err) {
        console.error('Failed to load campaign detail', err);
      } finally {
        setLoading(false);
      }
    }
    if (campaignId) {
      loadData();
    }
  }, [campaignId]);

  // Reload data helper
  const reloadData = async () => {
    const [campProspects, campLeads] = await Promise.all([
      DataStore.getCampaignProspects(campaignId),
      DataStore.getLeads(campaignId),
    ]);
    setProspects(campProspects);
    setLeads(campLeads);
  };

  // Convert Single Prospect to CRM Pipeline
  const handleConvertSingle = async (prospect: CampaignProspect) => {
    if (prospect.curation_status === 'converted') return;
    setConvertingId(prospect.id);
    try {
      const createdLead = await DataStore.convertProspectToPipeline(prospect.id, actorName);
      if (createdLead) {
        await reloadData();
        setSelectedProspectIds((prev) => prev.filter((id) => id !== prospect.id));
      }
    } catch (err) {
      alert('Gagal mengonversi prospek ke pipeline.');
    } finally {
      setConvertingId(null);
    }
  };

  // Batch Convert Selected Prospects
  const handleBatchConvert = async () => {
    if (selectedProspectIds.length === 0) return;
    setBatchConverting(true);
    try {
      await DataStore.batchConvertProspectsToPipeline(selectedProspectIds, actorName);
      await reloadData();
      setSelectedProspectIds([]);
    } catch (err) {
      alert('Gagal mengonversi beberapa prospek.');
    } finally {
      setBatchConverting(false);
    }
  };

  // Disqualify Prospect
  const handleDisqualify = async (prospectId: string) => {
    const reason = prompt('Alasan diskualifikasi prospek ini (opsional):', 'Nomor tidak valid / Tidak relevan');
    if (reason !== null) {
      await DataStore.updateProspectCuration(prospectId, 'disqualified', reason);
      await reloadData();
    }
  };

  // Filtered Draft Prospects
  const filteredDrafts = useMemo(() => {
    return prospects.filter((p) => {
      const matchesSearch =
        p.business_name.toLowerCase().includes(draftSearch.toLowerCase()) ||
        (p.address && p.address.toLowerCase().includes(draftSearch.toLowerCase())) ||
        (p.phone && p.phone.includes(draftSearch));
      const matchesCuration = curationFilter === 'all' ? true : p.curation_status === curationFilter;
      return matchesSearch && matchesCuration;
    });
  }, [prospects, draftSearch, curationFilter]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch =
        l.business_name.toLowerCase().includes(leadSearch.toLowerCase()) ||
        (l.address && l.address.toLowerCase().includes(leadSearch.toLowerCase())) ||
        (l.phone && l.phone.includes(leadSearch));
      const matchesStatus = leadStatusFilter === 'all' ? true : l.status === leadStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, leadSearch, leadStatusFilter]);

  // Select all visible unconverted drafts
  const handleToggleSelectAll = () => {
    const eligible = filteredDrafts.filter((p) => p.curation_status !== 'converted').map((p) => p.id);
    if (selectedProspectIds.length === eligible.length) {
      setSelectedProspectIds([]);
    } else {
      setSelectedProspectIds(eligible);
    }
  };

  // Toggle single selection
  const handleToggleSelect = (id: string) => {
    setSelectedProspectIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    if (activeTab === 'drafts') {
      if (filteredDrafts.length === 0) {
        alert('Tidak ada data draft untuk di-export.');
        return;
      }
      const exportRows = filteredDrafts.map((p, index) => ({
        No: index + 1,
        'Skor Prospek (%)': `${p.prospect_score ?? 0}%`,
        'Status Kurasi': p.curation_status.toUpperCase(),
        'Nama Bisnis': p.business_name,
        'Nomor WhatsApp': p.phone || '-',
        'Punya Website': p.has_website ? 'Ada' : 'Tidak Ada',
        'URL Website': p.website_url || '-',
        Alamat: p.address || '-',
        Rating: p.rating || 0,
        'Jumlah Ulasan': p.reviews_count || 0,
        'Link Google Maps': p.gmaps_url || '-',
        'Alasan Diskualifikasi': p.disqualified_reason || '-',
      }));
      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Draft Prospek');
      XLSX.writeFile(wb, `${campaign?.name || 'campaign'}_drafts_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else {
      if (filteredLeads.length === 0) {
        alert('Tidak ada data pipeline untuk di-export.');
        return;
      }
      const exportRows = filteredLeads.map((l, index) => ({
        No: index + 1,
        'Nama Bisnis': l.business_name,
        'Nomor WhatsApp': l.phone || '-',
        Status: l.status,
        'Nilai Deal (Rp)': l.deal_value || 0,
        Alamat: l.address || '-',
        Catatan: l.notes || '-',
      }));
      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Pipeline CRM');
      XLSX.writeFile(wb, `${campaign?.name || 'campaign'}_pipeline_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }
  };

  const getCurationBadge = (status: CurationStatus) => {
    switch (status) {
      case 'converted':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'reviewed':
        return 'bg-blue-50 text-[#004a87] border-blue-200';
      case 'disqualified':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const getLeadStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'Closing':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Quotation':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Follow Up':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Dihubungi':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Ditolak':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        Memuat data kampanye & prospek...
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-slate-500">Kampanye tidak ditemukan atau telah dihapus.</p>
        <Link href="/projects" className="text-[#004a87] hover:underline text-sm inline-block font-semibold">
          &larr; Kembali ke Daftar Kampanye
        </Link>
      </div>
    );
  }

  const draftUnconvertedCount = prospects.filter((p) => p.curation_status !== 'converted').length;
  const draftConvertedCount = prospects.filter((p) => p.curation_status === 'converted').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            title="Kembali ke Daftar Kampanye"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Kampanye Pencarian</span>
              <span className="text-slate-300">&bull;</span>
              <span className="text-xs text-[#004a87] font-semibold">{campaign.location}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
              {campaign.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Hasil Scrape</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {prospects.length}
          </p>
          <span className="text-[11px] text-slate-400">Prospek dari Google Maps</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>Menunggu Skrining</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-900 mt-2 font-mono">
            {draftUnconvertedCount}
          </p>
          <span className="text-[11px] text-amber-700">Perlu dipilah marketer</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
            <span>Dikonversi ke Leads</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-900 mt-2 font-mono">
            {draftConvertedCount}
          </p>
          <span className="text-[11px] text-emerald-700">Masuk ke database leads</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[#004a87] text-xs font-semibold">
            <span>Pipeline Deal Aktif</span>
            <Briefcase className="w-4 h-4 text-[#004a87]" />
          </div>
          <p className="text-2xl font-extrabold text-[#004a87] mt-2 font-mono">
            {leads.length}
          </p>
          <span className="text-[11px] text-slate-400">Deal CRM tahap lanjutan</span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('drafts')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'drafts'
              ? 'border-[#004a87] text-[#004a87]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Draft Skrining Prospek</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            activeTab === 'drafts' ? 'bg-blue-100 text-[#004a87]' : 'bg-slate-100 text-slate-600'
          }`}>
            {prospects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'pipeline'
              ? 'border-[#004a87] text-[#004a87]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Pipeline Deal Aktif CRM</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            activeTab === 'pipeline' ? 'bg-blue-100 text-[#004a87]' : 'bg-slate-100 text-slate-600'
          }`}>
            {leads.length}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: DRAFT PROSPECTS SCREENING VIEW                     */}
      {/* ========================================================= */}
      {activeTab === 'drafts' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto flex-1">
              <div className="relative w-full max-w-sm">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari draft prospek, alamat, telepon..."
                  value={draftSearch}
                  onChange={(e) => setDraftSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#004a87] focus:ring-1 focus:ring-[#004a87] bg-slate-50/50"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                {(['all', 'draft', 'reviewed', 'disqualified', 'converted'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setCurationFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      curationFilter === st
                        ? 'bg-[#004a87] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'Semua' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Action Bar */}
            {selectedProspectIds.length > 0 && (
              <div className="flex items-center gap-3 w-full md:w-auto justify-end bg-blue-50/80 px-4 py-2 rounded-xl border border-blue-200">
                <span className="text-xs font-bold text-[#004a87]">
                  {selectedProspectIds.length} dipilih
                </span>
                <button
                  onClick={handleBatchConvert}
                  disabled={batchConverting}
                  className="px-4 py-1.5 rounded-lg bg-[#004a87] hover:bg-[#003866] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  {batchConverting ? 'Mengonversi ke Leads...' : 'Convert to Leads'}
                </button>
              </div>
            )}
          </div>

          {/* Draft Prospects Table */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            {filteredDrafts.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Layers className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-700">Tidak ada draft prospek yang cocok</p>
                <p className="text-xs text-slate-400 mt-1">Coba sesuaikan filter status atau kata kunci pencarian.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedProspectIds.length > 0 &&
                            selectedProspectIds.length ===
                              filteredDrafts.filter((p) => p.curation_status !== 'converted').length
                          }
                          onChange={handleToggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-[#004a87] focus:ring-[#004a87] cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4 font-semibold">Institusi / Bisnis</th>
                      <th className="py-3 px-4 font-semibold">WhatsApp & Kontak</th>
                      <th className="py-3 px-4 font-semibold">Website & G-Maps</th>
                      <th className="py-3 px-4 font-semibold text-center">Skor</th>
                      <th className="py-3 px-4 font-semibold text-center">Status Kurasi</th>
                      <th className="py-3 px-4 font-semibold text-right">Aksi Skrining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDrafts.map((prospect) => {
                      const isConverted = prospect.curation_status === 'converted';
                      const isSelected = selectedProspectIds.includes(prospect.id);
                      const isConverting = convertingId === prospect.id;

                      return (
                        <tr
                          key={prospect.id}
                          className={`table-row-standard hover:bg-blue-50/50 hover:translate-x-1 transition-all duration-150 group ${
                            isSelected ? 'bg-blue-50/70' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isConverted}
                              onChange={() => handleToggleSelect(prospect.id)}
                              className="w-4 h-4 rounded border-slate-300 text-[#004a87] focus:ring-[#004a87] cursor-pointer disabled:opacity-30"
                            />
                          </td>

                          {/* Business Info */}
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900 group-hover:text-[#004a87] transition-colors text-sm">
                                {prospect.business_name}
                              </p>
                              <p className="text-slate-500 flex items-center gap-1 text-[11px]">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate max-w-xs">{prospect.address || 'Alamat tidak terdeteksi'}</span>
                              </p>
                              {prospect.category && (
                                <span className="inline-block text-[10px] text-slate-400">
                                  {prospect.category}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* WhatsApp & Rating */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              {prospect.phone ? (
                                <a
                                  href={`https://wa.me/${prospect.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 text-xs"
                                  title="Chat WhatsApp"
                                >
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  {prospect.phone}
                                </a>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">Tidak ada telepon</span>
                              )}
                              {prospect.rating && (
                                <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  <span>{prospect.rating}</span>
                                  <span className="text-slate-400 font-normal">({prospect.reviews_count || 0})</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Website & Maps */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              {prospect.has_website ? (
                                <a
                                  href={prospect.website_url || '#'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:underline"
                                >
                                  <Globe className="w-3 h-3" />
                                  <span>Ada Website</span>
                                </a>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  Tanpa Web
                                </span>
                              )}
                              {prospect.gmaps_url && (
                                <div>
                                  <a
                                    href={prospect.gmaps_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Google Maps</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Score */}
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-amber-50 text-amber-900 border border-amber-200">
                              <Flame className="w-3 h-3 text-amber-600" />
                              {prospect.prospect_score ?? 85}%
                            </span>
                          </td>

                          {/* Curation Status */}
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${getCurationBadge(prospect.curation_status)}`}>
                              {prospect.curation_status}
                            </span>
                          </td>

                          {/* Action Column */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isConverted ? (
                                <Link
                                  href={`/crm/${prospect.converted_lead_id || ''}`}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Buka di CRM
                                </Link>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleConvertSingle(prospect)}
                                    disabled={isConverting}
                                    className="px-3 py-1.5 rounded-lg bg-[#004a87] hover:bg-[#003866] text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                                    title="Konversi prospek ini menjadi data Lead resmi"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    {isConverting ? 'Mengonversi...' : 'Convert to Leads'}
                                  </button>
                                  {prospect.curation_status !== 'disqualified' && (
                                    <button
                                      onClick={() => handleDisqualify(prospect.id)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Diskualifikasi prospek ini"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ACTIVE PIPELINE LEADS VIEW                         */}
      {/* ========================================================= */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari deal aktif, PIC, alamat..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#004a87] focus:ring-1 focus:ring-[#004a87] bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs flex-wrap">
              {(['all', 'Belum dihubungi', 'Dihubungi', 'Follow Up', 'Quotation', 'Closing', 'Ditolak'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setLeadStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    leadStatusFilter === st
                      ? 'bg-[#004a87] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' ? 'Semua Tahap' : st}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            {filteredLeads.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-700">Belum ada deal aktif di pipeline kampanye ini</p>
                <p className="text-xs text-slate-400 mt-1">
                  Pindah ke tab <strong>Draft Skrining Prospek</strong> lalu pilih dan konversi prospek yang potensial.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Institusi / Klien</th>
                      <th className="py-3 px-4 font-semibold">WhatsApp Utama</th>
                      <th className="py-3 px-4 font-semibold">Tahap Deal Pipeline</th>
                      <th className="py-3 px-4 font-semibold">Potensi Nilai Deal</th>
                      <th className="py-3 px-4 font-semibold">Catatan Kemitraan</th>
                      <th className="py-3 px-4 font-semibold text-right">Aksi 360°</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/crm/${lead.id}`)}
                      >
                        <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                          {lead.business_name}
                          <p className="text-[11px] font-normal text-slate-500 truncate max-w-xs mt-0.5">
                            {lead.address || 'Alamat institusi'}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          {lead.phone ? (
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 hover:bg-emerald-100 text-xs"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              {lead.phone}
                            </a>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getLeadStatusBadge(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono font-semibold text-slate-900">
                          {lead.deal_value ? `Rp ${Number(lead.deal_value).toLocaleString('id-ID')}` : 'Rp 0'}
                        </td>
                        <td className="py-4 px-4 text-slate-500 max-w-xs truncate text-[11px]">
                          {lead.notes || 'Belum ada catatan khusus'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/crm/${lead.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#004a87] hover:bg-blue-100 font-bold text-xs border border-blue-200 inline-flex items-center gap-1"
                          >
                            Detail 360° <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {isBroadcastOpen && (
        <BroadcastModal
          isOpen={isBroadcastOpen}
          leads={leads}
          templates={templates}
          onClose={() => setIsBroadcastOpen(false)}
        />
      )}
    </div>
  );
}

export default function CampaignDetailPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Memuat kampanye...</div>}>
      <CampaignDetailContent />
    </Suspense>
  );
}
