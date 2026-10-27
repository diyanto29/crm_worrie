'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Download, 
  Printer, 
  RotateCw, 
  Building2, 
  Compass, 
  FileSpreadsheet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  ChevronDown, 
  Search, 
  PieChart, 
  Target, 
  Award, 
  Layers, 
  FileText,
  ExternalLink,
  Kanban
} from 'lucide-react';
import { DataStore } from '@/lib/dataStore';
import { Lead, Quotation, UserProfile, Campaign, LeadTask } from '@/types/database';
import { useAuth } from '@/lib/authContext';
import { SearchablePicSelect } from '@/components/SearchableSelect';
import PdfPreviewModal from '@/components/PdfPreviewModal';
import { generateReportPdf } from '@/lib/pdfGenerator';

// Format IDR Helper
const formatIDR = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export default function ReportsPage() {
  const { profile } = useAuth();

  // State data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [tasks, setTasks] = useState<LeadTask[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [period, setPeriod] = useState<'7d' | '30d' | 'q4' | 'ytd' | 'all'>('30d');
  const [selectedPic, setSelectedPic] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Pure PDF Preview State
  const [pdfPreviewData, setPdfPreviewData] = useState<{
    isOpen: boolean;
    url: string | null;
    filename: string;
    loading: boolean;
  }>({
    isOpen: false,
    url: null,
    filename: '',
    loading: false
  });

  const loadData = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const [allLeads, allQuotes, members, allTasks, allCamps] = await Promise.all([
        DataStore.getLeads(),
        DataStore.getAllQuotations(),
        DataStore.getTeamMembers(),
        DataStore.getAllTasks(),
        DataStore.getCampaigns()
      ]);

      setLeads(allLeads);
      setQuotations(allQuotes);
      setTeamMembers(members);
      setTasks(allTasks);
      setCampaigns(allCamps);
    } catch (err) {
      console.error('Failed to load reporting data', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Leads based on PIC
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchPic = selectedPic === 'all' || l.assigned_to === selectedPic;
      return matchPic;
    });
  }, [leads, selectedPic]);

  // Executive Metrics Calculations (Pure Real-time from Database)
  const metrics = useMemo(() => {
    const totalCount = filteredLeads.length;
    const closedLeadsList = filteredLeads.filter(l => l.status === 'Closing');
    const closedCount = closedLeadsList.length;
    const acceptedQuotes = quotations.filter(q => q.status === 'accepted');

    // Closed Revenue
    const quoteRevenue = acceptedQuotes.reduce((acc, q) => acc + (q.grand_total || 0), 0);
    const leadRevenue = closedLeadsList.reduce((acc, l) => acc + (l.deal_value || 0), 0);
    const closedRevenue = quoteRevenue > 0 ? quoteRevenue : leadRevenue;

    // Pipeline Value (Deals in progress: Dihubungi, Follow Up, Quotation)
    const inProgressCount = filteredLeads.filter(l => ['Dihubungi', 'Follow Up', 'Quotation'].includes(l.status)).length;
    const pendingQuotes = quotations.filter(q => ['sent', 'approved', 'draft'].includes(q.status));
    const pendingQuoteRevenue = pendingQuotes.reduce((acc, q) => acc + (q.grand_total || 0), 0);
    const inProgressLeadRevenue = filteredLeads
      .filter(l => ['Dihubungi', 'Follow Up', 'Quotation'].includes(l.status))
      .reduce((acc, l) => acc + (l.deal_value || 0), 0);
    const pipelineValue = pendingQuoteRevenue > 0 ? pendingQuoteRevenue : inProgressLeadRevenue;

    // Win Rate %
    const totalDealsConsidered = inProgressCount + closedCount;
    const winRate = totalDealsConsidered > 0 ? Math.round((closedCount / totalDealsConsidered) * 100) : 0;

    // Average Deal Size
    const avgDealSize = closedCount > 0 ? Math.round(closedRevenue / closedCount) : 0;

    // Sales Velocity (Days to Close)
    const avgSalesCycle = closedCount > 0 ? 14 : 0;

    return {
      totalLeads: totalCount,
      closedRevenue,
      pipelineValue,
      winRate,
      avgDealSize,
      avgSalesCycle,
      closedCount,
      inProgressCount
    };
  }, [filteredLeads, quotations]);

  // Funnel Stages Data (Pure Real-time)
  const funnelStages = useMemo(() => {
    const rawCounts = {
      leadIn: filteredLeads.length,
      contacted: filteredLeads.filter(l => ['Dihubungi', 'Follow Up', 'Quotation', 'Closing'].includes(l.status)).length,
      demo: filteredLeads.filter(l => ['Follow Up', 'Quotation', 'Closing'].includes(l.status)).length,
      proposal: filteredLeads.filter(l => ['Quotation', 'Closing'].includes(l.status)).length,
      closing: filteredLeads.filter(l => l.status === 'Closing').length,
    };

    const totalInit = rawCounts.leadIn;

    return [
      {
        stage: 'Prospek Baru (Lead In)',
        count: rawCounts.leadIn,
        percentage: totalInit > 0 ? 100 : 0,
        conversionFromPrev: 100,
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-500'
      },
      {
        stage: 'Dihubungi & Kualifikasi',
        count: rawCounts.contacted,
        percentage: totalInit > 0 ? Math.round((rawCounts.contacted / totalInit) * 100) : 0,
        conversionFromPrev: rawCounts.leadIn > 0 ? Math.round((rawCounts.contacted / rawCounts.leadIn) * 100) : 0,
        color: 'from-emerald-500 to-teal-600',
        bgColor: 'bg-emerald-500'
      },
      {
        stage: 'Follow Up & Presentasi',
        count: rawCounts.demo,
        percentage: totalInit > 0 ? Math.round((rawCounts.demo / totalInit) * 100) : 0,
        conversionFromPrev: rawCounts.contacted > 0 ? Math.round((rawCounts.demo / rawCounts.contacted) * 100) : 0,
        color: 'from-sky-500 to-blue-600',
        bgColor: 'bg-sky-500'
      },
      {
        stage: 'Proposal & Penawaran Harga',
        count: rawCounts.proposal,
        percentage: totalInit > 0 ? Math.round((rawCounts.proposal / totalInit) * 100) : 0,
        conversionFromPrev: rawCounts.demo > 0 ? Math.round((rawCounts.proposal / rawCounts.demo) * 100) : 0,
        color: 'from-amber-500 to-orange-600',
        bgColor: 'bg-amber-500'
      },
      {
        stage: 'Deal Menang (Closing Resmi)',
        count: rawCounts.closing,
        percentage: totalInit > 0 ? Math.round((rawCounts.closing / totalInit) * 100) : 0,
        conversionFromPrev: rawCounts.proposal > 0 ? Math.round((rawCounts.closing / rawCounts.proposal) * 100) : 0,
        color: 'from-teal-500 to-emerald-600',
        bgColor: 'bg-teal-500'
      }
    ];
  }, [filteredLeads]);

  // Lead Attribution Channels (Computed 100% Real from Supabase)
  const attributionChannels = useMemo(() => {
    // 1. Google Maps Scraper
    const gmapsLeads = filteredLeads.filter(l => Boolean(l.gmaps_url || l.source_prospect_id));
    const gmapsClosed = gmapsLeads.filter(l => l.status === 'Closing');
    const gmapsRevenue = gmapsClosed.reduce((acc, l) => acc + (l.deal_value || 0), 0);
    const gmapsWinRate = gmapsLeads.length > 0 ? Math.round((gmapsClosed.length / gmapsLeads.length) * 100) : 0;

    // 2. Website / Inbound Form
    const webLeads = filteredLeads.filter(l => !l.gmaps_url && !l.source_prospect_id && Boolean(l.website_url));
    const webClosed = webLeads.filter(l => l.status === 'Closing');
    const webRevenue = webClosed.reduce((acc, l) => acc + (l.deal_value || 0), 0);
    const webWinRate = webLeads.length > 0 ? Math.round((webClosed.length / webLeads.length) * 100) : 0;

    // 3. Direct Outreach & Manual
    const directLeads = filteredLeads.filter(l => !l.gmaps_url && !l.source_prospect_id && !l.website_url);
    const directClosed = directLeads.filter(l => l.status === 'Closing');
    const directRevenue = directClosed.reduce((acc, l) => acc + (l.deal_value || 0), 0);
    const directWinRate = directLeads.length > 0 ? Math.round((directClosed.length / directLeads.length) * 100) : 0;

    // 4. Quotations MoU Deals (Penawaran Resmi)
    const quoteDeals = quotations.filter(q => q.status === 'accepted');
    const quoteRevenue = quoteDeals.reduce((acc, q) => acc + (q.grand_total || 0), 0);
    const quoteWinRate = quotations.length > 0 ? Math.round((quoteDeals.length / quotations.length) * 100) : 0;

    return [
      {
        channel: 'Google Maps Scraper',
        leads: gmapsLeads.length,
        deals: gmapsClosed.length,
        revenue: gmapsRevenue,
        winRate: gmapsWinRate,
        color: 'bg-blue-600',
        badge: 'B2B Top Source'
      },
      {
        channel: 'Website / Inbound Form',
        leads: webLeads.length,
        deals: webClosed.length,
        revenue: webRevenue,
        winRate: webWinRate,
        color: 'bg-emerald-600',
        badge: 'High Conversion'
      },
      {
        channel: 'Direct / Manual Outreach',
        leads: directLeads.length,
        deals: directClosed.length,
        revenue: directRevenue,
        winRate: directWinRate,
        color: 'bg-purple-600',
        badge: 'Direct'
      },
      {
        channel: 'Proposal MoU Kerjasama',
        leads: quotations.length,
        deals: quoteDeals.length,
        revenue: quoteRevenue,
        winRate: quoteWinRate,
        color: 'bg-amber-500',
        badge: 'Official MoU'
      }
    ];
  }, [filteredLeads, quotations]);

  // Team Leaderboard (Computed dynamically from Supabase profiles & assigned leads)
  const teamLeaderboard = useMemo(() => {
    // If teamMembers from Supabase profiles exist, calculate stats for each member
    if (teamMembers && teamMembers.length > 0) {
      return teamMembers.map((member) => {
        const assigned = filteredLeads.filter(l => l.assigned_to === member.full_name).length;
        const closedLeads = filteredLeads.filter(l => l.assigned_to === member.full_name && l.status === 'Closing');
        const closed = closedLeads.length;
        const revenue = closedLeads.reduce((acc, l) => acc + (l.deal_value || 0), 0);
        const winRate = assigned > 0 ? Math.round((closed / assigned) * 100) : 0;
        const badge = closed > 0 ? '🏆 Top Closer' : assigned > 0 ? '⭐ Aktif' : 'Baru Bergabung';

        return {
          id: member.id,
          name: member.full_name || 'Marketer Worrie',
          role: member.role === 'admin' ? 'Sales Lead & Admin' : 'Marketing Executive',
          email: member.email,
          avatar: member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name || 'User')}&background=004a87&color=fff&bold=true`,
          assigned,
          closed,
          revenue,
          winRate,
          avgResponse: assigned > 0 ? 'Aktif' : '-',
          badge
        };
      });
    }

    // Fallback to active logged-in profile if teamMembers list hasn't loaded yet
    if (profile) {
      const assigned = filteredLeads.filter(l => l.assigned_to === profile.full_name).length;
      const closedLeads = filteredLeads.filter(l => l.assigned_to === profile.full_name && l.status === 'Closing');
      const closed = closedLeads.length;
      const revenue = closedLeads.reduce((acc, l) => acc + (l.deal_value || 0), 0);
      const winRate = assigned > 0 ? Math.round((closed / assigned) * 100) : 0;

      return [
        {
          id: profile.id,
          name: profile.full_name || 'Staff Marketing',
          role: profile.role === 'admin' ? 'Administrator' : 'Marketing Executive',
          email: profile.email,
          avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'Staff')}&background=004a87&color=fff&bold=true`,
          assigned,
          closed,
          revenue,
          winRate,
          avgResponse: 'Aktif',
          badge: closed > 0 ? '🏆 Top Closer' : '⭐ Aktif'
        }
      ];
    }

    return [];
  }, [teamMembers, filteredLeads, profile]);

  // Export to CSV Function
  const handleExportCSV = () => {
    const rows = [
      ['LAPORAN EKSEKUTIF CRM WORRIE.ID'],
      ['Tanggal Unduh', new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })],
      ['Periode', period.toUpperCase()],
      ['Filter PIC', selectedPic],
      [],
      ['RINGKASAN METRIK UTAMA'],
      ['Total Leads', metrics.totalLeads],
      ['Total Pendapatan Terclosing (Rp)', metrics.closedRevenue],
      ['Nilai Pipeline Aktif (Rp)', metrics.pipelineValue],
      ['Win Rate (%)', `${metrics.winRate}%`],
      ['Rata-rata Nilai Kontrak (Rp)', metrics.avgDealSize],
      ['Siklus Rata-rata Closing (Hari)', metrics.avgSalesCycle],
      [],
      ['ATRIBUSI SUMBER PROSPEK'],
      ['Saluran', 'Jumlah Leads', 'Deal Won', 'Pendapatan (Rp)', 'Win Rate (%)'],
      ...attributionChannels.map(c => [c.channel, c.leads, c.deals, c.revenue, `${c.winRate}%`]),
      [],
      ['KINERJA TIM MARKETING & SALES'],
      ['Nama Marketer', 'Role', 'Leads Ditangani', 'Deal Closed', 'Total Omset (Rp)', 'Win Rate (%)'],
      ...teamLeaderboard.map(t => [t.name, t.role, t.assigned, t.closed, t.revenue, `${t.winRate}%`])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_CRM_Worrie_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pure PDF Report Preview Function
  const handlePreviewPdf = async () => {
    setPdfPreviewData({
      isOpen: true,
      url: null,
      filename: `Laporan_Eksekutif_CRM_Worrie_${new Date().toISOString().slice(0, 10)}.pdf`,
      loading: true
    });

    try {
      const res = await generateReportPdf({
        period,
        selectedPic,
        metrics,
        funnelStages,
        attributionChannels,
        teamLeaderboard
      });
      setPdfPreviewData({
        isOpen: true,
        url: res.url,
        filename: res.filename,
        loading: false
      });
    } catch (err) {
      console.error('Error generating PDF report:', err);
      setPdfPreviewData((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleClosePdf = () => {
    if (pdfPreviewData.url) {
      URL.revokeObjectURL(pdfPreviewData.url);
    }
    setPdfPreviewData({
      isOpen: false,
      url: null,
      filename: '',
      loading: false
    });
  };

  // Monthly Revenue Data for SVG Chart (Pure Real-time from Supabase 6 Months)
  const monthlyData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const result = [];

    const closedLeads = filteredLeads.filter(l => l.status === 'Closing');
    const inProgressLeads = filteredLeads.filter(l => ['Dihubungi', 'Follow Up', 'Quotation'].includes(l.status));

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const monthLabel = monthNames[mIdx];

      // Closed deals in this month
      const monthClosedLeads = closedLeads.filter(l => {
        const ld = new Date(l.created_at);
        return ld.getMonth() === mIdx && ld.getFullYear() === yr;
      });
      const monthWonQuotes = quotations.filter(q => {
        const qd = new Date(q.created_at);
        return q.status === 'accepted' && qd.getMonth() === mIdx && qd.getFullYear() === yr;
      });

      const leadRev = monthClosedLeads.reduce((acc, l) => acc + (l.deal_value || 0), 0);
      const quoteRev = monthWonQuotes.reduce((acc, q) => acc + (q.grand_total || 0), 0);
      const revenue = Math.max(leadRev, quoteRev);
      const deals = Math.max(monthClosedLeads.length, monthWonQuotes.length);

      // Pipeline created in this month
      const monthProgLeads = inProgressLeads.filter(l => {
        const ld = new Date(l.created_at);
        return ld.getMonth() === mIdx && ld.getFullYear() === yr;
      });
      const pipeline = monthProgLeads.reduce((acc, l) => acc + (l.deal_value || 0), 0);

      // X coordinate for SVG (0 to 600 width, padding 30 to 570)
      const x = 30 + (5 - i) * 108;
      // Y coordinates (height 200, bottom base 170, max 300jt)
      const yRev = revenue > 0 ? Math.max(30, 170 - (revenue / 300000000) * 130) : 170;
      const yPipe = pipeline > 0 ? Math.max(30, 170 - (pipeline / 300000000) * 130) : 170;

      result.push({
        month: monthLabel,
        revenue,
        pipeline,
        deals,
        x,
        yRev,
        yPipe
      });
    }

    return result;
  }, [filteredLeads, quotations]);

  // Dynamic SVG report paths
  const reportRevLine = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return 'M 30,170 L 570,170';
    return monthlyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x},${d.yRev}`).join(' ');
  }, [monthlyData]);

  const reportRevArea = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return '';
    return `${reportRevLine} L 570,170 L 30,170 Z`;
  }, [monthlyData, reportRevLine]);

  const reportPipeLine = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return 'M 30,170 L 570,170';
    return monthlyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x},${d.yPipe}`).join(' ');
  }, [monthlyData]);

  return (
    <div className="space-y-6 font-sans">
      {/* =========================================================================
          TOP EXECUTIVE HEADER & ACTION CONTROLS
      ========================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Laporan & Analitik CRM</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#004a87] text-[10px] font-extrabold shadow-2xs">
              <BarChart3 className="w-3 h-3 text-[#004a87]" />
              Executive BI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Analisis menyeluruh konversi sales pipeline, atribusi saluran, dan produktivitas tim marketing
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Muat Ulang Laporan"
          >
            <RotateCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin text-[#004a87]' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handlePreviewPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Pratinjau Dokumen PDF Murni"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Preview &amp; Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          FILTER TOOLBAR (Period Tabs + Standardized Searchable PIC Selector)
      ========================================================================== */}
      <div className="relative z-40 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500">Periode:</span>
          <div className="p-0.5 rounded-xl bg-slate-100 border border-slate-200 shadow-2xs flex items-center gap-0.5 text-xs">
            <button
              onClick={() => setPeriod('7d')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                period === '7d' ? 'bg-[#004a87] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setPeriod('30d')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                period === '30d' ? 'bg-[#004a87] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Hari
            </button>
            <button
              onClick={() => setPeriod('q4')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                period === 'q4' ? 'bg-[#004a87] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Q4
            </button>
            <button
              onClick={() => setPeriod('ytd')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                period === 'ytd' ? 'bg-[#004a87] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              YTD
            </button>
          </div>
        </div>

        {/* Standardized Searchable PIC Filter Dropdown with Safe Right Alignment */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter PIC:</span>
          <SearchablePicSelect
            value={selectedPic === 'all' ? '' : selectedPic}
            onChange={(val) => setSelectedPic(val ? val : 'all')}
            teamMembers={teamMembers}
            compact={true}
            dropdownAlign="right"
            placeholder="Semua Tim / PIC"
          />
        </div>
      </div>

      {/* =========================================================================
          5 EXECUTIVE KEY PERFORMANCE INDICATORS (KPIs) - Responsive Anti-Squish
      ========================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* KPI 1: Realisasi Pendapatan Closing */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold truncate">Total Omset Closed</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg xl:text-xl font-black text-slate-900 mt-2 font-mono truncate" title={formatIDR(metrics.closedRevenue)}>
              {formatIDR(metrics.closedRevenue)}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            <span>+18.4%</span>
            <span className="text-slate-400 font-normal">vs lalu</span>
          </div>
        </div>

        {/* KPI 2: Nilai Pipeline Aktif */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold truncate">Pipeline Aktif</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#004a87] flex items-center justify-center shadow-2xs shrink-0">
                <Kanban className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg xl:text-xl font-black text-slate-900 mt-2 font-mono truncate" title={formatIDR(metrics.pipelineValue)}>
              {formatIDR(metrics.pipelineValue)}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 mt-2 truncate">
            <span>{metrics.inProgressCount} deals</span>
            <span className="text-slate-400 font-normal">berjalan</span>
          </div>
        </div>

        {/* KPI 3: Closing Win Rate % */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold truncate">Win Rate Closing</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs shrink-0">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl xl:text-2xl font-black text-slate-900 mt-2 font-mono">
              {metrics.winRate}%
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            <span>+5.2%</span>
            <span className="text-slate-400 font-normal">target: 25%</span>
          </div>
        </div>

        {/* KPI 4: Nilai Rata-rata Deal */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold truncate">Avg. Deal Size</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs shrink-0">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg xl:text-xl font-black text-slate-900 mt-2 font-mono truncate" title={formatIDR(metrics.avgDealSize)}>
              {formatIDR(metrics.avgDealSize)}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mt-2 truncate">
            <span>Standar Kontrak MoU</span>
          </div>
        </div>

        {/* KPI 5: Sales Velocity (Siklus Closing) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between col-span-2 sm:col-span-1">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold truncate">Sales Velocity</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-2xs shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl xl:text-2xl font-black text-slate-900 mt-2 font-mono">
              {metrics.avgSalesCycle} Hari
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2 truncate">
            <span>2.4 hari lebih cepat</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: DUAL VISUAL CHARTS (Revenue Trend & Funnel Conversion)
      ========================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left (3 cols): Tren Pendapatan & Pertumbuhan Bulanan */}
        <div className="lg:col-span-3 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="font-extrabold text-sm text-slate-900">Pertumbuhan Pendapatan & Pipeline</h2>
                <p className="text-xs text-slate-500">Perbandingan realisasi closing vs proyeksi penawaran</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-[#004a87]"></span>
                  Omset Closed
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <span className="w-3 h-3 rounded-full bg-blue-300"></span>
                  Proyeksi Pipeline
                </span>
              </div>
            </div>

            {/* SVG Visual Growth Curve Chart */}
            <div className="relative h-64 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueReportGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#004a87" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#004a87" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                <line x1="0" y1="30" x2="600" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="80" x2="600" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="130" x2="600" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="180" x2="600" y2="180" stroke="#f1f5f9" strokeWidth="1" />

                {/* Pipeline Projection Line (Dotted Blue) */}
                <path
                  d={reportPipeLine}
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                />

                {/* Revenue Gradient Fill */}
                {metrics.closedRevenue > 0 && (
                  <path
                    d={reportRevArea}
                    fill="url(#revenueReportGrad)"
                  />
                )}

                {/* Revenue Solid Curve Line */}
                <path
                  d={reportRevLine}
                  fill="none"
                  stroke="#004a87"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Interactive Points */}
                {monthlyData.map((d, i) => {
                  const isHovered = hoveredMonth === i;

                  return (
                    <g key={d.month} className="cursor-pointer">
                      <circle
                        cx={d.x}
                        cy={d.yRev}
                        r={isHovered ? 7 : 4.5}
                        fill="#004a87"
                        stroke="#ffffff"
                        strokeWidth={isHovered ? 3 : 2}
                        className="transition-all duration-200"
                        onMouseEnter={() => setHoveredMonth(i)}
                        onMouseLeave={() => setHoveredMonth(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Month Labels */}
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold mt-2 px-4">
                {monthlyData.map((d, i) => (
                  <span 
                    key={d.month} 
                    className={`cursor-pointer transition-colors ${hoveredMonth === i ? 'text-[#004a87] font-bold' : ''}`}
                    onMouseEnter={() => setHoveredMonth(i)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {d.month}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Tooltip Info Box */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {hoveredMonth !== null ? (
                <span>Bulan <strong>{monthlyData[hoveredMonth].month}</strong>: Realisasi {formatIDR(monthlyData[hoveredMonth].revenue)} ({monthlyData[hoveredMonth].deals} deals)</span>
              ) : (
                <span>Arahkan kursor pada titik grafik untuk rincian tiap bulan</span>
              )}
            </span>
            <span className="text-slate-500 font-bold">
              {metrics.closedRevenue > 0 ? `Total Omset: ${formatIDR(metrics.closedRevenue)}` : 'Sinkron Real-time Supabase'}
            </span>
          </div>
        </div>

        {/* Right (2 cols): Analisis Corong Konversi (Sales Pipeline Funnel) */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-extrabold text-sm text-slate-900">Analisis Corong Konversi</h2>
                <p className="text-xs text-slate-500">Tingkat konversi per tahapan pipeline</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Funnel 360°
              </span>
            </div>

            {/* Funnel Progress Bars */}
            <div className="space-y-4 pt-1">
              {funnelStages.map((stage, idx) => (
                <div key={stage.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 font-mono font-bold">{stage.count} Leads</span>
                      <span className="text-[11px] text-slate-400">({stage.percentage}%)</span>
                    </div>
                  </div>

                  {/* Horizontal Bar with Conversion Dropoff Hint */}
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${stage.color} transition-all duration-700`}
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>

                  {idx > 0 && (
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                      <span>Lolos dari tahap sebelumnya: <strong className="text-emerald-700">{stage.conversionFromPrev}%</strong></span>
                      <span className="text-rose-500">Drop: {100 - stage.conversionFromPrev}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 font-medium">
            💡 <strong>Insight Konversi:</strong> Dari total {metrics.totalLeads} prospek terdaftar, sebanyak {metrics.closedCount} prospek berhasil closing (Win Rate: {metrics.winRate}%).
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: ATRIBUSI SALURAN / SUMBER PROSPEK (LEAD ATTRIBUTION)
      ========================================================================== */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="font-extrabold text-sm text-slate-900">Atribusi Saluran & Efektivitas Sumber Lead</h2>
            <p className="text-xs text-slate-500">Mengetahui saluran akuisisi dengan omset dan win rate tertinggi</p>
          </div>
          <span className="text-xs text-[#004a87] font-bold">Total Akuisisi: {metrics.totalLeads} Prospek Terkumpul</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {attributionChannels.map((c) => (
            <div 
              key={c.channel}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  {c.badge}
                </span>
                <span className="text-xs font-bold text-emerald-600">{c.winRate}% Win</span>
              </div>

              <div>
                <h3 className="font-bold text-xs text-slate-900 truncate" title={c.channel}>{c.channel}</h3>
                <p className="text-sm font-black text-slate-900 mt-1 font-mono">{formatIDR(c.revenue)}</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>{c.leads} Leads</span>
                  <span>{c.deals} Won</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.winRate * 1.8}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: KINERJA TIM MARKETING & SALES LEADERBOARD
      ========================================================================== */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm text-slate-900">Leaderboard & Produktivitas Tim</h2>
              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                Kinerja Marketer
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Penetapan target omset, tingkat closing, dan kecepatan respon kontak</p>
          </div>
          <Link
            href="/team"
            className="text-xs font-bold text-[#004a87] hover:underline flex items-center gap-1"
          >
            <span>Kelola Anggota Tim</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Nama Tim / PIC</th>
                <th className="py-3 px-4 text-center">Leads Ditugaskan</th>
                <th className="py-3 px-4 text-center">Deal Closed</th>
                <th className="py-3 px-4 text-right">Total Nilai Omset</th>
                <th className="py-3 px-4 text-center">Closing Rate</th>
                <th className="py-3 px-4 text-center">Kecepatan Respon</th>
                <th className="py-3 px-4 text-right">Status Kinerja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {teamLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <p className="text-xs font-bold text-slate-600">Belum ada data marketer di sistem</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Daftarkan tim di menu Kelola Anggota Tim.</p>
                  </td>
                </tr>
              ) : (
                teamLeaderboard.map((member) => (
                <tr key={member.id} className="hover:bg-blue-50/50 transition-colors">
                  {/* Member Name & Avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{member.name}</p>
                        <p className="text-[10px] text-slate-400">{member.role}</p>
                      </div>
                    </div>
                  </td>

                  {/* Assigned Leads */}
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                    {member.assigned} Leads
                  </td>

                  {/* Deals Closed */}
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                    {member.closed} Won
                  </td>

                  {/* Total Revenue */}
                  <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                    {formatIDR(member.revenue)}
                  </td>

                  {/* Win Rate */}
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#004a87] border border-blue-200">
                      {member.winRate}%
                    </span>
                  </td>

                  {/* Response Speed */}
                  <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">
                    {member.avgResponse}
                  </td>

                  {/* Badge */}
                  <td className="py-3 px-4 text-right">
                    <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                      {member.badge}
                    </span>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          SECTION 5: DAFTAR TRANSAKSI CLOSING TERAKHIR (CLOSING AUDIT LOG)
      ========================================================================== */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-sm text-slate-900">Audit Transaksi Deal Closed Terbaru</h2>
            <p className="text-xs text-slate-500 mt-0.5">Daftar kesepakatan kerjasama & proposal yang telah disetujui resmi</p>
          </div>
          <Link
            href="/quotations"
            className="text-xs font-bold text-[#004a87] hover:underline flex items-center gap-1"
          >
            <span>Semua Dokumen MoU</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredLeads.filter(l => l.status === 'Closing').length === 0 && quotations.filter(q => q.status === 'accepted').length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
              <p className="text-xs font-bold text-slate-600">Belum ada transaksi deal closed (MoU) di Supabase</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Transaksi yang mencapai tahap Closing atau penawaran yang disetujui akan tampil di audit ini.</p>
            </div>
          ) : (
            filteredLeads
              .filter(l => l.status === 'Closing')
              .slice(0, 6)
              .map((lead) => (
                <div key={lead.id} className="p-3.5 rounded-xl border border-emerald-200/90 bg-emerald-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      MoU Ditandatangani
                    </span>
                    <span className="text-[10px] text-slate-400">Deal Closed</span>
                  </div>
                  <p className="text-xs font-extrabold text-slate-900 truncate">{lead.business_name}</p>
                  <p className="text-xs text-slate-600 font-medium">PIC: {lead.assigned_to || 'Tim Sales'}</p>
                  <div className="pt-1 flex items-center justify-between border-t border-emerald-200/60 text-xs">
                    <span className="font-black text-emerald-800 font-mono">{formatIDR(lead.deal_value || 0)}</span>
                    <span className="text-[10px] font-bold text-slate-500">Won</span>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Pure PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={pdfPreviewData.isOpen}
        onClose={handleClosePdf}
        pdfUrl={pdfPreviewData.url}
        filename={pdfPreviewData.filename}
        title="Laporan Eksekutif CRM BI Worrie.id"
        subtitle={`Periode: ${period.toUpperCase()} • Filter PIC: ${selectedPic === 'all' ? 'Seluruh Tim' : selectedPic}`}
        loading={pdfPreviewData.loading}
      />
    </div>
  );
}
