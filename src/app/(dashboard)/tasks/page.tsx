'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CheckSquare, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Building2, 
  ExternalLink, 
  Trash2, 
  RefreshCw, 
  CheckCircle2,
  CalendarCheck,
  CalendarClock,
  MessageCircle,
  ArrowRight,
  List,
  Milestone,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles,
  X,
  Layers,
  MapPin,
  ChevronDown,
  Filter,
  Flame,
  PhoneCall
} from 'lucide-react';
import { DataStore } from '@/lib/dataStore';
import { LeadTask, Lead } from '@/types/database';
import { useAuth } from '@/lib/authContext';

export default function TasksPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Array<LeadTask & { lead?: Lead }>>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // View mode: 'list' | 'timeline' | 'calendar'
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'calendar'>('list');
  
  // Filter & search states for main page
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'overdue' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Calendar state (current year & month being viewed)
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  
  // Selected day popup modal state
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);
  const [dayModalFilter, setDayModalFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [dayModalSearch, setDayModalSearch] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // New task form state
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  // Prevent background scroll when modal is open (Modern Web Best Practice)
  useEffect(() => {
    if (selectedCalendarDay || isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (isModalOpen) setIsModalOpen(false);
          else if (selectedCalendarDay) setSelectedCalendarDay(null);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedCalendarDay, isModalOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [loadedTasks, loadedLeads] = await Promise.all([
        DataStore.getAllTasks(),
        DataStore.getLeads(),
      ]);
      setTasks(loadedTasks);
      setLeads(loadedLeads);
      if (loadedLeads.length > 0 && !selectedLeadId) {
        setSelectedLeadId(loadedLeads[0].id);
      }
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleTask = async (task: LeadTask, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTogglingId(task.id);
    try {
      const actorName = profile?.full_name || 'Tim Sales Worrie';
      await DataStore.toggleLeadTask(task.id, !task.is_completed, actorName);
      await loadData();
    } catch (err) {
      console.error('Failed to toggle task', err);
      alert('Gagal mengubah status tugas');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteTask = async (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Hapus jadwal follow-up ini?')) return;
    try {
      await DataStore.deleteLeadTask(taskId);
      await loadData();
    } catch (err) {
      console.error('Failed to delete task', err);
      alert('Gagal menghapus tugas');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDueDate || !selectedLeadId) {
      alert('Mohon lengkapi seluruh data follow-up.');
      return;
    }

    setSavingTask(true);
    try {
      const actorName = profile?.full_name || 'Tim Sales Worrie';
      await DataStore.createLeadTask({
        lead_id: selectedLeadId,
        title: taskTitle.trim(),
        due_date: new Date(taskDueDate).toISOString(),
        is_completed: false,
      }, actorName);

      setTaskTitle('');
      setTaskDueDate('');
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to create task', err);
      alert('Gagal membuat jadwal follow-up');
    } finally {
      setSavingTask(false);
    }
  };

  const navigateToLead = (leadId?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (leadId) {
      router.push(`/crm/${leadId}`);
    }
  };

  const openAddTaskForDate = (dateKey: string) => {
    setTaskDueDate(`${dateKey}T09:00`);
    setIsModalOpen(true);
  };

  // Helper date classifiers
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const isTaskToday = (dateStr: string) => {
    const d = new Date(dateStr);
    return d >= todayStart && d <= todayEnd;
  };

  const isTaskOverdue = (task: LeadTask) => {
    if (task.is_completed) return false;
    const d = new Date(task.due_date);
    return d < todayStart;
  };

  const isTaskUpcoming = (task: LeadTask) => {
    if (task.is_completed) return false;
    const d = new Date(task.due_date);
    return d > todayEnd;
  };

  // Helper to extract YYYY-MM-DD
  const getDateKey = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Compute metrics
  const todayTasks = tasks.filter((t) => !t.is_completed && isTaskToday(t.due_date));
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t));
  const upcomingTasks = tasks.filter((t) => isTaskUpcoming(t));
  const completedTasks = tasks.filter((t) => t.is_completed);

  // Filter tasks based on selected tab and search query for main page
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterTab === 'today') {
        if (t.is_completed || !isTaskToday(t.due_date)) return false;
      } else if (filterTab === 'overdue') {
        if (!isTaskOverdue(t)) return false;
      } else if (filterTab === 'upcoming') {
        if (!isTaskUpcoming(t)) return false;
      } else if (filterTab === 'completed') {
        if (!t.is_completed) return false;
      }

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(q) ||
        (t.lead?.business_name && t.lead.business_name.toLowerCase().includes(q));

      return matchesSearch;
    });
  }, [tasks, filterTab, searchQuery]);

  // Group filtered tasks by Date for Timeline View
  const timelineGroups = useMemo(() => {
    const sorted = [...filteredTasks].sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );

    const groups: { [key: string]: { dateStr: string; label: string; tasks: typeof filteredTasks } } = {};

    sorted.forEach((task) => {
      const d = new Date(task.due_date);
      const key = getDateKey(d);

      if (!groups[key]) {
        let label = d.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        const todayKey = getDateKey(now);
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowKey = getDateKey(tomorrow);

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayKey = getDateKey(yesterday);

        if (key === todayKey) {
          label = `Hari Ini • ${label}`;
        } else if (key === tomorrowKey) {
          label = `Besok • ${label}`;
        } else if (key === yesterdayKey) {
          label = `Kemarin • ${label}`;
        }

        groups[key] = {
          dateStr: key,
          label,
          tasks: [],
        };
      }

      groups[key].tasks.push(task);
    });

    return Object.values(groups);
  }, [filteredTasks]);

  // Calendar calculations
  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();

  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1);
    const lastDayOfMonth = new Date(calendarYear, calendarMonth + 1, 0);
    const numDays = lastDayOfMonth.getDate();

    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const prevMonthLastDay = new Date(calendarYear, calendarMonth, 0).getDate();
    const cells: Array<{
      date: Date;
      dateKey: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      tasks: typeof tasks;
    }> = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(calendarYear, calendarMonth - 1, prevMonthLastDay - i);
      const key = getDateKey(d);
      cells.push({
        date: d,
        dateKey: key,
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: key === getDateKey(now),
        tasks: tasks.filter((t) => getDateKey(t.due_date) === key),
      });
    }

    for (let day = 1; day <= numDays; day++) {
      const d = new Date(calendarYear, calendarMonth, day);
      const key = getDateKey(d);
      cells.push({
        date: d,
        dateKey: key,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: key === getDateKey(now),
        tasks: tasks.filter((t) => getDateKey(t.due_date) === key),
      });
    }

    const totalCells = cells.length <= 35 ? 35 : 42;
    const remaining = totalCells - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(calendarYear, calendarMonth + 1, day);
      const key = getDateKey(d);
      cells.push({
        date: d,
        dateKey: key,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: key === getDateKey(now),
        tasks: tasks.filter((t) => getDateKey(t.due_date) === key),
      });
    }

    return cells;
  }, [calendarYear, calendarMonth, tasks]);

  const prevMonth = () => {
    setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1));
  };

  const nextMonth = () => {
    setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1));
  };

  const jumpToToday = () => {
    const todayKey = getDateKey(new Date());
    setCalendarDate(new Date());
    setSelectedCalendarDay(todayKey);
  };

  const monthName = calendarDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  // Selected calendar day tasks for Modal Popup (with sub-filtering & live search)
  const rawDayTasks = useMemo(() => {
    if (!selectedCalendarDay) return [];
    return tasks
      .filter((t) => getDateKey(t.due_date) === selectedCalendarDay)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [tasks, selectedCalendarDay]);

  const filteredDayTasks = useMemo(() => {
    return rawDayTasks.filter((t) => {
      if (dayModalFilter === 'pending' && t.is_completed) return false;
      if (dayModalFilter === 'completed' && !t.is_completed) return false;

      if (dayModalSearch.trim()) {
        const q = dayModalSearch.toLowerCase();
        const matches = 
          t.title.toLowerCase().includes(q) ||
          (t.lead?.business_name && t.lead.business_name.toLowerCase().includes(q)) ||
          (t.lead?.address && t.lead.address.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [rawDayTasks, dayModalFilter, dayModalSearch]);

  const selectedDayDateObj = useMemo(() => {
    if (!selectedCalendarDay) return null;
    return new Date(selectedCalendarDay + 'T00:00:00');
  }, [selectedCalendarDay]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#f59e0b]" />
              Agenda Follow-Up CRM
            </span>
            <span className="text-xs text-slate-500">
              Worrie.id &bull; Pipeline Engagement
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Agenda &amp; Jadwal Follow-Up
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pastikan tidak ada panggilan telepon, demo bootcamp, atau pengiriman proposal yang terlewat.
          </p>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Segmented View Switcher: List | Timeline | Calendar */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 shadow-2xs">
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#004a87] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Daftar (List)"
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-[#004a87] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Kronologis (Timeline)"
            >
              <Milestone className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white text-[#004a87] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Kalender Bulanan"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Kalender</span>
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer active:scale-95"
            title="Muat ulang agenda"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setTaskDueDate('');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            + Tambah Jadwal Follow-Up
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setFilterTab('today')}
          className={`p-5 rounded-2xl bg-white border text-left transition-all shadow-xs cursor-pointer interactive-card ${
            filterTab === 'today' ? 'border-[#004a87] ring-2 ring-[#004a87]/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tugas Hari Ini</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#004a87]">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#004a87] mt-2">{todayTasks.length}</p>
          <p className="text-xs text-slate-500 mt-1">Harus diselesaikan hari ini</p>
        </button>

        <button
          onClick={() => setFilterTab('overdue')}
          className={`p-5 rounded-2xl bg-white border text-left transition-all shadow-xs cursor-pointer interactive-card ${
            filterTab === 'overdue' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Terlewat (Overdue)</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-600 mt-2">{overdueTasks.length}</p>
          <p className="text-xs text-slate-500 mt-1">Melebihi tenggat waktu</p>
        </button>

        <button
          onClick={() => setFilterTab('upcoming')}
          className={`p-5 rounded-2xl bg-white border text-left transition-all shadow-xs cursor-pointer interactive-card ${
            filterTab === 'upcoming' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mendatang</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{upcomingTasks.length}</p>
          <p className="text-xs text-slate-500 mt-1">Jadwal follow-up besok &amp; seterusnya</p>
        </button>

        <button
          onClick={() => setFilterTab('completed')}
          className={`p-5 rounded-2xl bg-white border text-left transition-all shadow-xs cursor-pointer interactive-card ${
            filterTab === 'completed' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Telah Selesai</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">{completedTasks.length}</p>
          <p className="text-xs text-slate-500 mt-1">Follow-up tuntas</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Semua Agenda', count: tasks.length },
            { id: 'today', label: 'Hari Ini', count: todayTasks.length },
            { id: 'overdue', label: 'Terlewat', count: overdueTasks.length },
            { id: 'upcoming', label: 'Mendatang', count: upcomingTasks.length },
            { id: 'completed', label: 'Selesai', count: completedTasks.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                filterTab === tab.id
                  ? 'bg-[#004a87] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari agenda atau nama institusi..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87] transition-all"
          />
        </div>
      </div>

      {/* =========================================================================
          VIEW MODE 1: LIST VIEW
      ========================================================================== */}
      {viewMode === 'list' && (
        <div className="animate-card-slide-slow rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#004a87] mb-3" />
              <p className="text-xs font-semibold">Memuat agenda follow-up...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CalendarCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-800">Tidak Ada Agenda Follow-Up</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {searchQuery || filterTab !== 'all'
                  ? 'Tidak ada agenda yang cocok dengan kriteria filter Anda.'
                  : 'Belum ada agenda follow-up yang dijadwalkan. Klik tombol "+ Tambah Jadwal Follow-Up" untuk mulai membuat janji temu atau reminder pesan.'}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-[#004a87] text-white text-xs font-bold hover:bg-[#003866] transition-all cursor-pointer active:scale-95"
              >
                + Buat Jadwal Sekarang
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTasks.map((task) => {
                const isOverdue = isTaskOverdue(task);
                const isToday = isTaskToday(task.due_date);
                const dueObj = new Date(task.due_date);

                return (
                  <div
                    key={task.id}
                    onClick={() => navigateToLead(task.lead?.id)}
                    className={`list-item-standard p-4 sm:p-5 flex items-start justify-between gap-4 transition-all hover:bg-blue-50/50 hover:translate-x-1 cursor-pointer group ${
                      task.is_completed ? 'bg-slate-50/40 opacity-75' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <button
                        onClick={(e) => handleToggleTask(task, e)}
                        disabled={togglingId === task.id}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90 ${
                          task.is_completed
                            ? 'bg-emerald-600 border-emerald-600 text-white animate-check-pop'
                            : 'border-slate-300 hover:border-[#004a87] bg-white group-hover:border-[#004a87]'
                        }`}
                        title={task.is_completed ? 'Tandai belum selesai' : 'Tandai selesai'}
                      >
                        {task.is_completed && <CheckSquare className="w-3.5 h-3.5" />}
                      </button>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-bold text-sm group-hover:text-[#004a87] transition-colors ${
                              task.is_completed
                                ? 'line-through text-slate-400'
                                : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </span>

                          {task.is_completed ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Selesai
                            </span>
                          ) : isOverdue ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Terlewat
                            </span>
                          ) : isToday ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#004a87] border border-blue-200">
                              Hari Ini
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                          {task.lead && (
                            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-[#004a87]" />
                              <span className="underline decoration-slate-300 underline-offset-2">{task.lead.business_name}</span>
                              {task.lead.status && (
                                <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-slate-100 text-slate-600 font-medium border border-slate-200">
                                  {task.lead.status}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {dueObj.toLocaleDateString('id-ID', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                              {' • '}
                              {dueObj.toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })} WIB
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {task.lead?.phone && (
                        <a
                          href={`https://wa.me/${task.lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Halo ${task.lead.business_name}, salam hangat dari tim Worrie.id. Izin menindaklanjuti terkait agenda: ${task.title}. Apakah sekarang berkenan untuk berdiskusi sebentar?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all shadow-2xs hover:scale-105 active:scale-95"
                          title="Hubungi via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}

                      {task.lead && (
                        <Link
                          href={`/crm/${task.lead.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#004a87] hover:text-white text-slate-700 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                          title="Buka Halaman 360° Lead"
                        >
                          <span>Detail Lead</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      <button
                        onClick={(e) => handleDeleteTask(task.id, e)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer active:scale-95"
                        title="Hapus Agenda"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: TIMELINE VIEW
      ========================================================================== */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#004a87] mb-3" />
              <p className="text-xs font-semibold">Menyusun kronologi timeline...</p>
            </div>
          ) : timelineGroups.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              <Milestone className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-800">Tidak Ada Agenda di Timeline</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {searchQuery || filterTab !== 'all'
                  ? 'Tidak ada agenda yang cocok dengan filter yang dipilih.'
                  : 'Belum ada agenda follow-up yang dijadwalkan.'}
              </p>
            </div>
          ) : (
            timelineGroups.map((group) => (
              <div key={group.dateStr} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-xl bg-blue-50 text-[#004a87] border border-blue-200 text-xs font-extrabold flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{group.label}</span>
                  </div>
                  <div className="flex-1 border-t border-slate-200" />
                  <span className="text-xs text-slate-400 font-semibold">
                    {group.tasks.length} Agenda
                  </span>
                </div>

                <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {group.tasks.map((task) => {
                    const isOverdue = isTaskOverdue(task);
                    const dueObj = new Date(task.due_date);

                    return (
                      <div key={task.id} className="relative group">
                        <div
                          className={`absolute -left-6 sm:-left-8 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all bg-white z-10 ${
                            task.is_completed
                              ? 'border-emerald-600 text-emerald-600'
                              : isOverdue
                              ? 'border-rose-500 text-rose-500'
                              : 'border-[#004a87] text-[#004a87]'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              task.is_completed
                                ? 'bg-emerald-600'
                                : isOverdue
                                ? 'bg-rose-500 animate-pulse'
                                : 'bg-[#004a87]'
                            }`}
                          />
                        </div>

                        <div
                          onClick={() => navigateToLead(task.lead?.id)}
                          className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all shadow-2xs hover:shadow-md hover:border-[#004a87] cursor-pointer interactive-card ${
                            task.is_completed
                              ? 'border-slate-200 bg-slate-50/50 opacity-80'
                              : isOverdue
                              ? 'border-rose-200 hover:border-rose-400'
                              : 'border-slate-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-slate-100 text-slate-700 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#004a87]" />
                                  {dueObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                </span>

                                {task.is_completed ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Selesai
                                  </span>
                                ) : isOverdue ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Terlewat
                                  </span>
                                ) : null}
                              </div>

                              <h3
                                className={`text-sm font-extrabold group-hover:text-[#004a87] transition-colors ${
                                  task.is_completed ? 'line-through text-slate-400' : 'text-slate-900'
                                }`}
                              >
                                {task.title}
                              </h3>

                              {task.lead && (
                                <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                                  <Building2 className="w-3.5 h-3.5 text-[#004a87]" />
                                  <span className="font-bold text-slate-800">{task.lead.business_name}</span>
                                  {task.lead.status && (
                                    <span className="px-2 py-0.2 rounded-full text-[10px] bg-blue-50 text-[#004a87] border border-blue-200 font-semibold">
                                      {task.lead.status}
                                    </span>
                                  )}
                                  {task.lead.address && (
                                    <span className="text-slate-400 truncate max-w-xs">• {task.lead.address}</span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => handleToggleTask(task, e)}
                                disabled={togglingId === task.id}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                                  task.is_completed
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : 'bg-white text-slate-700 border-slate-300 hover:border-[#004a87]'
                                }`}
                              >
                                <CheckSquare className="w-3.5 h-3.5" />
                                <span>{task.is_completed ? 'Selesai' : 'Tandai Selesai'}</span>
                              </button>

                              {task.lead?.phone && (
                                <a
                                  href={`https://wa.me/${task.lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                    `Halo ${task.lead.business_name}, salam hangat dari tim Worrie.id. Izin menindaklanjuti terkait agenda: ${task.title}. Apakah sekarang berkenan untuk berdiskusi sebentar?`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all shadow-2xs hover:scale-105 active:scale-95"
                                  title="Chat WhatsApp"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              )}

                              {task.lead && (
                                <Link
                                  href={`/crm/${task.lead.id}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95"
                                >
                                  <span>Buka Lead</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 3: CALENDAR VIEW
      ========================================================================== */}
      {viewMode === 'calendar' && (
        <div className="space-y-5">
          {/* Calendar Controls & Navigation Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer active:scale-90"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 min-w-[170px] text-center capitalize">
                {monthName}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer active:scale-90"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={jumpToToday}
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#004a87] hover:bg-blue-100 text-xs font-bold border border-blue-200 transition-all cursor-pointer active:scale-95"
              >
                Hari Ini
              </button>
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 pl-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#004a87]" /> Agenda Mendatang
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Terlewat
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Selesai
                </span>
              </div>
            </div>
          </div>

          {/* Calendar Grid with Interactive Day Cells */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-bold text-slate-600">
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((d) => (
                <div key={d} className="py-2.5 border-r last:border-r-0 border-slate-200">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-y divide-slate-200">
              {calendarGrid.map((cell, idx) => {
                const isSelected = selectedCalendarDay === cell.dateKey;
                const taskCount = cell.tasks.length;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedCalendarDay(cell.dateKey);
                      setDayModalFilter('all');
                      setDayModalSearch('');
                    }}
                    className={`min-h-[115px] sm:min-h-[135px] p-2 flex flex-col justify-between cursor-pointer group calendar-day-cell relative ${
                      !cell.isCurrentMonth
                        ? 'bg-slate-50/40 text-slate-400'
                        : isSelected
                        ? 'bg-blue-50/50 ring-2 ring-inset ring-[#004a87]'
                        : 'bg-white hover:bg-blue-50/25 text-slate-900'
                    }`}
                  >
                    {/* Top Row: Date number & indicator */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full transition-all group-hover:scale-110 ${
                          cell.isToday
                            ? 'bg-[#004a87] text-white shadow-2xs font-extrabold ring-2 ring-[#004a87]/30'
                            : 'text-slate-700 group-hover:text-[#004a87]'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {taskCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#004a87] text-white shadow-2xs group-hover:scale-105 transition-transform">
                          {taskCount}
                        </span>
                      )}
                    </div>

                    {/* Task Preview Pills */}
                    <div className="space-y-1 flex-1 overflow-hidden">
                      {cell.tasks.slice(0, 2).map((task) => {
                        const isOverdue = isTaskOverdue(task);

                        return (
                          <div
                            key={task.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCalendarDay(cell.dateKey);
                            }}
                            className={`p-1 rounded-md text-[10px] font-semibold border truncate transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-1 ${
                              task.is_completed
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 line-through opacity-75'
                                : isOverdue
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-blue-50 text-[#004a87] border-blue-200'
                            }`}
                            title={task.title}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                task.is_completed
                                  ? 'bg-emerald-600'
                                  : isOverdue
                                  ? 'bg-rose-500'
                                  : 'bg-[#004a87]'
                              }`}
                            />
                            <span className="truncate font-bold">
                              {task.lead?.business_name || task.title}
                            </span>
                          </div>
                        );
                      })}

                      {taskCount > 2 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCalendarDay(cell.dateKey);
                          }}
                          className="w-full text-left text-[10px] font-extrabold text-[#004a87] hover:underline pl-1 pt-0.5 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>+{taskCount - 2} agenda lainnya &rarr;</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =========================================================================
              MODAL POPUP: MULTI-LIST AGENDA HARIAN (CARD ANIMASI INTERAKTIF & FILTER)
          ========================================================================== */}
          {selectedCalendarDay && selectedDayDateObj && (
            <div 
              role="dialog"
              aria-modal="true"
              aria-labelledby="calendar-day-modal-title"
              onClick={() => setSelectedCalendarDay(null)}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-backdrop-in"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-modal-pop"
              >
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-50/60 via-white to-amber-50/30 flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#004a87] text-white flex items-center justify-center shadow-md animate-float">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 id="calendar-day-modal-title" className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                        {selectedDayDateObj.toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-bold text-[#004a87] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                          {rawDayTasks.length} Agenda Total
                        </span>
                        <span>&bull;</span>
                        <span className="text-emerald-700 font-semibold">
                          {rawDayTasks.filter(t => t.is_completed).length} Selesai
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openAddTaskForDate(selectedCalendarDay)}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Buat Agenda</span>
                    </button>
                    <button
                      onClick={() => setSelectedCalendarDay(null)}
                      className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs font-bold border border-slate-200 transition-all cursor-pointer shadow-2xs active:scale-90"
                      title="Tutup (Esc)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Interactive Sub-Filter & Live Search Bar */}
                {rawDayTasks.length > 0 && (
                  <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {[
                        { id: 'all', label: 'Semua', count: rawDayTasks.length },
                        { id: 'pending', label: 'Perlu Follow-Up', count: rawDayTasks.filter(t => !t.is_completed).length },
                        { id: 'completed', label: 'Tuntas', count: rawDayTasks.filter(t => t.is_completed).length },
                      ].map((subTab) => (
                        <button
                          key={subTab.id}
                          onClick={() => setDayModalFilter(subTab.id as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                            dayModalFilter === subTab.id
                              ? 'bg-[#004a87] text-white shadow-2xs'
                              : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                          }`}
                        >
                          <span>{subTab.label}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            dayModalFilter === subTab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {subTab.count}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Quick Search */}
                    {rawDayTasks.length >= 2 && (
                      <div className="relative w-full sm:w-48">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={dayModalSearch}
                          onChange={(e) => setDayModalSearch(e.target.value)}
                          placeholder="Cari di tanggal ini..."
                          className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#004a87]"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Modal Body: Multi-list of Animated Interactive Cards */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 flex-1 divide-y divide-slate-100">
                  {filteredDayTasks.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <CalendarCheck className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        {dayModalSearch || dayModalFilter !== 'all'
                          ? 'Tidak ada agenda yang cocok dengan filter.'
                          : 'Belum Ada Agenda di Tanggal Ini'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Jadwalkan follow-up, presentasi proposal, atau reminder telepon untuk prospek sekolah di tanggal ini.
                      </p>
                      <button
                        onClick={() => openAddTaskForDate(selectedCalendarDay)}
                        className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-[#004a87] text-white text-xs font-bold hover:bg-[#003866] transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Jadwalkan Agenda Sekarang</span>
                      </button>
                    </div>
                  ) : (
                    filteredDayTasks.map((task, idx) => {
                      const isOverdue = isTaskOverdue(task);
                      const dueObj = new Date(task.due_date);
                      const isExpanded = expandedTaskId === task.id;

                      return (
                        <div
                          key={task.id}
                          onClick={() => navigateToLead(task.lead?.id)}
                          style={{ animationDelay: `${idx * 55}ms` }}
                          className={`pt-3.5 first:pt-0 group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer animate-card-slide interactive-card ${
                            task.is_completed
                              ? 'bg-slate-50/70 border-slate-200 opacity-80'
                              : isOverdue
                              ? 'bg-rose-50/25 border-rose-200 hover:border-rose-400 border-l-4 border-l-rose-500'
                              : 'bg-white border-slate-200 hover:border-[#004a87] border-l-4 border-l-[#004a87]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Left Section: Checkbox, Title, Details */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <button
                                onClick={(e) => handleToggleTask(task, e)}
                                disabled={togglingId === task.id}
                                className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90 ${
                                  task.is_completed
                                    ? 'bg-emerald-600 border-emerald-600 text-white animate-check-pop'
                                    : 'border-slate-300 hover:border-[#004a87] bg-white group-hover:border-[#004a87]'
                                }`}
                                title={task.is_completed ? 'Tandai belum selesai' : 'Tandai selesai'}
                              >
                                {task.is_completed && <CheckSquare className="w-3.5 h-3.5" />}
                              </button>

                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Time Badge */}
                                  <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-50 text-[#004a87] border border-blue-200/60 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {dueObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                  </span>

                                  {/* Status Pills */}
                                  {task.is_completed ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      ✓ Selesai
                                    </span>
                                  ) : isOverdue ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Terlewat
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                      Agenda Aktif
                                    </span>
                                  )}
                                </div>

                                {/* Task Title */}
                                <h3
                                  className={`text-sm font-extrabold group-hover:text-[#004a87] transition-colors ${
                                    task.is_completed ? 'line-through text-slate-400' : 'text-slate-900'
                                  }`}
                                >
                                  {task.title}
                                </h3>

                                {/* Lead info */}
                                {task.lead && (
                                  <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap pt-0.5">
                                    <Building2 className="w-3.5 h-3.5 text-[#004a87]" />
                                    <span className="font-bold text-slate-800 group-hover:underline">{task.lead.business_name}</span>
                                    {task.lead.status && (
                                      <span className="px-2 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                                        Tahap: {task.lead.status}
                                      </span>
                                    )}
                                    {task.lead.address && (
                                      <span className="text-slate-400 truncate max-w-xs flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-slate-400" />
                                        {task.lead.address}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right Section: Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0" onClick={(e) => e.stopPropagation()}>
                              {task.lead?.phone && (
                                <a
                                  href={`https://wa.me/${task.lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                    `Halo ${task.lead.business_name}, salam hangat dari tim Worrie.id. Izin menindaklanjuti terkait agenda: ${task.title}. Apakah sekarang berkenan untuk berdiskusi sebentar?`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all shadow-2xs flex items-center gap-1 text-xs font-bold hover:scale-105 active:scale-95"
                                  title="Hubungi via WhatsApp"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  <span className="hidden md:inline">WhatsApp</span>
                                </a>
                              )}

                              {task.lead && (
                                <Link
                                  href={`/crm/${task.lead.id}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white text-xs font-bold transition-all shadow-xs hover:scale-105 active:scale-95"
                                >
                                  <span>Detail Lead</span>
                                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                              )}

                              <button
                                onClick={(e) => handleDeleteTask(task.id, e)}
                                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer active:scale-90"
                                title="Hapus Agenda"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Modal Footer with quick CTA */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
                  <div className="text-xs text-slate-500 font-medium">
                    Menampilkan <span className="font-bold text-slate-800">{filteredDayTasks.length}</span> dari {rawDayTasks.length} agenda
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openAddTaskForDate(selectedCalendarDay)}
                      className="px-3.5 py-2 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Agenda</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCalendarDay(null)}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all cursor-pointer active:scale-95"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL TAMBAH JADWAL FOLLOW-UP
      ========================================================================== */}
      {isModalOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-backdrop-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-modal-pop"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#004a87]">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Jadwalkan Follow-Up Baru
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-500 text-xs font-bold transition-all cursor-pointer active:scale-90"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Mitra / Prospek Sekolah
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87] transition-all"
                  required
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.business_name} ({l.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Aktivitas / Judul Agenda Follow-Up
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Contoh: Telepon Kepala Sekolah terkait proposal MoU"
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tenggat Waktu &amp; Jam
                </label>
                <input
                  type="datetime-local"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87] transition-all"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingTask}
                  className="px-4 py-2 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  {savingTask ? 'Menyimpan...' : 'Simpan Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
