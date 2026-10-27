'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  TrendingUp, 
  Search, 
  Globe, 
  PhoneCall, 
  ArrowRight, 
  PlusCircle, 
  Sparkles,
  DollarSign,
  AlertCircle,
  Flame
} from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import { DataStore } from '@/lib/dataStore';
import { Lead, Campaign, LeadStatus } from '@/types/database';
import { calculateProspectScore, getProspectScoreBadge } from '@/lib/score';

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedLeads, loadedCampaigns] = await Promise.all([
          DataStore.getLeads(),
          DataStore.getCampaigns(),
        ]);
        setLeads(loadedLeads);
        setCampaigns(loadedCampaigns);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute metrics
  const totalLeads = leads.length;
  const noWebsiteLeads = leads.filter(l => !l.has_website).length;
  const uncontactedLeads = leads.filter(l => l.status === 'Belum dihubungi').length;
  const inFollowUp = leads.filter(l => l.status === 'Follow Up' || l.status === 'Dihubungi').length;
  const closedLeads = leads.filter(l => l.status === 'Closing');
  const totalRevenue = closedLeads.reduce((acc, curr) => acc + (Number(curr.deal_value) || 0), 0);

  const formatIDR = (val: number) => {
    return `Rp ${Number(val || 0).toLocaleString('id-ID')}`;
  };

  const statusCounts: Record<LeadStatus, number> = {
    'Belum dihubungi': leads.filter(l => l.status === 'Belum dihubungi').length,
    'Dihubungi': leads.filter(l => l.status === 'Dihubungi').length,
    'Follow Up': leads.filter(l => l.status === 'Follow Up').length,
    'Closing': leads.filter(l => l.status === 'Closing').length,
    'Ditolak': leads.filter(l => l.status === 'Ditolak').length,
  };

  const statusColors: Record<LeadStatus, { bg: string; text: string; border: string; bar: string }> = {
    'Belum dihubungi': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', bar: 'bg-slate-400' },
    'Dihubungi': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', bar: 'bg-blue-500' },
    'Follow Up': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', bar: 'bg-purple-500' },
    'Closing': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500' },
    'Ditolak': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', bar: 'bg-rose-500' },
  };

  const hotLeadsCount = leads.filter(l => {
    const s = typeof l.prospect_score === 'number' ? l.prospect_score : calculateProspectScore(l);
    return s >= 80;
  }).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Workspace Aktif
            </span>
            <span className="text-xs text-slate-500">
              {DataStore.isCloud ? 'Koneksi: Cloud Supabase' : 'Koneksi: Mode Lokal'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Ringkasan Bisnis & Prospek
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor hasil scraping Google Maps, follow-up WhatsApp, dan konversi closing agency Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm shadow-emerald-600/20 hover:scale-[1.01]"
          >
            <PlusCircle className="w-4 h-4" />
            Ekstrak Lead Baru
          </Link>
          <Link
            href="/crm"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-2xs transition-all hover:scale-[1.01]"
          >
            <Users className="w-4 h-4 text-emerald-600" />
            Buka Pipeline
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Prospek"
          value={totalLeads}
          subtext={`${hotLeadsCount} Hot Prospek (${noWebsiteLeads} tanpa web)`}
          icon={Users}
          variant="emerald"
        />
        <MetricCard
          title="Belum Dihubungi"
          value={uncontactedLeads}
          subtext="Siap untuk pesan penawaran perdana"
          icon={AlertCircle}
          variant="blue"
        />
        <MetricCard
          title="Dalam Negosiasi"
          value={inFollowUp}
          subtext="Prospek dihubungi & follow up"
          icon={PhoneCall}
          variant="purple"
        />
        <MetricCard
          title="Total Omset Closing"
          value={formatIDR(totalRevenue)}
          subtext={`${closedLeads.length} klien deal & bayar`}
          icon={DollarSign}
          variant="amber"
        />
      </div>

      {/* Visual Analytics: Pipeline Funnel & Website Opportunity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Funnel */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Pipeline Distribusi Status CRM
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Aliran konversi prospek dari ekstraksi awal hingga closing deal
              </p>
            </div>
            <Link href="/crm" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              Lihat Detail <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {(Object.keys(statusCounts) as LeadStatus[]).map((st) => {
              const count = statusCounts[st];
              const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              const clr = statusColors[st];

              return (
                <div key={st} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${clr.bar}`}></span>
                      {st}
                    </span>
                    <span className="font-mono text-slate-500">
                      <strong className="text-slate-900">{count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${clr.bar} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(pct, count > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Opportunity Card: No-Website Targets */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-200 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Peluang Target Website</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Bisnis tanpa website adalah target paling empuk untuk jasa pembuatan landing page, redesign, dan paket Google Maps SEO.
            </p>

            <div className="mt-6 p-4 rounded-xl bg-white border border-emerald-200/80 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Belum Punya Website:</span>
                <span className="font-bold text-amber-700 text-sm bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{noWebsiteLeads} Bisnis</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Sudah Punya Website:</span>
                <span className="font-bold text-blue-700 text-sm">{totalLeads - noWebsiteLeads} Bisnis</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600">Potensi Pasar:</span>
                <span className="font-bold text-emerald-700">
                  {totalLeads > 0 ? Math.round((noWebsiteLeads / totalLeads) * 100) : 0}% Target Terbuka
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/projects"
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs text-center transition-all block shadow-xs"
          >
            Mulai Kampanye Pencarian Baru &rarr;
          </Link>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Prospek Terbaru
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Daftar kontak bisnis yang baru diekstrak atau diperbarui</p>
          </div>
          <Link
            href="/crm"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Buka Semua di CRM &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Nama Bisnis & Alamat</th>
                <th className="py-3 px-4 font-semibold">Skor Prospek (%)</th>
                <th className="py-3 px-4 font-semibold">Telepon / WA</th>
                <th className="py-3 px-4 font-semibold">Website</th>
                <th className="py-3 px-4 font-semibold">Status CRM</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...leads]
                .sort((a, b) => {
                  const scoreA = typeof a.prospect_score === 'number' ? a.prospect_score : calculateProspectScore(a);
                  const scoreB = typeof b.prospect_score === 'number' ? b.prospect_score : calculateProspectScore(b);
                  return scoreB - scoreA;
                })
                .slice(0, 6)
                .map((lead) => {
                  const clr = statusColors[lead.status] || statusColors['Belum dihubungi'];
                  const cleanPhone = lead.phone?.replace(/[^0-9]/g, '') || '';
                  const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                  const score = typeof lead.prospect_score === 'number' ? lead.prospect_score : calculateProspectScore(lead);
                  const meta = getProspectScoreBadge(score);

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{lead.business_name}</div>
                        <div className="text-slate-500 text-[11px] truncate max-w-xs">{lead.address || '-'}</div>
                      </td>
                      <td className="py-3.5 px-4 min-w-[120px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <span className="font-mono font-bold text-slate-900">{score}%</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${meta.badgeClass}`}>
                              {meta.tag}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${meta.barColor}`} style={{ width: `${score}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {lead.phone ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {lead.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Tidak ada</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {lead.has_website ? (
                          <a
                            href={lead.website_url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-700 hover:underline font-medium"
                          >
                            <Globe className="w-3 h-3" />
                            Ada Web
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Tanpa Web
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${clr.bg} ${clr.text} ${clr.border}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {lead.phone && (
                            <a
                              href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                                `Halo ${lead.business_name}, salam kenal dari tim Web Agency!`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                              title="Buka WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <Link
                            href={`/crm/${lead.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                            title="Detail Prospek"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
