'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Printer, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  Building2, 
  Calendar, 
  DollarSign, 
  ExternalLink, 
  Share2, 
  Trash2, 
  ArrowUpDown,
  RefreshCw,
  Sparkles,
  Award,
  Send,
  X
} from 'lucide-react';
import { DataStore } from '@/lib/dataStore';
import { Quotation, QuotationStatus, Lead, QuotationItem } from '@/types/database';
import { useAuth } from '@/lib/authContext';
import PdfPreviewModal from '@/components/PdfPreviewModal';
import { generateQuotationPdf } from '@/lib/pdfGenerator';

export default function QuotationsPage() {
  const { profile } = useAuth();
  const [quotations, setQuotations] = useState<Array<Quotation & { lead?: Lead }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | QuotationStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Leads list & Modal State for Direct Quotation Creation
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creatingQuote, setCreatingQuote] = useState(false);

  // Form State for New Quotation
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [formQuoteTitle, setFormQuoteTitle] = useState('Paket Kemitraan Seminar & Bootcamp Digital Remote Work 2026');
  const [formValidDays, setFormValidDays] = useState(30);
  const [formItems, setFormItems] = useState<Array<{ item_name: string; description: string; qty: number; unit_price: number }>>([
    {
      item_name: 'Workshop Intensive: Remote Work Readiness & Global Portfolio',
      description: 'Pelatihan 2 hari offline/hybrid: LinkedIn profile, Upwork/Fiverr setup, portfolio digital',
      qty: 1,
      unit_price: 5000000,
    },
    {
      item_name: 'Seminar Inspiratif: Peluang Karir Internasional dari Rumah',
      description: 'Sesi stadium general untuk 150 siswa & guru pembimbing',
      qty: 1,
      unit_price: 3500000,
    },
  ]);
  const [formDiscount, setFormDiscount] = useState<number>(1000000);
  const [formIncludeTax, setFormIncludeTax] = useState<boolean>(false);
  const [formTerms, setFormTerms] = useState<string>(
    '1. Pembayaran DP 50% saat penandatanganan kesepakatan dan 50% setelah program selesai.\n2. Pembayaran ditransfer ke rekening resmi: Bank Mandiri 123-00-9876543-2 a.n PT Working Remotely Indonesia.\n3. Dokumen penawaran ini berlaku resmi selama 30 hari kalender sejak tanggal penerbitan.'
  );

  const formSubtotal = useMemo(() => {
    return formItems.reduce(
      (acc, curr) => acc + Number(curr.qty || 1) * Number(curr.unit_price || 0),
      0
    );
  }, [formItems]);

  const formTax = useMemo(() => {
    if (!formIncludeTax) return 0;
    const base = Math.max(0, formSubtotal - formDiscount);
    return Math.round(base * 0.11);
  }, [formSubtotal, formDiscount, formIncludeTax]);

  const formGrandTotal = useMemo(() => {
    return Math.max(0, formSubtotal - formDiscount + formTax);
  }, [formSubtotal, formDiscount, formTax]);

  // Pure PDF Preview State
  const [pdfPreviewData, setPdfPreviewData] = useState<{
    isOpen: boolean;
    url: string | null;
    filename: string;
    title: string;
    subtitle: string;
    loading: boolean;
  }>({
    isOpen: false,
    url: null,
    filename: '',
    title: '',
    subtitle: '',
    loading: false
  });

  const handleOpenPdfPreview = async (quote: Quotation & { lead?: Lead }) => {
    setPdfPreviewData({
      isOpen: true,
      url: null,
      filename: `Penawaran_Worrie_${quote.quote_number}.pdf`,
      title: `Surat Penawaran Resmi - ${quote.quote_number}`,
      subtitle: `${quote.lead?.business_name || 'Mitra Worrie.id'} • ${quote.title}`,
      loading: true
    });

    try {
      const res = await generateQuotationPdf(quote);
      setPdfPreviewData({
        isOpen: true,
        url: res.url,
        filename: res.filename,
        title: `Surat Penawaran Resmi - ${quote.quote_number}`,
        subtitle: `${quote.lead?.business_name || 'Mitra Worrie.id'} • ${quote.title}`,
        loading: false
      });
    } catch (err) {
      console.error('Failed to generate pure PDF for quotation:', err);
      setPdfPreviewData((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleClosePdfPreview = () => {
    if (pdfPreviewData.url) {
      URL.revokeObjectURL(pdfPreviewData.url);
    }
    setPdfPreviewData({
      isOpen: false,
      url: null,
      filename: '',
      title: '',
      subtitle: '',
      loading: false
    });
  };

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const [data, leadsData] = await Promise.all([
        DataStore.getAllQuotations(),
        DataStore.getLeads(),
      ]);
      setQuotations(data);
      setLeads(leadsData);
    } catch (err) {
      console.error('Failed to load quotations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) {
      alert('Mohon pilih Calon Mitra / Sekolah terlebih dahulu.');
      return;
    }
    if (formItems.length === 0) {
      alert('Tambahkan minimal 1 item layanan pada proposal.');
      return;
    }

    setCreatingQuote(true);
    try {
      const actorName = profile?.full_name || 'Tim Sales Worrie';
      const selectedLead = leads.find((l) => l.id === selectedLeadId);
      const validUntil = new Date(Date.now() + formValidDays * 86400000).toISOString();

      const calculatedItems = formItems.map((it) => ({
        ...it,
        total_price: Number(it.qty) * Number(it.unit_price),
      }));

      const newQuote = await DataStore.createQuotation(
        {
          lead_id: selectedLeadId,
          quote_number: `Q-WORRIE/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${Math.floor(100 + Math.random() * 900)}`,
          title: formQuoteTitle,
          status: 'draft',
          subtotal: formSubtotal,
          discount: formDiscount,
          tax: formTax,
          grand_total: formGrandTotal,
          valid_until: validUntil,
          terms_conditions: formTerms,
        },
        calculatedItems,
        actorName
      );

      setIsCreateModalOpen(false);
      await loadQuotations();

      // Open Pure PDF preview immediately!
      await handleOpenPdfPreview({
        ...newQuote,
        lead: selectedLead,
        items: calculatedItems as QuotationItem[],
      });
    } catch (err) {
      console.error('Failed to create quotation', err);
      alert('Gagal membuat penawaran baru.');
    } finally {
      setCreatingQuote(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  const handleStatusChange = async (quoteId: string, newStatus: QuotationStatus) => {
    setUpdatingId(quoteId);
    try {
      const actorName = profile?.full_name || 'Tim Sales Worrie';
      await DataStore.updateQuotationStatus(quoteId, newStatus, actorName);
      await loadQuotations();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Gagal memperbarui status penawaran');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteQuotation = async (quoteId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen penawaran ini?')) return;
    try {
      await DataStore.deleteQuotation(quoteId);
      await loadQuotations();
      if (pdfPreviewData.isOpen) {
        handleClosePdfPreview();
      }
    } catch (err) {
      console.error('Failed to delete quotation', err);
      alert('Gagal menghapus penawaran');
    }
  };

  const formatIDR = (val: number) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`;

  // Filtered list
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      const qLower = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        q.quote_number.toLowerCase().includes(qLower) ||
        q.title.toLowerCase().includes(qLower) ||
        (q.lead?.business_name && q.lead.business_name.toLowerCase().includes(qLower));
      return matchesStatus && matchesSearch;
    });
  }, [quotations, statusFilter, searchQuery]);

  // Aggregate metrics
  const totalCount = quotations.length;
  const acceptedQuotes = quotations.filter((q) => q.status === 'accepted');
  const acceptedValue = acceptedQuotes.reduce((acc, q) => acc + (Number(q.grand_total) || 0), 0);
  const sentQuotes = quotations.filter((q) => q.status === 'sent');
  const sentValue = sentQuotes.reduce((acc, q) => acc + (Number(q.grand_total) || 0), 0);
  const winRate = totalCount > 0 ? Math.round((acceptedQuotes.length / totalCount) * 100) : 0;

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui (Deal)
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#004a87] border border-blue-200">
            <Send className="w-3.5 h-3.5" /> Terkirim ke Klien
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Ditolak / Batal
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5" /> Draft Penawaran
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#004a87] border border-blue-200">
              Modul Penawaran B2B
            </span>
            <span className="text-xs text-slate-500">
              Worrie.id &bull; Education &amp; Career Readiness
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Penawaran &amp; Proposal Kerjasama
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola draft proposal, penawaran harga kemitraan sekolah/kampus, dan pantau status closing deal.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadQuotations}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Muat ulang data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white font-bold text-xs shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Penawaran Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Penawaran</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#004a87]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{totalCount}</p>
          <p className="text-xs text-slate-500 mt-1">Dokumen proposal dibuat</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai Deal Disetujui</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">{formatIDR(acceptedValue)}</p>
          <p className="text-xs text-slate-500 mt-1">{acceptedQuotes.length} institusi closing</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proposal Mengambang</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatIDR(sentValue)}</p>
          <p className="text-xs text-slate-500 mt-1">{sentQuotes.length} proposal menunggu keputusan</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rasio Closing</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-indigo-700 mt-2">{winRate}%</p>
          <p className="text-xs text-slate-500 mt-1">Konversi proposal disetujui</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Semua Status', count: totalCount },
            { id: 'draft', label: 'Draft', count: quotations.filter(q => q.status === 'draft').length },
            { id: 'sent', label: 'Terkirim', count: sentQuotes.length },
            { id: 'accepted', label: 'Disetujui', count: acceptedQuotes.length },
            { id: 'rejected', label: 'Ditolak', count: quotations.filter(q => q.status === 'rejected').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[#004a87] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
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
            placeholder="Cari nomor, judul, nama institusi..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87]"
          />
        </div>
      </div>

      {/* Quotations Table */}
      <div className="animate-card-slide-slow rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#004a87] mb-3" />
            <p className="text-xs font-semibold">Memuat dokumen penawaran...</p>
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-800">Belum Ada Dokumen Penawaran</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Tidak ada penawaran yang cocok dengan kriteria filter Anda.'
                : 'Buka halaman detail Lead di Pipeline CRM dan klik tombol "+ Buat Penawaran" untuk menyusun proposal resmi.'}
            </p>
            <Link
              href="/crm"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-[#004a87] text-white text-xs font-bold hover:bg-[#003866] transition-colors"
            >
              Buka Pipeline CRM
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">No. Penawaran</th>
                  <th className="py-3 px-4">Institusi / Mitra</th>
                  <th className="py-3 px-4">Judul Proposal</th>
                  <th className="py-3 px-4">Total Nilai</th>
                  <th className="py-3 px-4">Berlaku Sampai</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotations.map((quote) => (
                  <tr key={quote.id} className="table-row-standard hover:bg-blue-50/50 hover:translate-x-1 transition-all duration-150 group cursor-pointer">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#004a87] group-hover:scale-105 transition-transform">
                      {quote.quote_number}
                    </td>
                    <td className="py-3.5 px-4">
                      {quote.lead ? (
                        <div>
                          <Link
                            href={`/crm/${quote.lead.id}`}
                            className="font-bold text-slate-900 group-hover:text-[#004a87] hover:underline flex items-center gap-1.5 transition-colors"
                          >
                            <Building2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#004a87] shrink-0 transition-colors" />
                            <span>{quote.lead.business_name}</span>
                          </Link>
                          {quote.lead.phone && (
                            <span className="text-[11px] text-slate-400 block ml-5">
                              {quote.lead.phone}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Lead Tidak Ditemukan</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs truncate">
                      {quote.title}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {formatIDR(quote.grand_total)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(quote.valid_until).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={quote.status}
                          disabled={updatingId === quote.id}
                          onChange={(e) => handleStatusChange(quote.id, e.target.value as QuotationStatus)}
                          className="text-[11px] font-bold py-1 px-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#004a87] cursor-pointer"
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Terkirim</option>
                          <option value="accepted">Disetujui (Deal)</option>
                          <option value="rejected">Ditolak</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenPdfPreview(quote)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#004a87] transition-colors cursor-pointer"
                          title="Preview &amp; Cetak PDF Murni"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {quote.lead?.phone && (
                          <a
                            href={`https://wa.me/${quote.lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Halo ${quote.lead.business_name}, salam hangat dari Worrie.id. Terlampir kami sampaikan surat penawaran resmi ${quote.quote_number} untuk program ${quote.title} (Total: ${formatIDR(quote.grand_total)}). Apakah sudah berkenan kami jadwalkan sesi diskusi teknis?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                            title="Kirim Ringkasan via WhatsApp"
                          >
                            <Share2 className="w-4 h-4" />
                          </a>
                        )}
                        {quote.lead && (
                          <Link
                            href={`/crm/${quote.lead.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Buka 360° Lead"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleDeleteQuotation(quote.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          title="Hapus Penawaran"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: BUAT SURAT PENAWARAN RESMI
      ========================================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#004a87]">
                  <FileSpreadsheet className="w-5 h-5 text-[#004a87]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Buat Surat Penawaran Resmi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Susun proposal kemitraan sekolah/kampus &bull; PT Working Remotely Indonesia
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateQuotation} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
                {/* Select Lead & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Pilih Calon Mitra / Sekolah *
                    </label>
                    <select
                      value={selectedLeadId}
                      onChange={(e) => setSelectedLeadId(e.target.value)}
                      className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87] font-semibold"
                      required
                    >
                      <option value="">-- Pilih Sekolah / Mitra --</option>
                      {leads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.business_name} ({l.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Masa Berlaku Penawaran
                    </label>
                    <select
                      value={formValidDays}
                      onChange={(e) => setFormValidDays(Number(e.target.value))}
                      className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87]"
                    >
                      <option value={14}>14 Hari Kalender</option>
                      <option value={30}>30 Hari Kalender (Standar)</option>
                      <option value={60}>60 Hari Kalender</option>
                      <option value={90}>90 Hari Kalender</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Judul Penawaran / Program Kerjasama *
                  </label>
                  <input
                    type="text"
                    value={formQuoteTitle}
                    onChange={(e) => setFormQuoteTitle(e.target.value)}
                    placeholder="Contoh: Paket Kemitraan Seminar & Bootcamp Digital Remote Work 2026"
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87] font-medium"
                    required
                  />
                </div>

                {/* Line Items Editor */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">
                      Rincian Item Program &amp; Layanan ({formItems.length} item)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormItems([
                          ...formItems,
                          {
                            item_name: '',
                            description: '',
                            qty: 1,
                            unit_price: 2500000,
                          },
                        ])
                      }
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-[#004a87] hover:bg-blue-100 font-bold text-[11px] border border-blue-200 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Baris
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            Item #{idx + 1}
                          </span>
                          {formItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setFormItems(formItems.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                              title="Hapus baris item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                          <div className="sm:col-span-6">
                            <input
                              type="text"
                              value={item.item_name}
                              onChange={(e) => {
                                const updated = [...formItems];
                                updated[idx].item_name = e.target.value;
                                setFormItems(updated);
                              }}
                              placeholder="Nama Layanan / Modul Pelatihan"
                              className="w-full text-xs py-2 px-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-[#004a87] font-semibold"
                              required
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={(e) => {
                                const updated = [...formItems];
                                updated[idx].qty = Number(e.target.value);
                                setFormItems(updated);
                              }}
                              placeholder="Qty"
                              className="w-full text-xs py-2 px-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-[#004a87] text-center"
                              required
                            />
                          </div>

                          <div className="sm:col-span-4">
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => {
                                const updated = [...formItems];
                                updated[idx].unit_price = Number(e.target.value);
                                setFormItems(updated);
                              }}
                              placeholder="Harga Satuan (Rp)"
                              className="w-full text-xs py-2 px-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-[#004a87] text-right font-mono"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const updated = [...formItems];
                              updated[idx].description = e.target.value;
                              setFormItems(updated);
                            }}
                            placeholder="Deskripsi singkat item / output kegiatan (opsional)"
                            className="w-full text-[11px] py-1.5 px-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-[#004a87] text-slate-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Subtotal Layanan:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {formatIDR(formSubtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-600">Diskon Khusus Mitra:</span>
                    <div className="w-44">
                      <input
                        type="number"
                        value={formDiscount}
                        onChange={(e) => setFormDiscount(Number(e.target.value))}
                        className="w-full text-xs py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 text-right font-mono font-bold text-emerald-700"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={formIncludeTax}
                        onChange={(e) => setFormIncludeTax(e.target.checked)}
                        className="rounded text-[#004a87] focus:ring-[#004a87]"
                      />
                      <span>Kenakan PPN 11% (+ {formatIDR(formTax)})</span>
                    </label>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="font-extrabold text-sm text-[#004a87]">
                      TOTAL INVESTASI KESEPAKATAN:
                    </span>
                    <span className="font-black text-base text-[#004a87] font-mono">
                      {formatIDR(formGrandTotal)}
                    </span>
                  </div>
                </div>

                {/* Terms and conditions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ketentuan Kerjasama &amp; Rekening Pembayaran
                  </label>
                  <textarea
                    rows={3}
                    value={formTerms}
                    onChange={(e) => setFormTerms(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87] text-slate-600 leading-relaxed"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={creatingQuote}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {creatingQuote ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyusun Dokumen PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Simpan &amp; Preview PDF Murni</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pure PDF Preview Modal Resmi Worrie.id */}
      <PdfPreviewModal
        isOpen={pdfPreviewData.isOpen}
        onClose={handleClosePdfPreview}
        pdfUrl={pdfPreviewData.url}
        filename={pdfPreviewData.filename}
        title={pdfPreviewData.title}
        subtitle={pdfPreviewData.subtitle}
        loading={pdfPreviewData.loading}
      />
    </div>
  );
}
