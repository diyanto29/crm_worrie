'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { 
  ArrowLeft, 
  Download, 
  Search, 
  Filter, 
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
  Send
} from 'lucide-react';
import { DataStore } from '@/lib/dataStore';
import { Campaign, Lead, LeadStatus, MessageTemplate } from '@/types/database';
import { calculateProspectScore, getProspectScoreBadge } from '@/lib/score';
import BroadcastModal from '@/components/BroadcastModal';

function CampaignDetailContent() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [websiteFilter, setWebsiteFilter] = useState<'all' | 'noweb' | 'hasweb'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score_desc' | 'rating_desc' | 'reviews_desc' | 'name_asc'>('score_desc');

  // WhatsApp quick send and broadcast modal state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [camp, allLeads, tmpls] = await Promise.all([
          DataStore.getCampaignById(campaignId),
          DataStore.getLeads(campaignId),
          DataStore.getTemplates(),
        ]);
        setCampaign(camp);
        setLeads(allLeads);
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

  // Status badge style helper for light theme
  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'Closing':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
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

  // Filtered & Sorted Leads
  const filteredLeads = useMemo(() => {
    const list = leads.filter((lead) => {
      // Search text filter
      const matchesSearch =
        lead.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.address && lead.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.phone && lead.phone.includes(searchQuery));

      // Website filter
      const matchesWeb =
        websiteFilter === 'all'
          ? true
          : websiteFilter === 'noweb'
          ? !lead.has_website
          : lead.has_website;

      // Status filter
      const matchesStatus = statusFilter === 'all' ? true : lead.status === statusFilter;

      return matchesSearch && matchesWeb && matchesStatus;
    });

    // Sort by selected criteria (default: Highest prospect percentage)
    return list.sort((a, b) => {
      const scoreA = typeof a.prospect_score === 'number' ? a.prospect_score : calculateProspectScore(a);
      const scoreB = typeof b.prospect_score === 'number' ? b.prospect_score : calculateProspectScore(b);

      if (sortBy === 'score_desc') {
        return scoreB - scoreA;
      }
      if (sortBy === 'rating_desc') {
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      }
      if (sortBy === 'reviews_desc') {
        return (Number(b.reviews_count) || 0) - (Number(a.reviews_count) || 0);
      }
      if (sortBy === 'name_asc') {
        return a.business_name.localeCompare(b.business_name);
      }
      return 0;
    });
  }, [leads, searchQuery, websiteFilter, statusFilter, sortBy]);

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    if (filteredLeads.length === 0) {
      alert('Tidak ada data prospek untuk di-export.');
      return;
    }

    const exportRows = filteredLeads.map((l, index) => {
      const score = typeof l.prospect_score === 'number' ? l.prospect_score : calculateProspectScore(l);
      return {
        No: index + 1,
        'Skor Prospek (%)': `${score}%`,
        'Nama Bisnis': l.business_name,
        'Nomor WhatsApp': l.phone || '-',
        'Punya Website': l.has_website ? 'Ada' : 'Tidak Ada',
        'URL Website': l.website_url || '-',
        Alamat: l.address || '-',
        Rating: l.rating || 0,
        'Jumlah Ulasan': l.reviews_count || 0,
        'Link Google Maps': l.gmaps_url || '-',
        Status: l.status,
        'Nilai Deal (Rp)': l.deal_value || 0,
        Catatan: l.notes || '-',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Prospek Bisnis');

    const fileName = `${campaign?.name || 'prospek_gmaps'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Update lead status directly from table
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    await DataStore.updateLead(leadId, { status: newStatus });
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
  };

  // Delete lead
  const handleDeleteLead = async (leadId: string) => {
    if (confirm('Hapus prospek ini?')) {
      await DataStore.deleteLead(leadId);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
    }
  };

  // Generate personalized WhatsApp message
  const getPreparedMessage = (lead: Lead) => {
    const tmpl = templates.find((t) => t.id === selectedTemplateId) || templates[0];
    if (!tmpl) {
      return `Halo kak ${lead.business_name}, salam kenal dari tim digital agency.`;
    }
    return tmpl.body
      .replace(/{business_name}/g, lead.business_name)
      .replace(/{rating}/g, String(lead.rating || ''))
      .replace(/{reviews_count}/g, String(lead.reviews_count || ''))
      .replace(/{address}/g, lead.address || '');
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
        <Link href="/projects" className="text-emerald-700 hover:underline text-sm inline-block font-semibold">
          &larr; Kembali ke Daftar Kampanye
        </Link>
      </div>
    );
  }

  const noWebCount = leads.filter((l) => !l.has_website).length;
  const hotLeadsCount = leads.filter((l) => {
    const s = typeof l.prospect_score === 'number' ? l.prospect_score : calculateProspectScore(l);
    return s >= 80;
  }).length;
  const avgScore = leads.length > 0 
    ? Math.round(leads.reduce((acc, curr) => acc + (typeof curr.prospect_score === 'number' ? curr.prospect_score : calculateProspectScore(curr)), 0) / leads.length) 
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            title="Kembali ke Daftar Kampanye"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Hasil Scraping Google Maps</span>
              <span className="text-slate-300">&bull;</span>
              <span className="text-xs text-emerald-700 font-mono font-semibold">{campaign.location}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
              {campaign.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setIsBroadcastOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Broadcast WhatsApp
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export ke Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
          <p className="text-[11px] uppercase font-semibold text-slate-500">Total Prospek</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{leads.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
          <p className="text-[11px] uppercase font-semibold text-emerald-700 flex items-center justify-center gap-1">
            <Flame className="w-3.5 h-3.5 text-emerald-600" />
            Hot Prospek (≥80%)
          </p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{hotLeadsCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
          <p className="text-[11px] uppercase font-semibold text-amber-700">Tanpa Website</p>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{noWebCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
          <p className="text-[11px] uppercase font-semibold text-blue-700">Rata-rata Skor %</p>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">
            {avgScore}%
          </p>
        </div>
      </div>

      {/* Filter, Sort and Template Selector Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama bisnis, alamat, atau nomor WhatsApp..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Quick Template Picker for WhatsApp Link */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 shrink-0 font-medium">Template WA:</span>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-emerald-500 max-w-xs truncate cursor-pointer"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Website, Status, and Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Website segment */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setWebsiteFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                websiteFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({leads.length})
            </button>
            <button
              onClick={() => setWebsiteFilter('noweb')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                websiteFilter === 'noweb'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 hover:text-amber-800'
              }`}
            >
              Tanpa Website ({noWebCount})
            </button>
            <button
              onClick={() => setWebsiteFilter('hasweb')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                websiteFilter === 'hasweb'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 hover:text-blue-800'
              }`}
            >
              Ada Website ({leads.length - noWebCount})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sorting Dropdown (Prioritizes Highest % Prospect) */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-semibold flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600" />
                Urutkan:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
              >
                <option value="score_desc">🔥 Skor Prospek Tertinggi (%)</option>
                <option value="rating_desc">⭐ Rating Google Maps Tertinggi</option>
                <option value="reviews_desc">💬 Ulasan Terbanyak</option>
                <option value="name_asc">🔤 Nama Bisnis (A-Z)</option>
              </select>
            </div>

            {/* Status selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="Belum dihubungi">Belum dihubungi</option>
                <option value="Dihubungi">Dihubungi</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Closing">Closing</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Nama Bisnis & Alamat</th>
                <th className="py-3 px-4 font-semibold">Skor Prospek (%)</th>
                <th className="py-3 px-4 font-semibold">WhatsApp Terverifikasi</th>
                <th className="py-3 px-4 font-semibold">Ketersediaan Web</th>
                <th className="py-3 px-4 font-semibold">Status CRM</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada prospek yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const cleanPhone = lead.phone?.replace(/[^0-9]/g, '') || '';
                  const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                  const messageText = getPreparedMessage(lead);
                  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(messageText)}`;
                  
                  const score = typeof lead.prospect_score === 'number' ? lead.prospect_score : calculateProspectScore(lead);
                  const scoreMeta = getProspectScoreBadge(score);

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Business & Address */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <Link
                          href={`/crm/${lead.id}`}
                          className="font-bold text-slate-900 hover:text-emerald-700 text-sm block transition-colors"
                        >
                          {lead.business_name}
                        </Link>
                        <p className="text-slate-500 text-[11px] truncate mt-0.5">{lead.address || '-'}</p>
                        {lead.gmaps_url && (
                          <a
                            href={lead.gmaps_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 mt-1 font-medium"
                          >
                            Buka di Google Maps <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>

                      {/* Prospect Potential Score % */}
                      <td className="py-3.5 px-4 min-w-[130px]">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-extrabold text-sm text-slate-900 font-mono">
                              {score}%
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scoreMeta.badgeClass}`}>
                              {scoreMeta.tag}
                            </span>
                          </div>
                          {/* Visual Progress Bar */}
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${scoreMeta.barColor}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Phone & Rating */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {lead.phone ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-semibold">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              {lead.phone}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Tanpa Nomor</span>
                          )}
                          <div className="flex items-center gap-1 font-semibold text-amber-600 text-[11px]">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{lead.rating || 'N/A'}</span>
                            <span className="text-slate-400 font-normal">({lead.reviews_count || 0})</span>
                          </div>
                        </div>
                      </td>

                      {/* Website */}
                      <td className="py-3.5 px-4">
                        {lead.has_website ? (
                          <a
                            href={lead.website_url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                          >
                            <Globe className="w-3 h-3" />
                            Ada Website
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Tanpa Website
                          </span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border focus:outline-none cursor-pointer bg-white ${getStatusBadge(
                            lead.status
                          )}`}
                        >
                          <option value="Belum dihubungi">Belum dihubungi</option>
                          <option value="Dihubungi">Dihubungi</option>
                          <option value="Follow Up">Follow Up</option>
                          <option value="Closing">Closing</option>
                          <option value="Ditolak">Ditolak</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {lead.phone ? (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-xs cursor-pointer text-xs"
                              title="Kirim Pesan WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Hubungi WA
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Tanpa WA</span>
                          )}

                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Prospek"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Broadcast Modal */}
      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        leads={leads}
        templates={templates}
        onLeadsUpdated={async () => {
          const updated = await DataStore.getLeads(campaignId);
          setLeads(updated);
        }}
      />
    </div>
  );
}

export default function CampaignDetailPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500 text-sm">Memuat kampanye...</div>}>
      <CampaignDetailContent />
    </Suspense>
  );
}
