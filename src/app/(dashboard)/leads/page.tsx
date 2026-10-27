'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Search,
  Plus,
  Download,
  RefreshCw,
  Phone,
  ExternalLink,
  Star,
  Trash2,
  UserCheck,
  Calendar,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  DollarSign,
  Globe,
  MapPin,
  Sparkles,
  ChevronDown,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
  Upload,
  FileUp,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { DataStore } from '@/lib/dataStore';
import { Lead, UserProfile, LeadStatus } from '@/types/database';
import { useAuth } from '@/lib/authContext';
import { SearchablePicSelect } from '@/components/SearchableSelect';
import PromotionalKitModal from '@/components/PromotionalKitModal';

export default function LeadsPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [picFilter, setPicFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'deal_high' | 'rating_high'>('newest');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [savingLead, setSavingLead] = useState(false);

  // Promotional Kit Modal State
  const [promoLead, setPromoLead] = useState<Lead | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Bulk Excel/CSV Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importFileError, setImportFileError] = useState<string | null>(null);
  const [parsedLeads, setParsedLeads] = useState<Array<{
    business_name: string;
    address: string;
    phone: string;
    status: LeadStatus;
    deal_value: number;
    assigned_to?: string;
    notes?: string;
  }>>([]);
  const [defaultImportPic, setDefaultImportPic] = useState<string>('');

  // Form State for New Lead
  const [formBusinessName, setFormBusinessName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState<LeadStatus>('Belum dihubungi');
  const [formDealValue, setFormDealValue] = useState<number>(0);
  const [formAssignedTo, setFormAssignedTo] = useState('');
  const [formWebsiteUrl, setFormWebsiteUrl] = useState('');
  const [formRating, setFormRating] = useState<number>(4.8);
  const [formNotes, setFormNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsData, membersData] = await Promise.all([
        DataStore.getLeads(),
        DataStore.getTeamMembers(),
      ]);
      setLeads(leadsData);
      setTeamMembers(membersData);
    } catch (err) {
      console.error('Failed to load leads data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (profile?.full_name) {
      if (!formAssignedTo) setFormAssignedTo(profile.full_name);
      if (!defaultImportPic) setDefaultImportPic(profile.full_name);
    }
  }, [profile]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBusinessName.trim() || !formPhone.trim() || !formAddress.trim()) {
      alert('Mohon lengkapi Nama Sekolah, Alamat, dan Nomor Telepon.');
      return;
    }

    setSavingLead(true);
    try {
      const actorName = profile?.full_name || 'Tim Sales Worrie';
      const created = await DataStore.createLead({
        business_name: formBusinessName.trim(),
        address: formAddress.trim(),
        phone: formPhone.trim(),
        primary_phone: formPhone.trim(),
        rating: Number(formRating) || 4.5,
        reviews_count: 10,
        has_website: Boolean(formWebsiteUrl.trim()),
        website_url: formWebsiteUrl.trim() || null,
        gmaps_url: null,
        status: formStatus,
        deal_value: Number(formDealValue) || 0,
        assigned_to: formAssignedTo || profile?.full_name || null,
        notes: formNotes.trim() || 'Lead ditambahkan secara manual ke database.',
      }, actorName);

      if (created) {
        // Reset form (pertahankan default PIC ke diri sendiri)
        setFormBusinessName('');
        setFormAddress('');
        setFormPhone('');
        setFormStatus('Belum dihubungi');
        setFormDealValue(0);
        setFormAssignedTo(profile?.full_name || '');
        setFormWebsiteUrl('');
        setFormNotes('');
        setIsAddModalOpen(false);
        await loadData();
      }
    } catch (err) {
      console.error('Failed to create lead', err);
      alert('Gagal menambahkan Lead baru.');
    } finally {
      setSavingLead(false);
    }
  };

  const handleDeleteLead = async (leadId: string, leadName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Hapus data lead "${leadName}" dari database? Data aktivitas terkait juga akan dihapus.`)) {
      return;
    }

    try {
      await DataStore.deleteLead(leadId);
      await loadData();
    } catch (err) {
      console.error('Failed to delete lead', err);
      alert('Gagal menghapus lead.');
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (filteredLeads.length === 0) {
      alert('Tidak ada data leads untuk diekspor.');
      return;
    }

    const rows = filteredLeads.map((l, idx) => ({
      'No': idx + 1,
      'Nama Sekolah / Instansi': l.business_name,
      'Alamat': l.address,
      'No Telepon / WhatsApp': l.phone || l.primary_phone || '-',
      'Status Pipeline': l.status,
      'PIC Marketing': l.assigned_to || 'Belum ada PIC',
      'Nilai Potensi Deal (IDR)': l.deal_value || 0,
      'Rating G-Maps': l.rating || 0,
      'Jumlah Review': l.reviews_count || 0,
      'Website': l.website_url || '-',
      'Janji Follow-Up': l.next_action_at ? new Date(l.next_action_at).toLocaleString('id-ID') : '-',
      'Catatan': l.notes || '-',
      'Tanggal Input': new Date(l.created_at).toLocaleDateString('id-ID'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Database Leads');

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Worrie_Leads_Database_${dateStr}.xlsx`);
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        'Nama Sekolah / Instansi *': 'SMK Negeri 1 Jakarta',
        'Alamat Lengkap *': 'Jl. Budi Utomo No. 7, Sawah Besar, Jakarta Pusat',
        'No Telepon / WhatsApp *': '081234567890',
        'Status Pipeline': 'Belum dihubungi',
        'Nilai Potensi Deal (IDR)': 15000000,
        'PIC Marketing': 'Asep Gustiawan',
        'Catatan': 'Peluang kerjasama bootcamp digital remote work siswa RPL'
      },
      {
        'Nama Sekolah / Instansi *': 'Universitas Bina Mandiri',
        'Alamat Lengkap *': 'Jl. Kebon Jeruk No. 12, Jakarta Barat',
        'No Telepon / WhatsApp *': '081987654321',
        'Status Pipeline': 'Dihubungi',
        'Nilai Potensi Deal (IDR)': 25000000,
        'PIC Marketing': 'Budi Santoso',
        'Catatan': 'MoU penyaluran magang mahasiswa internasional'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Impor Lead');
    XLSX.writeFile(wb, 'Template_Impor_Leads_Worrie.xlsx');
  };

  // Handle Upload and Parse File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileError(null);
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          setImportFileError('File kosong atau format spreadsheet tidak sesuai.');
          setParsedLeads([]);
          return;
        }

        const mapped: typeof parsedLeads = [];
        data.forEach((row) => {
          const name =
            row['Nama Sekolah / Instansi *'] ||
            row['Nama Sekolah / Instansi'] ||
            row['Nama Sekolah'] ||
            row['Nama Instansi'] ||
            row['Nama'] ||
            row['business_name'] ||
            '';
          const address =
            row['Alamat Lengkap *'] ||
            row['Alamat Lengkap'] ||
            row['Alamat'] ||
            row['address'] ||
            '';
          const phone = String(
            row['No Telepon / WhatsApp *'] ||
            row['No Telepon / WhatsApp'] ||
            row['No Telepon'] ||
            row['Telepon'] ||
            row['phone'] ||
            row['WhatsApp'] ||
            ''
          );
          const status = (row['Status Pipeline'] || row['Status'] || 'Belum dihubungi') as LeadStatus;
          const deal_value = Number(
            row['Nilai Potensi Deal (IDR)'] ||
            row['Nilai Potensi Deal'] ||
            row['deal_value'] ||
            row['Nilai Deal'] ||
            0
          );
          const assigned_to = row['PIC Marketing'] || row['assigned_to'] || '';
          const notes = row['Catatan'] || row['notes'] || '';

          if (String(name).trim() && String(phone).trim()) {
            mapped.push({
              business_name: String(name).trim(),
              address: String(address).trim() || 'Indonesia',
              phone: String(phone).trim(),
              status: ['Belum dihubungi', 'Dihubungi', 'Follow Up', 'Quotation', 'Closing', 'Ditolak'].includes(status)
                ? status
                : 'Belum dihubungi',
              deal_value: isNaN(deal_value) ? 0 : deal_value,
              assigned_to: String(assigned_to).trim() || undefined,
              notes: String(notes).trim() || 'Diimpor secara massal dari file spreadsheet'
            });
          }
        });

        if (mapped.length === 0) {
          setImportFileError('Tidak ditemukan baris data yang memiliki Nama dan No Telepon valid.');
        }

        setParsedLeads(mapped);
      } catch (err) {
        console.error('Error parsing excel:', err);
        setImportFileError('Gagal membaca file Excel/CSV. Pastikan format file valid (.xlsx atau .csv).');
        setParsedLeads([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Execute Bulk Insertion
  const handleExecuteImport = async () => {
    if (parsedLeads.length === 0) return;
    setImporting(true);

    const actorName = profile?.full_name || 'Tim Sales Worrie';
    try {
      for (const item of parsedLeads) {
        await DataStore.createLead(
          {
            business_name: item.business_name,
            address: item.address,
            phone: item.phone,
            primary_phone: item.phone,
            status: item.status,
            deal_value: item.deal_value,
            assigned_to: item.assigned_to || defaultImportPic || profile?.full_name || null,
            rating: 4.8,
            reviews_count: 5,
            notes: item.notes || 'Diimpor massal via Excel/CSV',
          },
          actorName
        );
      }

      alert(`Sukses! Sebanyak ${parsedLeads.length} leads berhasil diimpor ke database.`);
      setIsImportModalOpen(false);
      setParsedLeads([]);
      setImportFileName('');
      await loadData();
    } catch (err) {
      console.error('Error importing leads:', err);
      alert('Terjadi kesalahan saat mengimpor data leads.');
    } finally {
      setImporting(false);
    }
  };

  // Status List options
  const statusOptions = [
    { id: 'all', label: 'Semua Status' },
    { id: 'Belum dihubungi', label: 'Prospek Baru' },
    { id: 'Dihubungi', label: 'Dihubungi' },
    { id: 'Follow Up', label: 'Follow Up' },
    { id: 'Quotation', label: 'Quotation / Penawaran' },
    { id: 'Closing', label: 'Deal Menang (Won)' },
    { id: 'Ditolak', label: 'Ditolak (Lost)' },
  ];

  // Filter & Sort Logic
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      // Status filter
      if (statusFilter !== 'all' && l.status !== statusFilter) {
        return false;
      }

      // PIC filter
      if (picFilter !== 'all') {
        if (picFilter === 'unassigned') {
          if (l.assigned_to) return false;
        } else if (l.assigned_to !== picFilter) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          l.business_name.toLowerCase().includes(q) ||
          (l.address && l.address.toLowerCase().includes(q)) ||
          (l.phone && l.phone.toLowerCase().includes(q)) ||
          (l.assigned_to && l.assigned_to.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') {
        return a.business_name.localeCompare(b.business_name);
      }
      if (sortBy === 'deal_high') {
        return (b.deal_value || 0) - (a.deal_value || 0);
      }
      if (sortBy === 'rating_high') {
        return (b.rating || 0) - (a.rating || 0);
      }
      // default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [leads, statusFilter, picFilter, searchQuery, sortBy]);

  // Aggregate Metrics
  const totalDealValue = useMemo(() => {
    return leads.reduce((acc, curr) => acc + (curr.deal_value || 0), 0);
  }, [leads]);

  const followUpTodayCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return leads.filter((l) => l.next_action_at && l.next_action_at.startsWith(today)).length;
  }, [leads]);

  const wonDealsCount = useMemo(() => {
    return leads.filter((l) => l.status === 'Closing').length;
  }, [leads]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#004a87] border border-blue-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#004a87]" />
              Database Prospek Sekolah
            </span>
            <span className="text-xs text-slate-500">
              Worrie.id &bull; Centralized Leads Directory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Database Leads &amp; Calon Mitra
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola seluruh data sekolah, universitas, dan institusi pendidikan yang siap ditindaklanjuti tim marketing.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-all cursor-pointer active:scale-95"
            title="Muat ulang data leads"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-all cursor-pointer active:scale-95"
            title="Ekspor ke spreadsheet Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-all cursor-pointer active:scale-95"
            title="Impor prospek massal dari spreadsheet Excel / CSV"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Impor Excel</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white font-bold text-xs shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Lead Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs interactive-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Leads Terdaftar</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#004a87]">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{leads.length}</p>
          <p className="text-xs text-slate-500 mt-1">Institusi dalam database</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs interactive-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Potensi Nilai Deal</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">
            Rp {(totalDealValue / 1000000).toLocaleString('id-ID')} Jt
          </p>
          <p className="text-xs text-slate-500 mt-1">Estimasi nilai kerjasama</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs interactive-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kerjasama Berhasil (Won)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-[#d97706]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{wonDealsCount}</p>
          <p className="text-xs text-slate-500 mt-1">MoU resmi telah ditandatangani</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs interactive-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Follow-Up Hari Ini</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#004a87]">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#004a87] mt-2">{followUpTodayCount}</p>
          <p className="text-xs text-slate-500 mt-1">Janji follow-up jatuh tempo hari ini</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statusOptions.map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${statusFilter === st.id
                  ? 'bg-[#004a87] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Secondary Filter Row: Search, PIC, Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama sekolah, alamat, kota, atau nomor WA..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87] transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Standardized Searchable PIC Marketing Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-500">PIC:</span>
              <SearchablePicSelect
                value={picFilter === 'all' || picFilter === 'unassigned' ? '' : picFilter}
                onChange={(val) => setPicFilter(val ? val : 'all')}
                teamMembers={teamMembers}
                compact={true}
                placeholder="Semua Tim"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="newest">Terbaru Ditambahkan</option>
                <option value="name">Nama Sekolah (A - Z)</option>
                <option value="deal_high">Nilai Deal Tertinggi</option>
                <option value="rating_high">Rating G-Maps Tertinggi</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="animate-card-slide-slow rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#004a87] mb-3" />
            <p className="text-xs font-semibold">Memuat data leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-800">Tidak Ada Data Leads</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || picFilter !== 'all'
                ? 'Tidak ada leads yang cocok dengan kriteria pencarian dan filter Anda.'
                : 'Belum ada lead dalam database. Anda dapat menambahkan lead secara manual atau mengonversi dari hasil scraping Google Maps.'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-[#004a87] text-white text-xs font-bold hover:bg-[#003866] transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Lead Baru</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Instansi / Sekolah</th>
                  <th className="py-3.5 px-4 font-bold">Kontak &amp; WhatsApp</th>
                  <th className="py-3.5 px-4 font-bold">Status Pipeline</th>
                  <th className="py-3.5 px-4 font-bold">PIC Marketing</th>
                  <th className="py-3.5 px-4 font-bold text-right">Potensi Deal</th>
                  <th className="py-3.5 px-4 font-bold">Next Action</th>
                  <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => {
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => router.push(`/crm/${lead.id}`)}
                      className="table-row-standard hover:bg-blue-50/50 hover:translate-x-1 transition-all duration-150 cursor-pointer group"
                    >
                      {/* Business Name & Address */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-xs">
                          <span className="font-extrabold text-sm text-slate-900 group-hover:text-[#004a87] transition-colors block truncate">
                            {lead.business_name}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            {lead.rating ? (
                              <span className="flex items-center gap-1 text-amber-600 font-bold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {lead.rating.toFixed(1)}
                              </span>
                            ) : null}
                            <span className="truncate max-w-[180px]">{lead.address}</span>
                          </div>
                        </div>
                      </td>

                      {/* Phone & WA */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <span className="font-mono text-slate-700 font-semibold group-hover:text-slate-900 transition-colors">
                            {lead.phone || lead.primary_phone || '-'}
                          </span>
                          {(lead.phone || lead.primary_phone) && (
                            <a
                              href={`https://wa.me/${(lead.phone || lead.primary_phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Halo ${lead.business_name}, salam hangat dari tim Working Remotely Indonesia (Worrie.id).`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all hover:scale-110 active:scale-95 shadow-2xs"
                              title="Chat WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border group-hover:shadow-2xs transition-all ${lead.status === 'Closing'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : lead.status === 'Ditolak'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : lead.status === 'Follow Up' || lead.status === 'Quotation'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-blue-50 text-[#004a87] border-blue-200'
                          }`}>
                          {lead.status}
                        </span>
                      </td>

                      {/* Assigned PIC */}
                      <td className="py-3.5 px-4">
                        {lead.assigned_to ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-[#004a87] text-white flex items-center justify-center font-bold text-[10px] group-hover:scale-110 group-hover:ring-2 group-hover:ring-[#004a87] transition-all duration-200 shadow-2xs">
                              {lead.assigned_to.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-800 group-hover:text-[#004a87] transition-colors">{lead.assigned_to}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Belum Ditugaskan</span>
                        )}
                      </td>

                      {/* Deal Value */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-extrabold text-slate-900">
                          {lead.deal_value ? `Rp ${lead.deal_value.toLocaleString('id-ID')}` : '-'}
                        </span>
                      </td>

                      {/* Next Action */}
                      <td className="py-3.5 px-4">
                        {lead.next_action_at ? (
                          <div className="space-y-0.5 text-[11px]">
                            <span className="font-bold text-[#004a87] flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(lead.next_action_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                            {lead.next_action_notes && (
                              <p className="text-slate-500 truncate max-w-[140px]">
                                {lead.next_action_notes}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPromoLead(lead);
                              setIsPromoModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
                            title="Kit Promosi & Buat Flyer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400/30" />
                            <span className="hidden sm:inline">Promo Kit</span>
                          </button>

                          <Link
                            href={`/crm/${lead.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#004a87] hover:bg-[#003866] text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-2xs"
                          >
                            <span>Detail 360°</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={(e) => handleDeleteLead(lead.id, lead.business_name, e)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Hapus Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <span className="font-bold text-slate-800">{filteredLeads.length}</span> dari {leads.length} total leads
          </span>
          <span className="hidden sm:inline">
            Klik baris mana saja untuk membuka halaman 360° Lead View
          </span>
        </div>
      </div>

      {/* =========================================================================
          MODAL TAMBAH LEAD MANUAL
      ========================================================================== */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-backdrop-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-modal-pop"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#004a87]">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Daftarkan Lead Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-500 text-xs font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Sekolah / Instansi Pendidikan *
                </label>
                <input
                  type="text"
                  value={formBusinessName}
                  onChange={(e) => setFormBusinessName(e.target.value)}
                  placeholder="Contoh: SMKN 1 Kota Bandung"
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Lengkap &amp; Kota *
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Contoh: Jl. Wastukencana No. 3, Bandung"
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No Telepon / WhatsApp *
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tahapan Awal di Pipeline
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as LeadStatus)}
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87]"
                  >
                    <option value="Belum dihubungi">Prospek Baru</option>
                    <option value="Dihubungi">Dihubungi</option>
                    <option value="Follow Up">Follow Up</option>
                    <option value="Quotation">Quotation / Proposal</option>
                    <option value="Closing">Deal Menang (Won)</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimasi Nilai Deal (Rp)
                  </label>
                  <input
                    type="number"
                    value={formDealValue || ''}
                    onChange={(e) => setFormDealValue(Number(e.target.value))}
                    placeholder="Contoh: 15000000"
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tugaskan ke PIC Marketing
                  </label>
                  <SearchablePicSelect
                    value={formAssignedTo}
                    onChange={setFormAssignedTo}
                    teamMembers={teamMembers}
                    placeholder="-- Belum Ditugaskan --"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Website / Portal Sekolah (Opsional)
                </label>
                <input
                  type="url"
                  value={formWebsiteUrl}
                  onChange={(e) => setFormWebsiteUrl(e.target.value)}
                  placeholder="https://smkn1bandung.sch.id"
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Awal / Info Tambahan
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Mendapatkan info dari rekomendasi alumni, kepala sekolah berminat program bootcamp remote work."
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingLead}
                  className="px-4 py-2 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white font-bold text-xs shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  {savingLead ? 'Menyimpan...' : 'Simpan Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: IMPOR LEADS MASSAL EXCEL / CSV
      ========================================================================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#004a87]">
                  <FileUp className="w-5 h-5 text-[#004a87]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Impor Data Leads Massal
                  </h3>
                  <p className="text-xs text-slate-500">
                    Unggah file spreadsheet Excel (.xlsx) atau CSV
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setParsedLeads([]);
                  setImportFileName('');
                  setImportFileError(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Template Download Notice */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-[#004a87] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Gunakan Format Template Resmi Worrie.id</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Kolom otomatis dikenali: Nama Sekolah, Alamat, No Telepon/WA, Status, Nilai Deal, PIC, Catatan.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-100 text-[#004a87] font-bold text-xs border border-blue-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#004a87]" />
                  <span>Unduh Template</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih File Spreadsheet (.xlsx, .xls, .csv)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-[#004a87] rounded-2xl p-6 text-center transition-colors bg-slate-50/50 hover:bg-blue-50/30 relative cursor-pointer">
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-500">
                      <Upload className="w-6 h-6 text-[#004a87]" />
                    </div>
                    {importFileName ? (
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{importFileName}</p>
                        <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                          ✓ File berhasil dimuat ({parsedLeads.length} leads valid terdeteksi)
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold text-slate-800 text-xs">
                          Klik untuk memilih file atau seret file ke sini
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Mendukung Microsoft Excel (.xlsx, .xls) dan CSV
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {importFileError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importFileError}</span>
                </div>
              )}

              {/* Optional Default PIC Assignment */}
              {parsedLeads.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">
                        Tugaskan ke PIC Marketing Default
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Otomatis digunakan jika kolom PIC di file spreadsheet kosong
                      </span>
                    </div>
                    <div className="w-full sm:w-60">
                      <SearchablePicSelect
                        value={defaultImportPic}
                        onChange={setDefaultImportPic}
                        teamMembers={teamMembers}
                        placeholder="-- Otomatis / Belum Ada --"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Data Preview Table (Top 5 leads) */}
              {parsedLeads.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">
                      Pratinjau Data Prospek (Menampilkan 5 dari {parsedLeads.length} data):
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                      {parsedLeads.length} Leads Siap Diimpor
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">No</th>
                          <th className="py-2 px-3">Nama Sekolah</th>
                          <th className="py-2 px-3">Telepon / WA</th>
                          <th className="py-2 px-3">Alamat</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3">PIC</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {parsedLeads.slice(0, 5).map((pl, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                            <td className="py-2 px-3 font-bold text-slate-900">{pl.business_name}</td>
                            <td className="py-2 px-3 font-mono text-slate-600">{pl.phone}</td>
                            <td className="py-2 px-3 text-slate-500 truncate max-w-xs">{pl.address}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#004a87] font-semibold text-[10px]">
                                {pl.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {pl.assigned_to || defaultImportPic || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setParsedLeads([]);
                  setImportFileName('');
                  setImportFileError(null);
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={parsedLeads.length === 0 || importing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengimpor {parsedLeads.length} Leads...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mulai Impor ({parsedLeads.length} Leads)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promotional Kit & Flyer Modal */}
      <PromotionalKitModal
        isOpen={isPromoModalOpen}
        onClose={() => {
          setIsPromoModalOpen(false);
          setPromoLead(null);
        }}
        lead={promoLead}
      />
    </div>
  );
}
