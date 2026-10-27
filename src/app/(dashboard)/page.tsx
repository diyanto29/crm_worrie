'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Wallet, 
  CheckSquare, 
  TrendingUp, 
  Search, 
  Bell, 
  Plus, 
  ChevronDown, 
  MoreHorizontal, 
  Mail, 
  Calendar, 
  Building2, 
  ArrowUpRight, 
  Clock, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  FileSpreadsheet,
  Check,
  Send,
  PhoneCall,
  X,
  RotateCw,
  Activity
} from 'lucide-react';
import { DataStore } from '@/lib/dataStore';
import { 
  Lead, 
  Campaign, 
  LeadStatus, 
  Quotation, 
  LeadTask, 
  LeadActivity,
  UserProfile
} from '@/types/database';
import { useAuth } from '@/lib/authContext';

// Animated Counter component with smooth ease-out interpolation
function AnimatedNumber({ 
  value, 
  prefix = '', 
  suffix = '', 
  isCurrency = false 
}: { 
  value: number; 
  prefix?: string; 
  suffix?: string; 
  isCurrency?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 2200; // Slower, silky smooth count-up
    const startValue = 0;
    const targetValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutCubic curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (targetValue - startValue) * easeProgress);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValue);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value]);

  if (isCurrency) {
    return <>{prefix}Rp {displayValue.toLocaleString('id-ID')}{suffix}</>;
  }

  return <>{prefix}{displayValue.toLocaleString('id-ID')}{suffix}</>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [quotations, setQuotations] = useState<Array<Quotation & { lead?: Lead }>>([]);
  const [tasks, setTasks] = useState<Array<LeadTask & { lead?: Lead }>>([]);
  const [activities, setActivities] = useState<Array<LeadActivity & { lead?: Lead }>>([]);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // Filter & interaction state
  const [chartPeriod, setChartPeriod] = useState<'6m' | '1y'>('6m');
  const [pipelineFilter, setPipelineFilter] = useState<'all' | 'b2b'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const loadAllData = async (triggerAnimation = false) => {
    if (triggerAnimation) setIsRefreshing(true);
    else setLoading(true);

    try {
      const [
        loadedLeads, 
        loadedCampaigns, 
        loadedQuotes, 
        loadedTasks, 
        loadedActivities,
        loadedMembers
      ] = await Promise.all([
        DataStore.getLeads(),
        DataStore.getCampaigns(),
        DataStore.getAllQuotations(),
        DataStore.getAllTasks(),
        DataStore.getAllActivities(10),
        DataStore.getTeamMembers(),
      ]);
      setLeads(loadedLeads);
      setCampaigns(loadedCampaigns);
      setQuotations(loadedQuotes);
      setTasks(loadedTasks);
      setActivities(loadedActivities);
      setTeamMembers(loadedMembers);
      if (triggerAnimation) {
        setAnimKey(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Compute live KPI metrics
  const totalLeads = leads.length;
  const closedLeads = leads.filter(l => l.status === 'Closing');
  const wonDealsCount = closedLeads.length || quotations.filter(q => q.status === 'accepted').length;
  const inProgressDeals = leads.filter(l => l.status === 'Dihubungi' || l.status === 'Follow Up' || l.status === 'Quotation');
  const totalDeals = inProgressDeals.length + closedLeads.length;

  const totalRevenue = useMemo(() => {
    const fromWonLeads = closedLeads.reduce((acc, curr) => acc + (Number(curr.deal_value) || 0), 0);
    const fromQuotes = quotations.filter(q => q.status === 'accepted').reduce((acc, curr) => acc + (Number(curr.grand_total) || 0), 0);
    return Math.max(fromWonLeads, fromQuotes);
  }, [closedLeads, quotations]);

  const completedTasks = tasks.filter(t => t.is_completed);
  const taskCompletionPct = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  const formatIDR = (val: number) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`;

  // Stage breakdown
  const statusCounts = useMemo(() => ({
    'Belum dihubungi': leads.filter(l => l.status === 'Belum dihubungi').length,
    'Dihubungi': leads.filter(l => l.status === 'Dihubungi').length,
    'Follow Up': leads.filter(l => l.status === 'Follow Up').length,
    'Quotation': leads.filter(l => l.status === 'Quotation').length,
    'Closing': leads.filter(l => l.status === 'Closing').length,
    'Ditolak': leads.filter(l => l.status === 'Ditolak').length,
  }), [leads]);

  // Chart data points (6 Months dynamic from real data)
  const chartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const monthLabel = monthNames[mIdx];

      // Match leads closed in this month
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
      const revTotal = Math.max(leadRev, quoteRev);
      const dealsCount = Math.max(monthClosedLeads.length, monthWonQuotes.length);

      // SVG coordinate calculations (max 300M, height 240)
      const revInMillions = Math.round(revTotal / 1000000);
      const yRev = Math.max(40, 240 - (revInMillions / 300) * 180);
      const yDeal = Math.max(50, 240 - (dealsCount / 30) * 170);

      result.push({
        month: monthLabel,
        rev: revInMillions,
        deals: dealsCount,
        revLabel: formatIDR(revTotal),
        x: 40 + (5 - i) * 100,
        yRev: revTotal > 0 ? yRev : 230,
        yDeal: dealsCount > 0 ? yDeal : 230,
      });
    }

    return result;
  }, [closedLeads, quotations]);

  // Dynamic SVG path lines from real metrics
  const revLinePath = useMemo(() => {
    if (!chartData || chartData.length === 0) return 'M 40,248 L 540,248';
    return chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x},${d.yRev}`).join(' ');
  }, [chartData]);

  const revAreaPath = useMemo(() => {
    if (!chartData || chartData.length === 0) return '';
    const firstX = chartData[0].x;
    const lastX = chartData[chartData.length - 1].x;
    return `${revLinePath} L ${lastX},250 L ${firstX},250 Z`;
  }, [chartData, revLinePath]);

  const dealLinePath = useMemo(() => {
    if (!chartData || chartData.length === 0) return 'M 40,248 L 540,248';
    return chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x},${d.yDeal}`).join(' ');
  }, [chartData]);

  // Pipeline funnel stages matching CRM Pipeline (/crm) column names (100% Real from Supabase)
  const totalActivePipeline = (
    statusCounts['Belum dihubungi'] +
    statusCounts['Dihubungi'] +
    statusCounts['Follow Up'] +
    statusCounts['Quotation'] +
    statusCounts['Closing']
  );

  const pipelineStages = [
    {
      id: 'prospek_baru',
      name: 'Prospek Baru',
      sublabel: 'Lead baru masuk',
      count: statusCounts['Belum dihubungi'],
      pct: totalActivePipeline > 0 ? Math.round((statusCounts['Belum dihubungi'] / totalActivePipeline) * 100) : 0,
      icon: Layers,
      iconBg: 'bg-rose-100 text-rose-700',
      barColor: 'bg-rose-500',
    },
    {
      id: 'dihubungi',
      name: 'Dihubungi',
      sublabel: 'Proses kualifikasi & kontak',
      count: statusCounts['Dihubungi'],
      pct: totalActivePipeline > 0 ? Math.round((statusCounts['Dihubungi'] / totalActivePipeline) * 100) : 0,
      icon: Users,
      iconBg: 'bg-emerald-100 text-emerald-700',
      barColor: 'bg-emerald-500',
    },
    {
      id: 'follow_up',
      name: 'Follow Up & Demo',
      sublabel: 'Presentasi & follow up',
      count: statusCounts['Follow Up'],
      pct: totalActivePipeline > 0 ? Math.round((statusCounts['Follow Up'] / totalActivePipeline) * 100) : 0,
      icon: TrendingUp,
      iconBg: 'bg-sky-100 text-sky-700',
      barColor: 'bg-sky-500',
    },
    {
      id: 'proposal',
      name: 'Proposal & Penawaran',
      sublabel: 'Penawaran MoU / harga dikirim',
      count: statusCounts['Quotation'],
      pct: totalActivePipeline > 0 ? Math.round((statusCounts['Quotation'] / totalActivePipeline) * 100) : 0,
      icon: FileSpreadsheet,
      iconBg: 'bg-indigo-100 text-indigo-700',
      barColor: 'bg-indigo-500',
    },
    {
      id: 'closing',
      name: 'Deal Menang (Closing)',
      sublabel: 'Berhasil ditutup / closing',
      count: statusCounts['Closing'],
      pct: totalActivePipeline > 0 ? Math.round((statusCounts['Closing'] / totalActivePipeline) * 100) : 0,
      icon: CheckCircle2,
      iconBg: 'bg-teal-100 text-teal-800',
      barColor: 'bg-teal-500',
    },
  ];

  // Recent Leads Table (Connected to Team Management PICs)
  const recentLeads = useMemo(() => {
    return leads.slice(0, 5).map((l) => {
      const pic = teamMembers.find((m) => m.full_name === l.assigned_to);
      const picName = l.assigned_to || 'Belum Ditugaskan';
      const picAvatar = pic?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(picName)}&background=004a87&color=fff&bold=true`;
      const picEmail = pic?.email || '-';

      const source = l.gmaps_url || l.source_prospect_id 
        ? 'Google Maps' 
        : l.website_url 
        ? 'Website' 
        : 'Direct / Manual';

      const diffMs = Date.now() - new Date(l.created_at).getTime();
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      const timeStr = diffDays > 0 ? `${diffDays} hari lalu` : diffHours > 0 ? `${diffHours} jam lalu` : 'Baru saja';

      return {
        id: l.id,
        name: picName,
        email: picEmail,
        company: l.business_name,
        source,
        status: l.status === 'Belum dihubungi' 
          ? 'Prospek Baru' 
          : l.status === 'Dihubungi' 
          ? 'Dihubungi' 
          : l.status === 'Follow Up'
          ? 'Follow Up & Demo'
          : l.status === 'Quotation'
          ? 'Proposal & Penawaran'
          : l.status === 'Closing' 
          ? 'Deal Menang' 
          : 'Ditolak',
        statusColor: l.status === 'Belum dihubungi' 
          ? 'bg-rose-50 text-rose-700 border-rose-200' 
          : l.status === 'Dihubungi' 
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
          : l.status === 'Follow Up'
          ? 'bg-sky-50 text-sky-700 border-sky-200'
          : l.status === 'Quotation'
          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
          : l.status === 'Closing'
          ? 'bg-teal-50 text-teal-700 border-teal-200'
          : 'bg-slate-100 text-slate-700 border-slate-200',
        time: timeStr,
        avatarUrl: picAvatar
      };
    });
  }, [leads, teamMembers]);

  // Recent Activities (Pure Real-time from Supabase database)
  const recentActivities = useMemo(() => {
    return activities.map((act) => {
      let icon = CheckCircle2;
      let iconColor = 'text-blue-500 bg-blue-50 border-blue-200';

      if (act.activity_type === 'stage_changed') {
        icon = CheckCircle2;
        iconColor = 'text-emerald-500 bg-emerald-50 border-emerald-200';
      } else if (act.activity_type === 'quotation_created' || act.activity_type === 'quotation_sent') {
        icon = Mail;
        iconColor = 'text-purple-500 bg-purple-50 border-purple-200';
      } else if (act.activity_type === 'contact_added' || act.activity_type === 'contact_updated') {
        icon = Users;
        iconColor = 'text-indigo-500 bg-indigo-50 border-indigo-200';
      } else if (act.activity_type === 'meeting') {
        icon = Calendar;
        iconColor = 'text-amber-500 bg-amber-50 border-amber-200';
      } else if (act.activity_type === 'note_created') {
        icon = CheckSquare;
        iconColor = 'text-teal-500 bg-teal-50 border-teal-200';
      }

      const diffMs = Date.now() - new Date(act.created_at).getTime();
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      const timeStr = diffDays > 0 ? `${diffDays} hari lalu` : diffHours > 0 ? `${diffHours} jam lalu` : 'Baru saja';

      return {
        id: act.id,
        title: act.title,
        subtitle: `${act.lead?.business_name ? `${act.lead.business_name} • ` : ''}oleh ${act.actor_name || 'Tim Sales'}`,
        time: timeStr,
        icon,
        iconColor,
      };
    });
  }, [activities]);

  return (
    <div key={animKey} className="space-y-6 font-sans">
      {/* =========================================================================
          TOP HEADER BAR (Matching CRM Pro Screenshot + Interactive Realtime Badge)
      ========================================================================== */}
      <div className="relative z-40 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-card-slide">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
              {/* Realtime Live Pulse Indicator */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Overview bisnis dan aktivitas CRM real-time</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Animation Button */}
          <button
            onClick={() => loadAllData(true)}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
            title="Muat Ulang Data & Animasi"
          >
            <RotateCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin text-[#004a87]' : ''}`} />
          </button>

          {/* Search Bar with Keyboard Hint */}
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#004a87] transition-colors" />
            <input
              type="text"
              placeholder="Cari sesuatu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87] w-48 sm:w-64 shadow-2xs transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
              /
            </kbd>
          </div>

          {/* Notification Bell with Dynamic Pending Tasks Badge */}
          <div className="relative group">
            <button 
              onClick={() => router.push('/tasks')}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs transition-transform duration-200 group-hover:scale-105 active:scale-95 cursor-pointer"
              title="Notifikasi Tugas Pending"
            >
              <Bell className="w-4 h-4 text-slate-600 group-hover:rotate-12 transition-transform duration-200" />
            </button>
            {tasks.filter(t => !t.is_completed).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white animate-pulse">
                {tasks.filter(t => !t.is_completed).length}
              </span>
            )}
          </div>

          {/* Primary Action Button: + Tambah Baru ▾ with Higher Stacking Context */}
          <div className="relative z-50">
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Baru</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isAddMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu & Outside Click Backdrop */}
            {isAddMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setIsAddMenuOpen(false)} 
                />
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-2xl p-1.5 z-50 animate-modal-pop"
                  onClick={() => setIsAddMenuOpen(false)}
                >
                  <Link
                    href="/leads"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#004a87] transition-all hover:translate-x-1"
                  >
                    <Building2 className="w-4 h-4 text-[#004a87]" />
                    <span>+ Tambah Lead Baru</span>
                  </Link>
                  <Link
                    href="/projects"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-all hover:translate-x-1"
                  >
                    <Search className="w-4 h-4 text-purple-600" />
                    <span>+ Scrape Prospek Baru</span>
                  </Link>
                  <Link
                    href="/quotations"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all hover:translate-x-1"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>+ Buat Penawaran / MoU</span>
                  </Link>
                  <Link
                    href="/tasks"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-all hover:translate-x-1"
                  >
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>+ Jadwal Agenda Follow-Up</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          TOP 5 KPI METRIC CARDS (Animated Stagger + Counting Up + Shimmer Hover)
      ========================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Leads */}
        <div 
          onClick={() => router.push('/leads')}
          style={{ animationDelay: '120ms' }}
          className="animate-card-slide-slow group relative overflow-hidden p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:border-purple-300 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold group-hover:text-slate-800 transition-colors">Total Leads</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono group-hover:text-purple-700 transition-colors">
            <AnimatedNumber value={totalLeads} />
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mt-1">
            <span className="text-[#004a87] font-semibold">{leads.length > 0 ? `${leads.length} prospek` : 'Belum ada prospek'}</span>
          </div>
        </div>

        {/* Card 2: Total Deals */}
        <div 
          onClick={() => router.push('/crm')}
          style={{ animationDelay: '260ms' }}
          className="animate-card-slide-slow group relative overflow-hidden p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-300 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold group-hover:text-slate-800 transition-colors">Total Deals</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono group-hover:text-blue-700 transition-colors">
            <AnimatedNumber value={totalDeals} />
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mt-1">
            <span className="text-[#004a87] font-semibold">{totalDeals > 0 ? `${inProgressDeals.length} aktif pipeline` : 'Pipeline kosong'}</span>
          </div>
        </div>

        {/* Card 3: Deal Won */}
        <div 
          onClick={() => router.push('/crm')}
          style={{ animationDelay: '400ms' }}
          className="animate-card-slide-slow group relative overflow-hidden p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:border-emerald-300 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold group-hover:text-slate-800 transition-colors">Deal Won</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono group-hover:text-emerald-700 transition-colors">
            <AnimatedNumber value={wonDealsCount} />
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mt-1">
            <span className="text-emerald-600 font-semibold">{wonDealsCount > 0 ? `${totalDeals > 0 ? Math.round((wonDealsCount / totalDeals) * 100) : 0}% win rate` : 'Belum closing'}</span>
          </div>
        </div>

        {/* Card 4: Pendapatan */}
        <div 
          onClick={() => router.push('/quotations')}
          style={{ animationDelay: '540ms' }}
          className="animate-card-slide-slow group relative overflow-hidden p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:border-amber-300 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold group-hover:text-slate-800 transition-colors">Pendapatan</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 mt-2 font-mono truncate group-hover:text-amber-700 transition-colors" title={formatIDR(totalRevenue)}>
            <AnimatedNumber value={totalRevenue} isCurrency={true} />
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mt-1">
            <span className="text-amber-700 font-semibold">{totalRevenue > 0 ? 'Omset terverifikasi' : 'Belum ada omset'}</span>
          </div>
        </div>

        {/* Card 5: Tugas Selesai */}
        <div 
          onClick={() => router.push('/tasks')}
          style={{ animationDelay: '680ms' }}
          className="animate-card-slide-slow group relative overflow-hidden p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:border-rose-300 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold group-hover:text-slate-800 transition-colors">Tugas Selesai</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono group-hover:text-rose-700 transition-colors">
            <AnimatedNumber value={taskCompletionPct} suffix="%" />
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mt-1">
            <span className="text-rose-600 font-semibold">{tasks.length > 0 ? `${completedTasks.length}/${tasks.length} tuntas` : 'Belum ada tugas'}</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MIDDLE SECTION: SALES PERFORMANCE SVG CHART & PIPELINE FUNNEL
      ========================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left (3 cols): Performa Penjualan Interactive Dual-Axis Chart with SVG Clip Sweep */}
        <div 
          style={{ animationDelay: '820ms' }}
          className="animate-card-slide-slow lg:col-span-3 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-slate-900">Performa Penjualan</h2>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
                  Grafik Tren
                </span>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={chartPeriod}
                  onChange={(e) => setChartPeriod(e.target.value as '6m' | '1y')}
                  className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-[#004a87] focus:outline-none cursor-pointer shadow-2xs transition-colors"
                >
                  <option value="6m">6 Bulan Terakhir</option>
                  <option value="1y">1 Tahun Terakhir</option>
                </select>
              </div>
            </div>

            {/* Legend Indicators with Hover Highlights */}
            <div className="flex items-center gap-6 mb-3 text-xs font-bold">
              <div className="flex items-center gap-2 text-purple-700 hover:scale-105 transition-transform cursor-pointer">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-purple-200" />
                <span>Pendapatan (Rp)</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600 hover:scale-105 transition-transform cursor-pointer">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-500 bg-white ring-2 ring-blue-100" />
                <span>Deal Won</span>
              </div>
            </div>

            {/* SVG Interactive Dual-Axis Line Chart with Animated Sweep Clip */}
            <div className="relative w-full h-64 select-none">
              <svg 
                key={`${chartPeriod}-${animKey}`}
                className="w-full h-full overflow-visible" 
                viewBox="0 0 600 260"
              >
                <defs>
                  <linearGradient id={`purpleGradient-${animKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Sweep clip that expands from width 0 to 600px */}
                  <clipPath id={`chartSweepClip-${animKey}`}>
                    <rect x="0" y="0" height="260" className="animate-chart-sweep" />
                  </clipPath>
                </defs>

                {/* Horizontal Grid Lines */}
                {[50, 100, 150, 200, 250].map((yVal, i) => (
                  <g key={i}>
                    <line
                      x1="40"
                      y1={yVal}
                      x2="560"
                      y2={yVal}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    {/* Left Y-axis labels (Rp jt) */}
                    <text x="35" y={yVal + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                      {300 - i * 50} jt
                    </text>
                    {/* Right Y-axis labels (Deals Count) */}
                    <text x="565" y={yVal + 4} textAnchor="start" className="text-[10px] fill-slate-400 font-mono">
                      {120 - i * 20}
                    </text>
                  </g>
                ))}

                {/* Base X-Axis */}
                <line x1="40" y1="250" x2="560" y2="250" stroke="#e2e8f0" strokeWidth="1" />
                <text x="35" y="254" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">0</text>
                <text x="565" y="254" textAnchor="start" className="text-[10px] fill-slate-400 font-mono">0</text>

                {/* X-axis Month Labels */}
                {chartData.map((d) => (
                  <text
                    key={d.month}
                    x={d.x}
                    y="272"
                    textAnchor="middle"
                    className="text-[11px] font-semibold fill-slate-500"
                  >
                    {d.month}
                  </text>
                ))}

                {/* Animated Graphic Content (Swept visibly from Jan to Jun) */}
                <g clipPath={`url(#chartSweepClip-${animKey})`}>
                  {/* Revenue Gradient Fill Area */}
                  {totalRevenue > 0 && (
                    <path
                      d={revAreaPath}
                      fill={`url(#purpleGradient-${animKey})`}
                    />
                  )}

                  {/* Revenue Solid Purple Line */}
                  <path
                    d={revLinePath}
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />

                  {/* Deal Won Dotted Blue Line */}
                  <path
                    d={dealLinePath}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.2"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                  />

                  {/* Interactive Points on Line */}
                  {chartData.map((d, idx) => (
                    <g 
                      key={idx}
                      onMouseEnter={() => setHoveredPoint(idx)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="cursor-pointer"
                    >
                      {/* Hover Ping Ring for Revenue point */}
                      {hoveredPoint === idx && (
                        <circle
                          cx={d.x}
                          cy={d.yRev}
                          r="12"
                          fill="none"
                          stroke="#7c3aed"
                          strokeWidth="1.5"
                          opacity="0.4"
                          className="animate-ping"
                        />
                      )}

                      {/* Revenue point */}
                      <circle
                        cx={d.x}
                        cy={d.yRev}
                        r={hoveredPoint === idx ? '6.5' : '4.5'}
                        fill="#7c3aed"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all duration-200"
                      />

                      {/* Deal Won point */}
                      <circle
                        cx={d.x}
                        cy={d.yDeal}
                        r={hoveredPoint === idx ? '5.5' : '3.5'}
                        fill="#3b82f6"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all duration-200"
                      />
                    </g>
                  ))}
                </g>
              </svg>

              {/* Hover Popover Tooltip with Bounce Animation */}
              {hoveredPoint !== null && (
                <div 
                  className="absolute pointer-events-none bg-slate-900/95 backdrop-blur-md text-white rounded-xl p-3 text-xs shadow-2xl space-y-1.5 z-20 -translate-x-1/2 -translate-y-full animate-modal-pop border border-slate-700"
                  style={{ 
                    left: `${(chartData[hoveredPoint].x / 600) * 100}%`,
                    top: `${(chartData[hoveredPoint].yRev / 260) * 100 - 12}%`
                  }}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-700 pb-1">
                    <p className="font-extrabold text-[11px] text-slate-200">
                      Bulan {chartData[hoveredPoint].month}
                    </p>
                    <span className="text-[10px] text-emerald-400 font-bold">Terverifikasi</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-purple-300 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                    <span>{chartData[hoveredPoint].revLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-blue-300 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                    <span>{chartData[hoveredPoint].deals} Deals Won</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right (2 cols): Pipeline Deals (Stages matching CRM page + Animated Progress Growth) */}
        <div 
          style={{ animationDelay: '960ms' }}
          className="animate-card-slide-slow lg:col-span-2 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-slate-900">Pipeline Deals</h2>
                <Link 
                  href="/crm"
                  className="text-[11px] font-bold text-[#004a87] hover:underline"
                >
                  Buka Pipeline &rarr;
                </Link>
              </div>
              <select
                value={pipelineFilter}
                onChange={(e) => setPipelineFilter(e.target.value as 'all' | 'b2b')}
                className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-[#004a87] focus:outline-none cursor-pointer shadow-2xs transition-colors"
              >
                <option value="all">Semua Pipeline</option>
                <option value="b2b">B2B Sekolah &amp; Kampus</option>
              </select>
            </div>

            {/* Stages Stack with Interactive Row Lift and Bar Growth */}
            <div className="space-y-3">
              {pipelineStages.map((stage, sIdx) => {
                const IconComponent = stage.icon;
                return (
                  <div 
                    key={stage.id} 
                    onClick={() => router.push('/crm')}
                    className="group space-y-1.5 p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg ${stage.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 leading-tight group-hover:text-[#004a87] transition-colors">{stage.name}</p>
                          <p className="text-[10px] text-slate-400">{stage.sublabel}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <span className="font-extrabold text-slate-800 text-xs font-mono group-hover:scale-105 transition-transform">
                          {stage.count} Leads
                        </span>
                        <span className="font-mono text-slate-400 text-xs font-semibold w-8 group-hover:text-slate-900 transition-colors">
                          {stage.pct}%
                        </span>
                      </div>
                    </div>

                    {/* Animated Progress Bar (Slow growth) */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${stage.barColor} rounded-full transition-all duration-1000 ease-out animate-bar-grow-slow`}
                        style={{ 
                          width: `${stage.pct}%`,
                          animationDelay: `${sIdx * 200 + 500}ms`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM SECTION: LEADS TERBARU TABLE & RECENT ACTIVITY FEED
      ========================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        {/* Left: Leads Terbaru Table with Row Hover Animation */}
        <div 
          style={{ animationDelay: '1100ms' }}
          className="animate-card-slide-slow rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-slate-900">Leads Terbaru</h2>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#004a87] text-[10px] font-bold border border-blue-100">
                  Update Baru
                </span>
              </div>
              <Link 
                href="/leads"
                className="text-xs font-bold text-[#004a87] hover:underline"
              >
                Lihat Semua &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                    <th className="py-2.5 px-4 font-normal">Nama</th>
                    <th className="py-2.5 px-4 font-normal">Perusahaan</th>
                    <th className="py-2.5 px-4 font-normal">Sumber</th>
                    <th className="py-2.5 px-4 font-normal">Status</th>
                    <th className="py-2.5 px-4 font-normal">Dibuat</th>
                    <th className="py-2.5 px-3 text-right font-normal"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                        <p className="text-xs font-bold text-slate-600">Belum ada data prospek di Supabase</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Jalankan scraping Google Maps atau tambahkan lead baru di menu Leads.</p>
                      </td>
                    </tr>
                  ) : (
                    recentLeads.map((item, rIdx) => (
                      <tr 
                        key={item.id} 
                        onClick={() => router.push(`/crm/${item.id}`)}
                        className="hover:bg-blue-50/50 hover:translate-x-0.5 transition-all duration-150 cursor-pointer group"
                      >
                        {/* Name & Avatar */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img 
                              src={item.avatarUrl} 
                              alt={item.name} 
                              className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200 shadow-2xs group-hover:scale-110 group-hover:ring-[#004a87] transition-all duration-200"
                            />
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-900 text-xs truncate max-w-[120px] group-hover:text-[#004a87] transition-colors">{item.name}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[120px] font-mono">{item.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Company */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-[#004a87] transition-colors" />
                            <span className="truncate max-w-[130px]">{item.company}</span>
                          </div>
                        </td>

                        {/* Source */}
                        <td className="py-3 px-4 text-slate-500 font-medium text-[11px]">
                          {item.source}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.statusColor} group-hover:shadow-2xs transition-shadow`}>
                            {item.status}
                          </span>
                        </td>

                        {/* Time Created */}
                        <td className="py-3 px-4 text-slate-400 font-medium text-[11px] whitespace-nowrap">
                          {item.time}
                        </td>

                        {/* Action Button */}
                        <td className="py-3 px-3 text-right">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/crm/${item.id}`);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Buka Prospek"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Aktivitas Terbaru (Recent Activity Feed with Pop Animation) */}
        <div 
          style={{ animationDelay: '1250ms' }}
          className="animate-card-slide-slow rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-slate-900">Aktivitas Terbaru</h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                  360° Log
                </span>
              </div>
              <Link 
                href="/tasks"
                className="text-xs font-bold text-[#004a87] hover:underline"
              >
                Lihat Semua &rarr;
              </Link>
            </div>

            <div className="p-4 space-y-3.5">
              {recentActivities.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                  <p className="text-xs font-bold text-slate-600">Belum ada riwayat aktivitas</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Semua aksi pembaruan tahap, follow-up, dan proposal tercatat di sini.</p>
                </div>
              ) : (
                recentActivities.map((act) => {
                  const IconComponent = act.icon;
                  return (
                    <div 
                      key={act.id} 
                      className="group flex items-start justify-between gap-3 text-xs p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-all duration-150 cursor-pointer"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${act.iconColor} group-hover:scale-110 group-hover:rotate-6 transition-all duration-200 shadow-2xs`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 leading-snug truncate group-hover:text-[#004a87] transition-colors">
                            {act.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {act.subtitle}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-400 whitespace-nowrap font-medium shrink-0 group-hover:text-slate-600 transition-colors">
                        {act.time}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
