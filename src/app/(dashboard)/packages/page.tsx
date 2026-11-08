'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Globe,
  Smartphone,
  Layers,
  Puzzle,
  Building,
  School,
  ArrowRight,
  ExternalLink,
  Table as TableIcon,
  LayoutGrid,
  ShieldCheck,
  Calendar,
  DollarSign,
  AlertCircle,
  X,
  FileSpreadsheet,
  Users,
  Calculator,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';
import { DataStore, DEFAULT_SERVICE_PACKAGES } from '@/lib/dataStore';
import { ServicePackage, PackageCategory } from '@/types/database';
import { useAuth } from '@/lib/authContext';

export default function ServicePackagesPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';

  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | PackageCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // After School Simulator State
  const [simStudents, setSimStudents] = useState<number>(5);
  const [showSimCopied, setShowSimCopied] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [formCategory, setFormCategory] = useState<PackageCategory>('website_ppdb');
  const [formName, setFormName] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formTargetAudience, setFormTargetAudience] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSetupFee, setFormSetupFee] = useState<number>(3000000);
  const [formAnnualFee, setFormAnnualFee] = useState<number>(1200000);
  const [formAnnualNotes, setFormAnnualNotes] = useState('');
  const [formFeatures, setFormFeatures] = useState<string[]>(['']);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await DataStore.getServicePackages();
      setPackages(data);
    } catch (err) {
      console.error('Failed to load packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleOpenAdd = () => {
    setEditingPackage(null);
    setFormCategory('website_ppdb');
    setFormName('');
    setFormBadge('');
    setFormTargetAudience('');
    setFormDescription('');
    setFormSetupFee(3000000);
    setFormAnnualFee(1200000);
    setFormAnnualNotes('Domain .sch.id / .com (gratis tahun 1) & Cloud Hosting');
    setFormFeatures(['Website Profil & Responsif', 'Domain & Hosting tahun pertama', 'Dukungan teknis']);
    setFormIsFeatured(false);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: ServicePackage) => {
    setEditingPackage(pkg);
    setFormCategory(pkg.category);
    setFormName(pkg.name);
    setFormBadge(pkg.badge || '');
    setFormTargetAudience(pkg.target_audience || '');
    setFormDescription(pkg.description || '');
    setFormSetupFee(Number(pkg.setup_fee) || 0);
    setFormAnnualFee(Number(pkg.annual_fee) || 0);
    setFormAnnualNotes(pkg.annual_fee_notes || '');
    setFormFeatures(pkg.features && pkg.features.length > 0 ? [...pkg.features] : ['']);
    setFormIsFeatured(Boolean(pkg.is_featured));
    setFormIsActive(Boolean(pkg.is_active));
    setIsModalOpen(true);
  };

  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...formFeatures];
    updated[index] = val;
    setFormFeatures(updated);
  };

  const handleAddFeatureField = () => {
    setFormFeatures([...formFeatures, '']);
  };

  const handleRemoveFeatureField = (index: number) => {
    if (formFeatures.length <= 1) {
      setFormFeatures(['']);
      return;
    }
    setFormFeatures(formFeatures.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Nama paket wajib diisi.');
      return;
    }

    setSaving(true);
    const cleanedFeatures = formFeatures.map((f) => f.trim()).filter(Boolean);

    const categoryNames: Record<PackageCategory, string> = {
      after_school: 'After School Program (Worrie.id)',
      website_ppdb: 'Website & PPDB Online Sekolah',
      attendance_hris: 'Teacher & Staff Attendance (Mobile App + HRIS)',
      bundling: 'Paket Bundling Sekolah Digital',
      addon: 'Add-on & Fitur Tambahan',
      custom: 'Paket Kustomisasi Khusus',
    };

    try {
      if (editingPackage) {
        await DataStore.updateServicePackage(editingPackage.id, {
          category: formCategory,
          category_name: categoryNames[formCategory] || 'Paket Layanan',
          name: formName.trim(),
          badge: formBadge.trim() || null,
          target_audience: formTargetAudience.trim() || null,
          description: formDescription.trim() || null,
          setup_fee: formSetupFee,
          annual_fee: formAnnualFee,
          annual_fee_notes: formAnnualNotes.trim() || null,
          features: cleanedFeatures,
          is_featured: formIsFeatured,
          is_active: formIsActive,
        });
      } else {
        await DataStore.createServicePackage({
          category: formCategory,
          category_name: categoryNames[formCategory] || 'Paket Layanan',
          name: formName.trim(),
          badge: formBadge.trim() || null,
          target_audience: formTargetAudience.trim() || null,
          description: formDescription.trim() || null,
          setup_fee: formSetupFee,
          annual_fee: formAnnualFee,
          annual_fee_notes: formAnnualNotes.trim() || null,
          features: cleanedFeatures,
          is_featured: formIsFeatured,
          is_active: formIsActive,
          sort_order: packages.length + 1,
        });
      }

      setIsModalOpen(false);
      await loadPackages();
    } catch (err) {
      console.error('Error saving package:', err);
      alert('Gagal menyimpan paket.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus paket "${name}"?`)) return;
    try {
      await DataStore.deleteServicePackage(id);
      await loadPackages();
    } catch (err) {
      console.error('Error deleting package:', err);
      alert('Gagal menghapus paket.');
    }
  };

  const handleResetDefault = async () => {
    if (
      !confirm(
        'Apakah Anda yakin ingin me-reset daftar paket kembali ke template resmi proposal (Mudahkan.online × Mas Diyanto)? Perubahan manual Anda akan ditimpa.'
      )
    )
      return;

    try {
      await DataStore.resetServicePackagesToDefault();
      await loadPackages();
      alert('Berhasil me-reset paket ke standar proposal.');
    } catch (err) {
      console.error('Error resetting packages:', err);
      alert('Gagal me-reset paket.');
    }
  };

  const handleCopyText = (pkg: ServicePackage) => {
    const text = `*${pkg.name}* (${pkg.category_name})
Target: ${pkg.target_audience || 'Institusi Pendidikan'}
Biaya Setup Awal: Rp ${Number(pkg.setup_fee).toLocaleString('id-ID')}
Biaya Perpanjangan: Rp ${Number(pkg.annual_fee).toLocaleString('id-ID')}/tahun (${pkg.annual_fee_notes || '-'})

*Fitur Unggulan:*
${pkg.features.map((f) => `• ${f}`).join('\n')}

_Proposal Kemitraan Transformasi Digital Sekolah - Worrie.id & Mudahkan.online_`;

    navigator.clipboard.writeText(text);
    setCopiedId(pkg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyPitchText = () => {
    const groups = Math.max(1, Math.ceil(simStudents / 5));
    const totalTerm = simStudents * 1320000;
    const text = `Halo Bapak/Ibu Pimpinan Sekolah / Komite,

Perkenalkan kami dari *Worrie.id (Working Remotely Indonesia)*. Kami ingin menawarkan program ekstrakurikuler unggulan untuk para siswa:

🚀 *AFTER SCHOOL: REMOTE WORK CAREER ACCELERATOR*
Program ekstrakurikuler intensif yang mempersiapkan generasi muda menguasai skill digital & berkarir secara global remote work sejak bangku sekolah.

✨ *Mengapa Program Ini Sangat Diminati Siswa & Orang Tua?*
1. *Rasio Emas 1:5* — 1 Mentor praktisi industri hanya mendampingi maksimal 5 siswa untuk bimbingan personal.
2. *100% Praktik Langsung* — Bukan les teori membosankan. Setiap kali pertemuan, siswa pulang membawa 1 project & portofolio karya nyata!
3. *Skill Siap Kerja Masa Depan* — Pemanfaatan AI Tools, Desain Portofolio Digital, dan Freelancing Remote internasional.
4. *Pameran Karya (Showcase)* — Presentasi pameran hasil karya siswa di akhir term di hadapan pihak sekolah & orang tua.

💰 *Format Biaya Terjangkau:*
• Biaya Sesi: *Rp 110.000 / anak / pertemuan* (Minimal 5 anak / kelas = Rp 550.000 / sesi)
• Paket 1 Term (3 Bulan / 12x Pertemuan): *Rp 1.320.000 / anak*
• Simulasi untuk ${simStudents} Siswa: ${groups} Kelompok Belajar (Total Investasi Term: Rp ${totalTerm.toLocaleString('id-ID')})

Tersedia juga opsi *Kemitraan Resmi B2B Sekolah* (tanpa biaya awal, pemanfaatan lab komputer sekolah & sistem bagi hasil 10-15% ke kas sekolah).

Apakah kami diperkenankan menjadwalkan presentasi singkat (15 menit) atau mengirimkan proposal resminya? Terima kasih banyak.

_Salam Hangat, Tim Worrie.id (Working Remotely Indonesia)_`;

    navigator.clipboard.writeText(text);
    setShowSimCopied(true);
    setTimeout(() => setShowSimCopied(false), 2500);
  };

  // Filtered list
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchTab = activeTab === 'all' || pkg.category === activeTab;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        pkg.name.toLowerCase().includes(q) ||
        (pkg.target_audience && pkg.target_audience.toLowerCase().includes(q)) ||
        (pkg.description && pkg.description.toLowerCase().includes(q)) ||
        pkg.features.some((f) => f.toLowerCase().includes(q));

      return matchTab && matchSearch;
    });
  }, [packages, activeTab, searchQuery]);

  const countByCategory = useMemo(() => {
    return {
      all: packages.length,
      after_school: packages.filter((p) => p.category === 'after_school').length,
      website_ppdb: packages.filter((p) => p.category === 'website_ppdb').length,
      attendance_hris: packages.filter((p) => p.category === 'attendance_hris').length,
      bundling: packages.filter((p) => p.category === 'bundling').length,
      addon: packages.filter((p) => p.category === 'addon').length,
    };
  }, [packages]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Katalog Resmi Kemitraan Sekolah 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-[#004a87]" />
            Daftar Harga & Paket Layanan
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Acuan harga resmi penawaran transformasi digital sekolah (Website, PPDB Online, Absensi Mobile Guru + HRIS, dan Bundling). Semua isi paket dapat disesuaikan dan diubah secara fleksibel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleResetDefault}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Kembalikan semua paket ke default proposal resmi"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Standar Proposal</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white text-xs sm:text-sm font-bold transition-all shadow-sm shadow-[#004a87]/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Paket Baru</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Paket</span>
            <Package className="w-4 h-4 text-[#004a87]" />
          </div>
          <p className="text-2xl font-black text-slate-900">{packages.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Semua kategori siap dipasarkan</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Website & PPDB</span>
            <Globe className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{countByCategory.website_ppdb}</p>
          <span className="text-[11px] text-slate-500">Mulai Rp 3.000.000</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Absensi & HRIS Guru</span>
            <Smartphone className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{countByCategory.attendance_hris}</p>
          <span className="text-[11px] text-slate-500">Mulai Rp 6.000.000</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-xs font-bold">Paket Bundling</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-950">{countByCategory.bundling}</p>
          <span className="text-[11px] text-amber-700 font-semibold">Hemat s/d Rp 2.000.000</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#004a87] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua ({countByCategory.all})
          </button>

          <button
            onClick={() => setActiveTab('after_school')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'after_school'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            After School Worrie ({countByCategory.after_school})
          </button>

          <button
            onClick={() => setActiveTab('website_ppdb')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'website_ppdb'
                ? 'bg-[#004a87] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Website & PPDB ({countByCategory.website_ppdb})
          </button>

          <button
            onClick={() => setActiveTab('attendance_hris')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'attendance_hris'
                ? 'bg-[#004a87] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Absensi Guru & HRIS ({countByCategory.attendance_hris})
          </button>

          <button
            onClick={() => setActiveTab('bundling')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bundling'
                ? 'bg-[#004a87] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Paket Bundling ({countByCategory.bundling})
          </button>

          <button
            onClick={() => setActiveTab('addon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'addon'
                ? 'bg-[#004a87] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" />
            Add-on ({countByCategory.addon})
          </button>
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari paket atau fitur..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-[#004a87] transition-colors"
            />
          </div>

          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-white shadow-xs text-[#004a87]' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Kartu Pricing"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-xs text-[#004a87]' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Tabel Komparasi"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Rekomendasi Khusus & Simulator After School (Tampil saat tab 'all' atau 'after_school') */}
      {(activeTab === 'all' || activeTab === 'after_school') && (
        <div className="bg-gradient-to-br from-amber-50/70 via-white to-blue-50/50 rounded-2xl border border-amber-200/80 p-5 sm:p-6 shadow-xs animate-in fade-in duration-200">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Sisi Kiri: Rekomendasi Format Penulisan Harga & Value Proposition */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
                  <Lightbulb className="w-4 h-4" />
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Rekomendasi Penulisan Harga & Cara Pitching After School Worrie.id
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Berdasarkan strategi konversi penawaran: Orang tua dan sekolah lebih mudah menyetujui jika nilai pertemuannya terasa terjangkau setara uang jajan harian, namun hasilnya bergaransi nyata. Gunakan 3 pilar penawaran berikut:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-white border border-amber-200/70 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Format Harga Sesi</span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">Rp 110.000 <span className="text-xs font-normal text-slate-500">/ anak / sesi</span></p>
                  <p className="text-[11px] text-slate-500 mt-1">Min. 5 anak (1 kelas = Rp 550.000). Rasio 1 guru fokus 5 murid.</p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-blue-200/70 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Format Pembayaran Term</span>
                  <p className="text-sm font-black text-[#004a87] mt-0.5">Rp 1.320.000 <span className="text-xs font-normal text-slate-500">/ 3 bulan</span></p>
                  <p className="text-[11px] text-slate-500 mt-1">12x pertemuan intensif. Garansi tuntas 12 project karya portofolio.</p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-emerald-200/70 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Kunci Penawaran (Hook)</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">&ldquo;Tiap Sesi Pulang Bawa Karya&rdquo;</p>
                  <p className="text-[11px] text-slate-500 mt-1">Bukan les teori. Setiap sesi siswa membuat karya nyata untuk portofolio global.</p>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Kalkulator Interaktif Simulasi Jumlah Siswa */}
            <div className="w-full lg:w-96 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-[#004a87]" />
                  Simulasi Kelas & Omset Term
                </span>
                <span className="text-[11px] font-extrabold text-[#004a87] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  {simStudents} Siswa ({Math.max(1, Math.ceil(simStudents / 5))} Guru)
                </span>
              </div>

              {/* Slider / Button Quick Choice */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Pilih Jumlah Siswa:</span>
                  <span className="font-bold text-slate-700">{simStudents} Anak</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="5"
                  value={simStudents}
                  onChange={(e) => setSimStudents(Number(e.target.value))}
                  className="w-full accent-[#004a87] cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>5 anak (1 klp)</span>
                  <span>15 anak (3 klp)</span>
                  <span>30 anak (6 klp)</span>
                  <span>40 anak (8 klp)</span>
                </div>
              </div>

              {/* Calculation Summary */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Omset per Pertemuan:</span>
                  <span className="font-bold text-slate-900">Rp {(simStudents * 110000).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Omset 1 Term (12 Sesi):</span>
                  <span className="font-extrabold text-[#004a87]">Rp {(simStudents * 1320000).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/80">
                  <span>Rasio Pengajar:</span>
                  <span className="font-medium text-slate-700">{Math.max(1, Math.ceil(simStudents / 5))} Mentor Praktisi</span>
                </div>
              </div>

              <button
                onClick={handleCopyPitchText}
                className="w-full py-2 px-3 rounded-lg bg-[#004a87] hover:bg-[#003866] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                {showSimCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Draft WhatsApp Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Draft WhatsApp ({simStudents} Siswa)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-[#004a87] mb-3"></div>
          <p className="text-sm font-semibold">Memuat katalog daftar harga...</p>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Tidak ada paket yang cocok</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Tidak ditemukan paket pada kategori ini dengan kata kunci pencarian tersebut.
          </p>
          <button
            onClick={() => {
              setActiveTab('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Tampilkan Semua Paket
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* ================= CARDS VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => {
            const isFeatured = pkg.is_featured;
            return (
              <div
                key={pkg.id}
                className={`rounded-2xl transition-all duration-200 flex flex-col justify-between relative bg-white border ${
                  isFeatured
                    ? 'border-[#004a87] shadow-md ring-2 ring-[#004a87]/10'
                    : 'border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Header & Badges */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      {pkg.category === 'after_school' && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                      {pkg.category === 'website_ppdb' && <Globe className="w-3.5 h-3.5 text-blue-600" />}
                      {pkg.category === 'attendance_hris' && <Smartphone className="w-3.5 h-3.5 text-emerald-600" />}
                      {pkg.category === 'bundling' && <Layers className="w-3.5 h-3.5 text-amber-600" />}
                      {pkg.category === 'addon' && <Puzzle className="w-3.5 h-3.5 text-purple-600" />}
                      {pkg.category_name}
                    </span>

                    {pkg.badge && (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide ${
                          isFeatured
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {pkg.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{pkg.name}</h3>
                  {pkg.target_audience && (
                    <p className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1 border border-emerald-200/60">
                      Target: {pkg.target_audience}
                    </p>
                  )}

                  {pkg.description && (
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{pkg.description}</p>
                  )}

                  {/* Pricing Box */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-slate-500 font-semibold">Setup:</span>
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        Rp {Number(pkg.setup_fee).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <span className="font-medium text-slate-700">Perpanjangan:</span>
                      {Number(pkg.annual_fee) > 0 ? (
                        <span>Rp {Number(pkg.annual_fee).toLocaleString('id-ID')} / thn</span>
                      ) : (
                        <span className="text-slate-400 italic">Sesuai kebutuhan</span>
                      )}
                    </div>

                    {pkg.annual_fee_notes && (
                      <p className="text-[11px] text-slate-400 italic mt-0.5">({pkg.annual_fee_notes})</p>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex-1">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    Fitur & Komponen Termasuk:
                  </p>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-white border-t border-slate-100 rounded-b-2xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyText(pkg)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Salin deskripsi & harga paket ke clipboard (format WhatsApp)"
                    >
                      {copiedId === pkg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Salin WA</span>
                        </>
                      )}
                    </button>

                    <Link
                      href={`/quotations?prefill_title=${encodeURIComponent(
                        'Penawaran Kemitraan: ' + pkg.name
                      )}&prefill_price=${pkg.setup_fee}&prefill_desc=${encodeURIComponent(
                        pkg.name + ' - ' + (pkg.description || '')
                      )}`}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Buat Quotation resmi dengan paket ini"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Buat MoU</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(pkg)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#004a87] hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit rincian dan harga paket"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id, pkg.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus paket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= TABLE VIEW ================= */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Nama Paket & Kategori</th>
                  <th className="py-3.5 px-4">Target Institusi</th>
                  <th className="py-3.5 px-4 text-right">Biaya Setup Awal</th>
                  <th className="py-3.5 px-4 text-right">Perpanjangan Tahunan</th>
                  <th className="py-3.5 px-4">Fitur Utama</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {pkg.name}
                        {pkg.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">{pkg.category_name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {pkg.target_audience || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 text-sm font-mono">
                      Rp {Number(pkg.setup_fee).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700 text-xs font-mono">
                      {Number(pkg.annual_fee) > 0 ? (
                        <div>
                          <span>Rp {Number(pkg.annual_fee).toLocaleString('id-ID')} / thn</span>
                          {pkg.annual_fee_notes && (
                            <p className="text-[10px] text-slate-400 font-sans font-normal italic">
                              {pkg.annual_fee_notes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">
                      <ul className="space-y-0.5 list-disc list-inside">
                        {pkg.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="truncate" title={f}>
                            {f}
                          </li>
                        ))}
                        {pkg.features.length > 3 && (
                          <li className="text-[10px] text-slate-400 font-semibold list-none">
                            +{pkg.features.length - 3} fitur lainnya...
                          </li>
                        )}
                      </ul>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleCopyText(pkg)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Salin rincian paket"
                        >
                          {copiedId === pkg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(pkg)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#004a87] hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit paket"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id, pkg.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Hapus paket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Section: Terms & Conditions from Proposal PDF */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-[#004a87] mb-2">
            <DollarSign className="w-4 h-4 text-amber-500" />
            Termin Pembayaran Resmi
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>50%</strong> saat persetujuan penawaran / MoU, dan <strong>50%</strong> saat sistem Go-Live. Biaya perpanjangan tahunan dibayarkan sebelum masa aktif berakhir.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-[#004a87] mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Garansi & Keamanan Data
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Setiap sekolah memiliki <strong>database terisolasi penuh</strong> (isolated database). Bebas biaya perbaikan bug selama masa aktif dan data sekolah 100% milik institusi.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/70 border border-amber-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-900 mb-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Program Sekolah Pilot
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Untuk sekolah yang bergabung pertama kali, tersedia <strong>harga khusus program pilot</strong> dengan kuota terbatas sebagai studi kasus implementasi.
          </p>
        </div>
      </div>

      {/* ================= MODAL TAMBAH / EDIT PAKET ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#004a87]/10 text-[#004a87] rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingPackage ? 'Edit Paket Layanan' : 'Tambah Paket Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Isi rincian harga, target sekolah, dan butir fitur paket.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Layanan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as PackageCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#004a87]"
                  >
                    <option value="after_school">After School Program (Worrie.id)</option>
                    <option value="website_ppdb">Website & PPDB Online Sekolah</option>
                    <option value="attendance_hris">Teacher & Staff Attendance (Mobile App + HRIS)</option>
                    <option value="bundling">Paket Bundling Sekolah Digital</option>
                    <option value="addon">Add-on & Fitur Tambahan</option>
                    <option value="custom">Paket Kustomisasi Khusus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Paket <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Cth: Silver (PPDB Online)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#004a87]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Institusi
                  </label>
                  <input
                    type="text"
                    value={formTargetAudience}
                    onChange={(e) => setFormTargetAudience(e.target.value)}
                    placeholder="Cth: SD / SMP / MTs Berkembang"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#004a87]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Badge Khusus (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="Cth: Populer, Best Seller, Hemat Rp 1 Jt"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#004a87]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Biaya Setup Awal (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={100000}
                    value={formSetupFee}
                    onChange={(e) => setFormSetupFee(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:border-[#004a87]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Biaya Perpanjangan Tahunan (Rp / thn)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100000}
                    value={formAnnualFee}
                    onChange={(e) => setFormAnnualFee(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:border-[#004a87]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan Biaya Perpanjangan
                </label>
                <input
                  type="text"
                  value={formAnnualNotes}
                  onChange={(e) => setFormAnnualNotes(e.target.value)}
                  placeholder="Cth: Domain .sch.id / .com (gratis thn 1) & Cloud Hosting"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#004a87]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Ringkas Paket
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Penjelasan singkat tujuan atau keunggulan paket ini..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#004a87]"
                />
              </div>

              {/* Dynamic Features List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Fitur & Komponen Paket ({formFeatures.filter(Boolean).length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFeatureField}
                    className="text-xs font-bold text-[#004a87] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Fitur
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 w-4 text-right">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        placeholder={`Fitur ke-${idx + 1}...`}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#004a87]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeatureField(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#004a87] focus:ring-[#004a87]"
                  />
                  Tandai sebagai Paket Unggulan (Featured)
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#004a87] focus:ring-[#004a87]"
                  />
                  Status Aktif (Tampilkan di Katalog)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white text-xs font-bold transition-all shadow-sm shadow-[#004a87]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : editingPackage ? 'Perbarui Paket' : 'Simpan Paket Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

