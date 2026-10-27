'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Search, 
  Phone, 
  Plus, 
  MapPin, 
  Star, 
  Flame, 
  ArrowRight, 
  Send, 
  UserCheck, 
  Calendar, 
  AlertCircle, 
  X, 
  ExternalLink,
  MessageCircle,
  MoreHorizontal,
  GripVertical,
  Paperclip,
  Video,
  Sparkles,
  Check,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  HelpCircle,
  Bell,
  Kanban
} from 'lucide-react';
import { DataStore } from '@/lib/dataStore';
import { Lead, LeadStatus, MessageTemplate, UserProfile } from '@/types/database';
import { calculateProspectScore, getProspectScoreBadge } from '@/lib/score';
import BroadcastModal from '@/components/BroadcastModal';
import { useAuth } from '@/lib/authContext';
import { SearchablePicSelect } from '@/components/SearchableSelect';

// Column configurations matching modern CRM visual pill styles (Bahasa Indonesia)
const COLUMNS: { 
  status: LeadStatus; 
  label: string; 
  pillBg: string;
  pillText: string;
  dotColor: string;
}[] = [
  { 
    status: 'Belum dihubungi', 
    label: 'Prospek Baru',
    pillBg: 'bg-rose-100',
    pillText: 'text-rose-700',
    dotColor: 'bg-rose-500'
  },
  { 
    status: 'Dihubungi', 
    label: 'Dihubungi', 
    pillBg: 'bg-emerald-100',
    pillText: 'text-emerald-700',
    dotColor: 'bg-emerald-500'
  },
  { 
    status: 'Follow Up', 
    label: 'Follow Up & Demo', 
    pillBg: 'bg-sky-100',
    pillText: 'text-sky-700',
    dotColor: 'bg-sky-500'
  },
  { 
    status: 'Quotation', 
    label: 'Proposal & Penawaran', 
    pillBg: 'bg-indigo-100',
    pillText: 'text-indigo-700',
    dotColor: 'bg-indigo-500'
  },
  { 
    status: 'Closing', 
    label: 'Deal Menang (Closing)', 
    pillBg: 'bg-teal-100',
    pillText: 'text-teal-800',
    dotColor: 'bg-teal-500'
  },
  { 
    status: 'Ditolak', 
    label: 'Ditolak / Batal', 
    pillBg: 'bg-slate-200',
    pillText: 'text-slate-700',
    dotColor: 'bg-slate-500'
  },
];

const LOST_REASON_OPTIONS = [
  'Kemahalan / Anggaran Tidak Tersedia',
  'Sudah Ada Vendor / Mitra Pelatihan Lain',
  'Belum Butuh Program Remote Work Saat Ini',
  'Nomor Tidak Aktif / Salah Sambung',
  'Lainnya',
];

export default function CRMPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const actorName = profile?.full_name || 'Tim Sales Worrie';

  const [leads, setLeads] = useState<Lead[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [collapsedStages, setCollapsedStages] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('30days');
  const [isStarFavorite, setIsStarFavorite] = useState(true);

  const toggleStageCollapse = (status: string) => {
    setCollapsedStages((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  // Modals & Panels
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isAiInsightsOpen, setIsAiInsightsOpen] = useState(false);
  const [quickAddColumnStatus, setQuickAddColumnStatus] = useState<LeadStatus | null>(null);

  // Drag and drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dropTargetCol, setDropTargetCol] = useState<LeadStatus | null>(null);

  // Quick Lead Create Form state
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadAddress, setNewLeadAddress] = useState('');
  const [newLeadDealValue, setNewLeadDealValue] = useState<number>(0);
  const [newLeadAssignedTo, setNewLeadAssignedTo] = useState('');
  const [savingLead, setSavingLead] = useState(false);

  // Lost Reason Modal State
  const [lostReasonLeadId, setLostReasonLeadId] = useState<string | null>(null);
  const [selectedLostReason, setSelectedLostReason] = useState<string>(LOST_REASON_OPTIONS[0]);
  const [customLostReason, setCustomLostReason] = useState<string>('');

  const reloadData = async () => {
    try {
      const [allLeads, allTemplates, members] = await Promise.all([
        DataStore.getLeads(),
        DataStore.getTemplates(),
        DataStore.getTeamMembers(),
      ]);
      setLeads(allLeads);
      setTemplates(allTemplates);
      setTeamMembers(members);
    } catch (err) {
      console.error('Failed to load CRM leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  useEffect(() => {
    if (profile?.full_name && !newLeadAssignedTo) {
      setNewLeadAssignedTo(profile.full_name);
    }
  }, [profile]);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    if (newStatus === 'Ditolak') {
      setLostReasonLeadId(leadId);
      return;
    }

    const currentLead = leads.find((l) => l.id === leadId);
    const oldStatus = currentLead?.status || 'Tahap Sebelumnya';

    await DataStore.updateLead(leadId, { status: newStatus });
    await DataStore.createLeadActivity({
      lead_id: leadId,
      activity_type: 'stage_changed',
      title: `Tahap Pipeline Berubah: ${oldStatus} → ${newStatus}`,
      description: `Status prospek dipindahkan dari "${oldStatus}" ke "${newStatus}" melalui Papan Kanban CRM.`,
      actor_name: actorName,
    });
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
  };

  const handleConfirmLostReason = async () => {
    if (!lostReasonLeadId) return;

    const finalReason = selectedLostReason === 'Lainnya' && customLostReason.trim()
      ? customLostReason.trim()
      : selectedLostReason;

    await DataStore.updateLead(lostReasonLeadId, { 
      status: 'Ditolak', 
      lost_reason: finalReason 
    });

    await DataStore.createLeadActivity({
      lead_id: lostReasonLeadId,
      activity_type: 'stage_changed',
      title: 'Status Dialihkan: Ditolak / Batal',
      description: `Alasan penolakan: ${finalReason}`,
      actor_name: actorName,
    });

    setLeads((prev) => prev.map((l) => 
      l.id === lostReasonLeadId ? { ...l, status: 'Ditolak', lost_reason: finalReason } : l
    ));

    setLostReasonLeadId(null);
    setCustomLostReason('');
  };

  // Drag and Drop handlers
  const handleDragStart = (leadId: string, e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (status: LeadStatus, e: React.DragEvent) => {
    e.preventDefault();
    if (dropTargetCol !== status) {
      setDropTargetCol(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // only reset if leaving the column boundary
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropTargetCol(null);
    }
  };

  const handleDrop = (targetStatus: LeadStatus, e: React.DragEvent) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    setDropTargetCol(null);
    setDraggedLeadId(null);

    if (leadId) {
      const currentLead = leads.find((l) => l.id === leadId);
      if (currentLead && currentLead.status !== targetStatus) {
        handleStatusChange(leadId, targetStatus);
      }
    }
  };

  // Quick Add Lead to Specific Column
  const handleQuickCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadPhone.trim()) {
      alert('Mohon isi nama sekolah dan nomor kontak.');
      return;
    }

    setSavingLead(true);
    try {
      const targetStatus = quickAddColumnStatus || 'Belum dihubungi';
      await DataStore.createLead({
        business_name: newLeadName.trim(),
        phone: newLeadPhone.trim(),
        primary_phone: newLeadPhone.trim(),
        address: newLeadAddress.trim() || 'Indonesia',
        deal_value: Number(newLeadDealValue) || 0,
        status: targetStatus,
        assigned_to: newLeadAssignedTo || profile?.full_name || null,
        notes: `Didaftarkan cepat dari Pipeline Kanban (${targetStatus}).`,
      }, actorName);

      setNewLeadName('');
      setNewLeadPhone('');
      setNewLeadAddress('');
      setNewLeadDealValue(0);
      setNewLeadAssignedTo(profile?.full_name || '');
      setQuickAddColumnStatus(null);
      await reloadData();
    } catch (err) {
      console.error('Failed to create lead', err);
      alert('Gagal menambahkan lead baru');
    } finally {
      setSavingLead(false);
    }
  };

  // Filters
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchSearch =
        !searchQuery ||
        lead.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.address && lead.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.phone && lead.phone.includes(searchQuery)) ||
        (lead.assigned_to && lead.assigned_to.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchAssignee =
        assignedFilter === 'all'
          ? true
          : assignedFilter === 'unassigned'
          ? !lead.assigned_to
          : lead.assigned_to === assignedFilter;

      const matchSegment =
        segmentFilter === 'all'
          ? true
          : segmentFilter === 'smk'
          ? lead.business_name.toLowerCase().includes('smk')
          : segmentFilter === 'sma'
          ? lead.business_name.toLowerCase().includes('sma')
          : segmentFilter === 'univ'
          ? lead.business_name.toLowerCase().includes('universitas') || lead.business_name.toLowerCase().includes('kampus')
          : true;

      return matchSearch && matchAssignee && matchSegment;
    });
  }, [leads, searchQuery, assignedFilter, segmentFilter]);

  const formatIDR = (val: number) => {
    return `Rp ${Number(val || 0).toLocaleString('id-ID')}`;
  };

  const getWaUrl = (lead: Lead) => {
    const cleanPhone = (lead.phone || lead.primary_phone || '').replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const text = `Halo ${lead.business_name}, salam hangat dari tim Working Remotely Indonesia (Worrie.id). Izin menindaklanjuti program kemitraan edukasi digital.`;
    return `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`;
  };

  const getPicMember = (picName?: string | null) => {
    if (!picName) return null;
    const clean = picName.trim().toLowerCase();

    // 1. Exact match in teamMembers
    let found = teamMembers.find((m) => (m.full_name || '').trim().toLowerCase() === clean);
    if (found) return found;

    // 2. Fuzzy / partial match (e.g. "Dianto" matches "Diyanto" or "Dika (Marketing)")
    found = teamMembers.find((m) => {
      const fn = (m.full_name || '').trim().toLowerCase();
      const em = (m.email || '').trim().toLowerCase();
      return (
        fn.includes(clean) || 
        clean.includes(fn) || 
        (clean.length >= 3 && fn.startsWith(clean.slice(0, 3))) ||
        (clean.length >= 3 && clean.startsWith(fn.slice(0, 3))) ||
        em.startsWith(clean)
      );
    });
    if (found) return found;

    // 3. Fallback to current authenticated user profile
    if (profile) {
      const profName = (profile.full_name || '').trim().toLowerCase();
      const profEmail = (profile.email || '').trim().toLowerCase();
      if (
        profName.includes(clean) || 
        clean.includes(profName) || 
        (clean.length >= 3 && profName.startsWith(clean.slice(0, 3))) ||
        profEmail.startsWith(clean)
      ) {
        return profile;
      }
    }

    return null;
  };

  const getPicAvatarUrl = (picName?: string | null) => {
    if (!picName) return null;
    const member = getPicMember(picName);
    if (member?.avatar_url) return member.avatar_url;
    if (profile?.avatar_url) {
      const clean = picName.trim().toLowerCase();
      const profName = (profile.full_name || '').trim().toLowerCase();
      if (profName.includes(clean) || clean.includes(profName)) {
        return profile.avatar_url;
      }
    }
    // High-quality UI avatar fallback with initials in brand navy background
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(picName)}&background=004a87&color=ffffff&bold=true`;
  };

  // Aggregate stats
  const totalPipelineValue = useMemo(() => {
    return filteredLeads.reduce((acc, curr) => acc + (Number(curr.deal_value) || 0), 0);
  }, [filteredLeads]);

  return (
    <div className="space-y-5 animate-fade-in font-sans">
      {/* =========================================================================
          TOP BREADCRUMB CONTEXT BAR (Matching UI Screenshot)
      ========================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Pipeline Kemitraan</span>
            <span>/</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-[#004a87]" />
              <span>B2B Sekolah &amp; Universitas</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          <button
            onClick={() => setIsStarFavorite(!isStarFavorite)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isStarFavorite
                ? 'bg-amber-50 text-amber-500 border-amber-200'
                : 'bg-white text-slate-400 border-slate-200 hover:text-amber-500'
            }`}
            title="Tandai favorit"
          >
            <Star className={`w-3.5 h-3.5 ${isStarFavorite ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Right user context & stats */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-400 block font-medium">Total Pipeline Deal</span>
            <span className="text-xs font-mono font-extrabold text-[#004a87]">
              {formatIDR(totalPipelineValue)}
            </span>
          </div>

          <button
            onClick={() => setIsBroadcastOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-3.5 h-3.5 text-[#004a87]" />
            <span>Broadcast WA</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          CONTROLS TOOLBAR (Search, Period, Filters, View Toggle, AI, & Add Button)
      ========================================================================== */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        {/* Left: Search & Filter Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          {/* Search Box */}
          <div className="relative min-w-[220px] max-w-xs flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari sekolah atau PIC..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87] transition-all"
            />
          </div>

          {/* Follow-Up Period Pill Dropdown */}
          <div className="flex items-center gap-1 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 font-semibold cursor-pointer hover:bg-slate-100 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 text-[11px]">Follow-Up:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="30days">30 Hari</option>
              <option value="today">Hari Ini</option>
              <option value="thisweek">Minggu Ini</option>
              <option value="all">Semua Waktu</option>
            </select>
          </div>

          {/* Segment Filter (All Positions in Screenshot) */}
          <div className="flex items-center gap-1 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 font-semibold">
            <span className="text-slate-500 text-[11px]">Segmen:</span>
            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Jenjang</option>
              <option value="smk">SMK Negeri &amp; Swasta</option>
              <option value="sma">SMA Negeri &amp; Swasta</option>
              <option value="univ">Universitas &amp; Politeknik</option>
            </select>
          </div>

          {/* Standardized Searchable PIC Marketing Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] font-semibold">PIC:</span>
            <SearchablePicSelect
              value={assignedFilter === 'all' || assignedFilter === 'unassigned' ? '' : assignedFilter}
              onChange={(val) => setAssignedFilter(val ? val : 'all')}
              teamMembers={teamMembers}
              compact={true}
              placeholder="Semua Tim"
            />
          </div>

          {/* View Switcher Toggle (List | Kanban) */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#004a87] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan List Per Tahap"
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#004a87] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Grid Kotak / Kanban Board"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Grid Kotak</span>
            </button>
          </div>
        </div>

        {/* Right: AI Insights & Add Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAiInsightsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Analisis AI</span>
          </button>

          <button
            onClick={() => setQuickAddColumnStatus('Belum dihubungi')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Prospek</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW MODE 1: KANBAN BOARD COLUMNS (LEBIH LEBAR & LEGA - ANCHOR ATS STYLE)
      ========================================================================== */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-8 items-start min-h-[calc(100vh-240px)] scrollbar-thin">
          {COLUMNS.map((col) => {
            const colLeads = filteredLeads.filter((l) => l.status === col.status);
            const colValue = colLeads.reduce((acc, curr) => acc + (Number(curr.deal_value) || 0), 0);
            const isTargeted = dropTargetCol === col.status;

            return (
              <div
                key={col.status}
                onDragOver={(e) => handleDragOver(col.status, e)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(col.status, e)}
                className={`flex flex-col rounded-3xl transition-all duration-200 w-[315px] sm:w-[335px] shrink-0 ${
                  isTargeted
                    ? 'bg-blue-50/70 ring-2 ring-[#004a87] ring-dashed'
                    : 'bg-slate-100/70'
                }`}
              >
                {/* Column Header matching Screenshot */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Colored Badge Pill with drag grip */}
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${col.pillBg} ${col.pillText}`}>
                      <GripVertical className="w-3 h-3 opacity-60" />
                      <span>{col.label}</span>
                    </div>

                    {/* Counter Badge */}
                    <span className="w-5 h-5 rounded-full bg-white text-slate-800 text-[11px] font-extrabold flex items-center justify-center shadow-2xs border border-slate-200/80">
                      {colLeads.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => setQuickAddColumnStatus(col.status)}
                      className="p-1 rounded-lg hover:bg-white hover:text-slate-800 transition-colors cursor-pointer"
                      title={`Tambah Lead ke tahap ${col.label}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded-lg hover:bg-white hover:text-slate-800 transition-colors">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Column Value sub-indicator */}
                {colValue > 0 && (
                  <div className="px-3.5 pb-2 text-[10px] font-mono font-bold text-slate-500 flex items-center justify-between">
                    <span>Nilai Tahap:</span>
                    <span className="text-[#004a87]">{formatIDR(colValue)}</span>
                  </div>
                )}

                {/* Cards Container */}
                <div className="p-2.5 space-y-3 min-h-[480px]">
                  {/* Drag Drop Zone Placeholder (matching screenshot dashed card) */}
                  {isTargeted && draggedLeadId && (
                    <div className="border-2 border-dashed border-[#004a87]/40 bg-blue-50/50 rounded-2xl h-32 flex flex-col items-center justify-center text-center p-3 text-xs font-bold text-[#004a87] animate-pulse">
                      <Layers className="w-5 h-5 mb-1 opacity-70" />
                      <span>Lepas di sini untuk pindah ke</span>
                      <span className="text-[11px] opacity-80">{col.label}</span>
                    </div>
                  )}

                  {colLeads.length === 0 && !isTargeted ? (
                    <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-300/80 rounded-2xl bg-white/40">
                      <Building2 className="w-5 h-5 text-slate-300 mb-1" />
                      <span className="text-[11px] font-medium text-slate-400">Belum ada prospek</span>
                      <button
                        onClick={() => setQuickAddColumnStatus(col.status)}
                        className="mt-2 text-[10px] text-[#004a87] font-bold hover:underline"
                      >
                        + Tambah sekarang
                      </button>
                    </div>
                  ) : (
                    colLeads.map((lead) => {
                      const score = typeof lead.prospect_score === 'number' && lead.prospect_score > 0
                        ? lead.prospect_score
                        : calculateProspectScore(lead);
                      const waUrl = getWaUrl(lead);
                      const picMember = getPicMember(lead.assigned_to);
                      const picAvatarUrl = getPicAvatarUrl(lead.assigned_to);

                      return (
                        <div
                          key={lead.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(lead.id, e)}
                          onClick={() => router.push(`/crm/${lead.id}`)}
                          className={`p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-grab active:cursor-grabbing space-y-3 relative group ${
                            draggedLeadId === lead.id ? 'opacity-40 scale-95' : ''
                          }`}
                        >
                          {/* Card Top: School Identity (Left) & PIC Badge (Photo + Name) + Menu (Right) */}
                          <div className="flex items-start justify-between gap-2.5">
                            {/* School / Institution Identity */}
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#004a87] flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200/80 shadow-2xs group-hover:bg-blue-50 transition-colors mt-0.5">
                                {lead.business_name.toLowerCase().includes('smk') ? (
                                  <span className="text-[13px]">🏫</span>
                                ) : lead.business_name.toLowerCase().includes('universitas') || lead.business_name.toLowerCase().includes('kampus') ? (
                                  <span className="text-[13px]">🎓</span>
                                ) : (
                                  <Building2 className="w-4 h-4 text-[#004a87]" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h3 
                                  className="font-extrabold text-slate-900 text-xs sm:text-sm truncate group-hover:text-[#004a87] transition-colors leading-tight"
                                  title={lead.business_name}
                                >
                                  {lead.business_name}
                                </h3>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                                  {lead.address ? lead.address.split(',')[0] : 'B2B Kemitraan Edukasi'}
                                </p>
                              </div>
                            </div>

                            {/* Right: PIC Badge (Photo + Name) & More Menu */}
                            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                              {/* PIC Badge with Photo and Name */}
                              {lead.assigned_to ? (
                                <div 
                                  className="inline-flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full bg-blue-50/90 hover:bg-blue-100 text-[#004a87] border border-blue-200/70 text-[10px] font-extrabold transition-all shadow-2xs max-w-[130px] cursor-pointer"
                                  title={`PIC: ${lead.assigned_to} (${picMember?.role === 'admin' ? 'Admin' : 'Marketing'})`}
                                  onClick={() => router.push(`/crm/${lead.id}`)}
                                >
                                  <img 
                                    src={picAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(lead.assigned_to)}&background=004a87&color=fff&bold=true`} 
                                    alt={lead.assigned_to} 
                                    referrerPolicy="no-referrer"
                                    className="w-4.5 h-4.5 rounded-full object-cover shrink-0 ring-1 ring-white"
                                  />
                                  <span className="truncate">{lead.assigned_to}</span>
                                </div>
                              ) : (
                                <div 
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-medium border border-dashed border-slate-200"
                                  title="Belum ada PIC ditugaskan"
                                >
                                  <UserCheck className="w-3 h-3 text-slate-400" />
                                  <span className="hidden sm:inline">No PIC</span>
                                </div>
                              )}

                              <button 
                                onClick={() => router.push(`/crm/${lead.id}`)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                                title="Buka Detail"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* AI Match Score / Potensi Bar (Matching Screenshot Column 1) */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-[#004a87] flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                AI Match Score
                              </span>
                              <span className="font-mono font-extrabold text-[#004a87] text-xs">
                                {score}%
                              </span>
                            </div>
                            {/* Vibrant Gradient Progress Bar */}
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-gradient-to-r from-[#004a87] via-indigo-600 to-amber-500 transition-all duration-500"
                                style={{ width: `${Math.min(Math.max(score, 15), 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Metadata Details with Clean Icons */}
                          <div className="space-y-1.5 text-[11px] text-slate-600 pt-1">
                            {/* Deal Value */}
                            <div className="flex items-center gap-2 font-medium">
                              <span className="w-4 flex justify-center text-slate-400 font-bold">💼</span>
                              <span className="font-mono font-bold text-slate-900">
                                {lead.deal_value ? formatIDR(lead.deal_value) : 'Belum estimasi deal'}
                              </span>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-4 flex justify-center text-slate-400">📍</span>
                              <span className="truncate">{lead.address || 'Indonesia'}</span>
                            </div>

                            {/* Contact */}
                            <div className="flex items-center gap-2">
                              <span className="w-4 flex justify-center text-slate-400">📞</span>
                              <span className="font-mono">{lead.phone || lead.primary_phone || '-'}</span>
                            </div>
                          </div>

                          {/* Checklist / Document Preview (Like Column 2 in Screenshot) */}
                          <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-150 space-y-1 text-[11px]">
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="flex items-center gap-1.5 truncate">
                                <span className="text-[12px]">📄</span> Proposal Penawaran
                              </span>
                              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                            </div>
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="flex items-center gap-1.5 truncate">
                                <span className="text-[12px]">📁</span> Portofolio Worrie
                              </span>
                              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                            </div>
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="flex items-center gap-1.5 truncate">
                                <span className="text-[12px]">🔗</span> Portal Sekolah
                              </span>
                              {lead.has_website ? (
                                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                              ) : (
                                <span className="text-[10px] text-slate-400">—</span>
                              )}
                            </div>
                          </div>

                          {/* Meeting Schedule Preview (If next_action_at set, like Column 3) */}
                          {lead.next_action_at && (
                            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-2.5 space-y-1 text-[11px]">
                              <div className="font-extrabold text-[#004a87] flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <CalendarCheck className="w-3 h-3" />
                                  Janji Follow-Up
                                </span>
                                <Video className="w-3 h-3 text-[#004a87]" />
                              </div>
                              <div className="text-slate-600 font-medium">
                                📅 {new Date(lead.next_action_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                                {' • '}
                                {new Date(lead.next_action_at).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })} WIB
                              </div>
                              {lead.next_action_notes && (
                                <p className="text-[10px] text-slate-500 italic truncate">
                                  "{lead.next_action_notes}"
                                </p>
                              )}
                            </div>
                          )}

                          {/* Lost reason banner if rejected */}
                          {lead.lost_reason && lead.status === 'Ditolak' && (
                            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2 text-[10px] font-bold text-rose-800 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span className="truncate">Alasan: {lead.lost_reason}</span>
                            </div>
                          )}

                          {/* Card Footer: Links / Documents Count Badges & Direct WA */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-semibold text-[10px]">
                                <Paperclip className="w-2.5 h-2.5 text-slate-400" />
                                2 Links
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-semibold text-[10px]">
                                1 Dokumen
                              </span>
                            </div>

                            {/* Quick WhatsApp Action */}
                            {(lead.phone || lead.primary_phone) && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors shadow-2xs"
                                title="Hubungi via WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
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
      ) : (
        /* =========================================================================
            VIEW MODE 2: PIPELINE LIST VIEW (GROUPED BY STAGE DENGAN DETAIL LENGKAP)
        ========================================================================== */
        <div className="space-y-4 pb-12">
          {COLUMNS.map((col) => {
            const colLeads = filteredLeads.filter((l) => l.status === col.status);
            const colValue = colLeads.reduce((acc, curr) => acc + (Number(curr.deal_value) || 0), 0);
            const isCollapsed = Boolean(collapsedStages[col.status]);

            return (
              <div 
                key={col.status}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200"
              >
                {/* Stage Header Accordion */}
                <div 
                  onClick={() => toggleStageCollapse(col.status)}
                  className="p-4 bg-slate-50/70 hover:bg-slate-100/60 transition-colors border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-transform"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                    </button>

                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${col.pillBg} ${col.pillText}`}>
                      <GripVertical className="w-3 h-3 opacity-60" />
                      <span>{col.label}</span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-800 text-xs font-extrabold shadow-2xs border border-slate-200">
                      {colLeads.length} Prospek
                    </span>
                  </div>

                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    {colValue > 0 && (
                      <div className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <span className="text-slate-400 font-normal">Total Estimasi:</span>
                        <span className="font-mono text-[#004a87] font-extrabold">{formatIDR(colValue)}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setQuickAddColumnStatus(col.status)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-[#004a87]" />
                      <span>Tambah Prospek</span>
                    </button>
                  </div>
                </div>

                {/* Stage Items List */}
                {!isCollapsed && (
                  <div>
                    {colLeads.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 font-medium">
                        Belum ada prospek pada tahap ini.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 overflow-x-auto">
                        {colLeads.map((lead) => {
                          const score = typeof lead.prospect_score === 'number' && lead.prospect_score > 0
                            ? lead.prospect_score
                            : calculateProspectScore(lead);
                          const waUrl = getWaUrl(lead);
                          const picMember = getPicMember(lead.assigned_to);
                          const picAvatarUrl = getPicAvatarUrl(lead.assigned_to);

                          return (
                            <div
                              key={lead.id}
                              className="list-item-standard p-3.5 hover:bg-blue-50/50 hover:translate-x-1 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs group cursor-pointer"
                            >
                              {/* Left: Avatar, Name, Alamat & PIC */}
                              <div className="flex items-center gap-3 min-w-[280px] max-w-[340px]">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#004a87] flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200/80 shadow-2xs group-hover:scale-110 group-hover:ring-2 group-hover:ring-[#004a87] transition-all duration-200">
                                  {lead.business_name.toLowerCase().includes('smk') ? (
                                    <span className="text-[13px]">🏫</span>
                                  ) : lead.business_name.toLowerCase().includes('universitas') || lead.business_name.toLowerCase().includes('kampus') ? (
                                    <span className="text-[13px]">🎓</span>
                                  ) : (
                                    <Building2 className="w-4 h-4 text-[#004a87]" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <Link
                                    href={`/crm/${lead.id}`}
                                    className="font-bold text-slate-900 group-hover:text-[#004a87] transition-colors truncate block text-sm"
                                  >
                                    {lead.business_name}
                                  </Link>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                    <span className="truncate max-w-[160px]">📍 {lead.address ? lead.address.split(',')[0] : 'Indonesia'}</span>
                                    <span>•</span>
                                    {lead.assigned_to ? (
                                      <span className="inline-flex items-center gap-1.5 font-extrabold text-[#004a87] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 text-[10px]">
                                        <img 
                                          src={picAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(lead.assigned_to)}&background=004a87&color=fff&bold=true`} 
                                          alt="" 
                                          referrerPolicy="no-referrer"
                                          className="w-4 h-4 rounded-full object-cover shrink-0 ring-1 ring-white" 
                                        />
                                        <span>PIC: {lead.assigned_to}</span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 font-medium text-[10px]">
                                        Belum di-assign
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Middle: Deal Value, AI Score, & Schedule */}
                              <div className="flex items-center gap-6">
                                {/* Deal Value */}
                                <div className="min-w-[120px]">
                                  <span className="text-[10px] text-slate-400 block font-medium">Estimasi Deal</span>
                                  <span className="font-mono font-bold text-slate-900 text-xs">
                                    {lead.deal_value ? formatIDR(lead.deal_value) : '-'}
                                  </span>
                                </div>

                                {/* AI Score */}
                                <div className="min-w-[110px]">
                                  <div className="flex items-center justify-between text-[11px] mb-1">
                                    <span className="text-[#004a87] font-bold flex items-center gap-1">
                                      <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                                      Match
                                    </span>
                                    <span className="font-mono font-extrabold text-[#004a87]">{score}%</span>
                                  </div>
                                  <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full bg-gradient-to-r from-[#004a87] via-indigo-600 to-amber-500"
                                      style={{ width: `${Math.min(Math.max(score, 15), 100)}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Janji Follow-Up */}
                                <div className="min-w-[150px] hidden lg:block">
                                  <span className="text-[10px] text-slate-400 block font-medium">Janji Follow-Up</span>
                                  {lead.next_action_at ? (
                                    <span className="text-slate-700 font-semibold text-[11px] flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-[#004a87]" />
                                      {new Date(lead.next_action_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                      })} ({new Date(lead.next_action_at).toLocaleTimeString('id-ID', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })})
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic text-[11px]">Belum dijadwalkan</span>
                                  )}
                                </div>
                              </div>

                              {/* Right: Quick Stage Changer & Action Buttons */}
                              <div className="flex items-center gap-2 shrink-0">
                                {/* Quick Move Stage Dropdown */}
                                <select
                                  value={lead.status}
                                  onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:border-[#004a87] focus:outline-none focus:ring-1 focus:ring-[#004a87] cursor-pointer"
                                >
                                  {COLUMNS.map((c) => (
                                    <option key={c.status} value={c.status}>
                                      {c.label}
                                    </option>
                                  ))}
                                </select>

                                {/* WhatsApp Button */}
                                {(lead.phone || lead.primary_phone) && (
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shadow-2xs"
                                    title="Chat WhatsApp"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </a>
                                )}

                                {/* Detail Button */}
                                <Link
                                  href={`/crm/${lead.id}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#004a87] hover:text-white text-slate-700 font-bold transition-all shadow-2xs"
                                >
                                  <span>Detail</span>
                                  <ArrowRight className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL QUICK ADD LEAD (TRIGGERED BY "+" ON COLUMNS)
      ========================================================================== */}
      {quickAddColumnStatus && (
        <div 
          role="dialog"
          aria-modal="true"
          onClick={() => setQuickAddColumnStatus(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-backdrop-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-modal-pop"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#004a87]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Tambah Lead Baru
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Masuk ke tahap: <strong className="text-[#004a87]">{quickAddColumnStatus}</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setQuickAddColumnStatus(null)}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-500 text-xs font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickCreateLead} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Sekolah / Universitas *
                </label>
                <input
                  type="text"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  placeholder="Contoh: SMKN 2 Bandung"
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No Telepon / WA *
                  </label>
                  <input
                    type="text"
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimasi Deal (Rp)
                  </label>
                  <input
                    type="number"
                    value={newLeadDealValue || ''}
                    onChange={(e) => setNewLeadDealValue(Number(e.target.value))}
                    placeholder="15000000"
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kota &amp; Alamat
                </label>
                <input
                  type="text"
                  value={newLeadAddress}
                  onChange={(e) => setNewLeadAddress(e.target.value)}
                  placeholder="Contoh: Jl. Merdeka No. 10, Bandung"
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PIC Marketing
                </label>
                <SearchablePicSelect
                  value={newLeadAssignedTo}
                  onChange={setNewLeadAssignedTo}
                  teamMembers={teamMembers}
                  placeholder="-- Belum Ditugaskan --"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setQuickAddColumnStatus(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingLead}
                  className="px-4 py-2 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  {savingLead ? 'Menyimpan...' : 'Simpan Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL AI INSIGHTS & FORECAST
      ========================================================================== */}
      {isAiInsightsOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          onClick={() => setIsAiInsightsOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-backdrop-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-modal-pop"
          >
            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-purple-50 via-white to-blue-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    AI Pipeline Insights
                  </h3>
                  <p className="text-xs text-slate-500">
                    Analisis konversi dan prediksi deal otomatis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiInsightsOpen(false)}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-500 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-purple-800">
                  <Flame className="w-4 h-4 text-purple-600" />
                  Rekomendasi Tindakan Cepat Hari Ini
                </div>
                <p className="leading-relaxed text-purple-700">
                  Terdapat <strong>{filteredLeads.filter(l => l.status === 'Follow Up' || l.status === 'Quotation').length} institusi</strong> di tahap Presentasi &amp; Proposal yang berpeluang closing tinggi minggu ini. Segera tindaklanjuti via WhatsApp sebelum akhir pekan.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Win Probability</span>
                  <span className="text-2xl font-mono font-extrabold text-emerald-700 mt-1 block">
                    {Math.round((filteredLeads.filter(l => l.status === 'Closing').length / Math.max(filteredLeads.length, 1)) * 100)}%
                  </span>
                  <span className="text-[10px] text-slate-400">Rasio deal tercapai</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Avg Deal Size</span>
                  <span className="text-xl font-mono font-extrabold text-[#004a87] mt-1 block">
                    {formatIDR(Math.round(totalPipelineValue / Math.max(filteredLeads.length, 1)))}
                  </span>
                  <span className="text-[10px] text-slate-400">Rata-rata per proposal</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsAiInsightsOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs"
                >
                  Tutup Analisis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL LOST REASON (ALASAN DITOLAK)
      ========================================================================== */}
      {lostReasonLeadId && (
        <div 
          role="dialog"
          aria-modal="true"
          onClick={() => setLostReasonLeadId(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-backdrop-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-modal-pop"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Konfirmasi Alasan Penolakan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Catat alasan penolakan untuk evaluasi penawaran selanjutnya.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {LOST_REASON_OPTIONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      selectedLostReason === reason
                        ? 'border-[#004a87] bg-blue-50/50 text-[#004a87] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lost_reason"
                      checked={selectedLostReason === reason}
                      onChange={() => setSelectedLostReason(reason)}
                      className="accent-[#004a87]"
                    />
                    <span>{reason}</span>
                  </label>
                ))}

                {selectedLostReason === 'Lainnya' && (
                  <textarea
                    rows={2}
                    value={customLostReason}
                    onChange={(e) => setCustomLostReason(e.target.value)}
                    placeholder="Tuliskan alasan penolakan spesifik..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87] bg-slate-50"
                  />
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setLostReasonLeadId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLostReason}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  Simpan Status Ditolak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast WhatsApp Modal */}
      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        leads={filteredLeads}
        templates={templates}
      />
    </div>
  );
}
