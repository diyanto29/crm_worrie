'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, 
  MessageSquare, 
  Globe, 
  Search, 
  Phone, 
  Plus, 
  ChevronRight,
  MapPin,
  Star,
  Flame,
  ArrowRight,
  Send
} from 'lucide-react';
import { DataStore } from '@/lib/dataStore';
import { Lead, LeadStatus, MessageTemplate } from '@/types/database';
import { calculateProspectScore, getProspectScoreBadge } from '@/lib/score';
import BroadcastModal from '@/components/BroadcastModal';

const COLUMNS: { 
  status: LeadStatus; 
  label: string; 
  headerColor: string; 
  dotColor: string; 
  badgeColor: string;
}[] = [
  { 
    status: 'Belum dihubungi', 
    label: 'Belum Dihubungi', 
    headerColor: 'text-slate-800', 
    dotColor: 'bg-slate-400',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  { 
    status: 'Dihubungi', 
    label: 'Dihubungi', 
    headerColor: 'text-blue-800', 
    dotColor: 'bg-blue-500',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  { 
    status: 'Follow Up', 
    label: 'Follow Up', 
    headerColor: 'text-purple-800', 
    dotColor: 'bg-purple-500',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  { 
    status: 'Closing', 
    label: 'Closing Deal', 
    headerColor: 'text-emerald-800', 
    dotColor: 'bg-emerald-500',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  { 
    status: 'Ditolak', 
    label: 'Ditolak', 
    headerColor: 'text-rose-800', 
    dotColor: 'bg-rose-500',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
  },
];

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [websiteFilter, setWebsiteFilter] = useState<'all' | 'noweb' | 'hasweb'>('all');
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [allLeads, allTemplates] = await Promise.all([
          DataStore.getLeads(),
          DataStore.getTemplates(),
        ]);
        setLeads(allLeads);
        setTemplates(allTemplates);
      } catch (err) {
        console.error('Failed to load CRM leads', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    await DataStore.updateLead(leadId, { status: newStatus });
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchSearch =
        lead.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.address && lead.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.phone && lead.phone.includes(searchQuery));

      const matchWeb =
        websiteFilter === 'all'
          ? true
          : websiteFilter === 'noweb'
          ? !lead.has_website
          : lead.has_website;

      return matchSearch && matchWeb;
    });
  }, [leads, searchQuery, websiteFilter]);

  const formatIDR = (val: number) => {
    return `Rp ${Number(val || 0).toLocaleString('id-ID')}`;
  };

  const getWaMessage = (lead: Lead) => {
    const defaultTemplate = templates[0];
    if (!defaultTemplate) {
      return `Halo kak di ${lead.business_name}, salam kenal dari tim Web Agency!`;
    }
    return defaultTemplate.body
      .replace(/{business_name}/g, lead.business_name)
      .replace(/{rating}/g, String(lead.rating || ''))
      .replace(/{reviews_count}/g, String(lead.reviews_count || ''))
      .replace(/{address}/g, lead.address || '');
  };

  const noWebCount = leads.filter((l) => !l.has_website).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-600" />
            Pipeline CRM Prospek
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola tahapan prospek dari penawaran perdana, follow-up, hingga closing (otomatis diurutkan dari skor prospek tertinggi).
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setIsBroadcastOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/10 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            Broadcast WhatsApp
          </button>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm border border-slate-200 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Cari Prospek Baru
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari prospek bisnis di pipeline..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs shrink-0 flex-wrap">
          <button
            onClick={() => setWebsiteFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              websiteFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({leads.length})
          </button>
          <button
            onClick={() => setWebsiteFilter('noweb')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              websiteFilter === 'noweb'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-700 hover:text-amber-800'
            }`}
          >
            Tanpa Web ({noWebCount})
          </button>
          <button
            onClick={() => setWebsiteFilter('hasweb')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              websiteFilter === 'hasweb' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-700 hover:text-blue-800'
            }`}
          >
            Ada Web ({leads.length - noWebCount})
          </button>
        </div>
      </div>

      {/* Kanban Pipeline Columns (Flex container with fixed-width spacious columns) */}
      <div className="flex items-start gap-4 overflow-x-auto pb-6 scrollbar-thin">
        {COLUMNS.map((col) => {
          // Sort leads in each column by highest prospect percentage first!
          const colLeads = filteredLeads
            .filter((l) => l.status === col.status)
            .sort((a, b) => {
              const scoreA = typeof a.prospect_score === 'number' ? a.prospect_score : calculateProspectScore(a);
              const scoreB = typeof b.prospect_score === 'number' ? b.prospect_score : calculateProspectScore(b);
              return scoreB - scoreA;
            });
          const colValue = colLeads.reduce((acc, curr) => acc + (Number(curr.deal_value) || 0), 0);

          return (
            <div
              key={col.status}
              className="w-[320px] min-w-[320px] max-w-[320px] shrink-0 flex flex-col rounded-2xl bg-slate-100/70 border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Column Header */}
              <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <span className={`font-bold text-xs ${col.headerColor}`}>{col.label}</span>
                </div>
                <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${col.badgeColor}`}>
                  {colLeads.length}
                </span>
              </div>

              {/* Deal value total for this column if > 0 */}
              {colValue > 0 && (
                <div className="px-4 py-1.5 bg-emerald-50 border-b border-emerald-100 text-[11px] font-semibold text-emerald-800 flex items-center justify-between">
                  <span>Nilai Transaksi:</span>
                  <span className="font-mono font-bold">{formatIDR(colValue)}</span>
                </div>
              )}

              {/* Cards List */}
              <div className="p-3 flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[420px]">
                {colLeads.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-slate-200 rounded-xl bg-white/40">
                    <Users className="w-6 h-6 text-slate-300 mb-1" />
                    <span className="text-xs font-medium text-slate-400">Belum ada prospek</span>
                  </div>
                ) : (
                  colLeads.map((lead) => {
                    const cleanPhone = lead.phone?.replace(/[^0-9]/g, '') || '';
                    const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(getWaMessage(lead))}`;
                    const score = typeof lead.prospect_score === 'number' ? lead.prospect_score : calculateProspectScore(lead);
                    const scoreMeta = getProspectScoreBadge(score);

                    return (
                      <div
                        key={lead.id}
                        className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all shadow-xs space-y-2.5 group"
                      >
                        {/* Title and Prospect Score Badge */}
                        <div>
                          <div className="flex items-start justify-between gap-1.5 mb-1">
                            <Link
                              href={`/crm/${lead.id}`}
                              className="font-bold text-slate-900 hover:text-emerald-600 text-xs sm:text-sm transition-colors line-clamp-1 flex-1 leading-snug"
                              title={lead.business_name}
                            >
                              {lead.business_name}
                            </Link>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 font-mono ${scoreMeta.badgeClass}`}>
                              <Flame className="w-2.5 h-2.5 text-emerald-600" />
                              {score}%
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {lead.address || '-'}
                          </p>
                        </div>

                        {/* Meta: Rating and Web Status */}
                        <div className="flex items-center justify-between text-[11px] pt-0.5">
                          {lead.has_website ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              <Globe className="w-2.5 h-2.5" /> Ada Web
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Tanpa Web
                            </span>
                          )}

                          {lead.rating && (
                            <span className="text-amber-600 font-semibold text-[11px] flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              {lead.rating} <span className="text-slate-400 font-normal">({lead.reviews_count || 0})</span>
                            </span>
                          )}
                        </div>

                        {/* Deal Value if assigned */}
                        {Number(lead.deal_value) > 0 && (
                          <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                            Deal: {formatIDR(Number(lead.deal_value))}
                          </div>
                        )}

                        {/* Quick Actions & Move status */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                          {lead.phone ? (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                              title="Kirim WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                              WA
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">Tanpa WA</span>
                          )}

                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            className="flex-1 text-[10px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer max-w-[170px]"
                          >
                            <option value="Belum dihubungi">Belum dihubungi</option>
                            <option value="Dihubungi">Dihubungi</option>
                            <option value="Follow Up">Follow Up</option>
                            <option value="Closing">Closing</option>
                            <option value="Ditolak">Ditolak</option>
                          </select>

                          <Link
                            href={`/crm/${lead.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
                            title="Detail Prospek"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* WhatsApp Broadcast Modal */}
      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        leads={leads}
        templates={templates}
        onLeadsUpdated={async () => {
          const updated = await DataStore.getLeads();
          setLeads(updated);
        }}
      />
    </div>
  );
}
