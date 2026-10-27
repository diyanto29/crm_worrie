'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  Layers, 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  Trash2, 
  Users, 
  Globe, 
  Compass,
  AlertCircle,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import ExtractProgressModal from '@/components/ExtractProgressModal';
import { DataStore } from '@/lib/dataStore';
import { Campaign, Lead } from '@/types/database';

export default function ProjectsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [maxResults, setMaxResults] = useState(20);
  const [waOnly, setWaOnly] = useState(true);

  // Modal extraction state
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [extractedLeads, setExtractedLeads] = useState<Partial<Lead>[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [newCampaignId, setNewCampaignId] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      const data = await DataStore.getCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns', err);
    } finally {
      setLoading(false);
    }
  }

  const handleStartExtraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || !location.trim()) {
      alert('Mohon isi kata kunci dan lokasi target.');
      return;
    }

    const campaignTitle = name.trim() || `${keyword.trim()} - ${location.trim()}`;
    
    setIsExtracting(true);
    setProgress(15);
    setStatusMessage('Menghubungkan ke API Google Maps & crawler geolokasi...');
    setExtractedLeads([]);
    setIsDone(false);

    try {
      // Step 1: Create campaign record
      const savedCampaign = await DataStore.createCampaign({
        name: campaignTitle,
        keyword: keyword.trim(),
        location: location.trim(),
        max_results: maxResults,
      });
      setNewCampaignId(savedCampaign.id);

      setProgress(35);
      setStatusMessage(`Memindai tempat usaha di area "${location}"...`);

      // Step 2: Trigger scrape API with wa_only flag
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: keyword.trim(),
          location: location.trim(),
          max_results: maxResults,
          wa_only: waOnly,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengekstrak data.');
      }

      const leadsData: Omit<Lead, 'id' | 'created_at'>[] = (data.leads || []).map((item: any) => ({
        ...item,
        campaign_id: savedCampaign.id,
      }));

      // Simulate streaming progress for realistic feedback
      setProgress(65);
      setStatusMessage('Memvalidasi nomor WhatsApp aktif & mendeteksi website...');
      setExtractedLeads(leadsData.slice(0, Math.min(5, leadsData.length)));

      await new Promise((r) => setTimeout(r, 600));
      setProgress(85);
      setStatusMessage('Menyimpan hasil ke database Supabase...');
      setExtractedLeads(leadsData);

      // Step 3: Save leads in bulk
      await DataStore.createLeadsBulk(leadsData);

      setProgress(100);
      setStatusMessage(`Selesai! Berhasil menyimpan ${leadsData.length} prospek ber-WhatsApp valid.`);
      setIsDone(true);
      loadCampaigns();
    } catch (error: any) {
      alert(error?.message || 'Terjadi kesalahan saat ekstraksi.');
      setIsExtracting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Yakin ingin menghapus kampanye ini beserta semua prospek di dalamnya?')) {
      await DataStore.deleteCampaign(id);
      loadCampaigns();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Search className="w-7 h-7 text-emerald-600" />
            Kampanye Pencarian & Scraper
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ekstrak data bisnis lokal dari Google Maps secara otomatis, validasi nomor WhatsApp, dan simpan langsung ke CRM.
          </p>
        </div>
      </div>

      {/* Main Grid: Form Ekstraksi & Quick Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Extraction Form */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Buat Kampanye Ekstraksi Baru</h2>
              <p className="text-xs text-slate-500">Masukkan target industri dan lokasi wilayah bisnis yang dibidik</p>
            </div>
          </div>

          <form onSubmit={handleStartExtraction} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Kampanye (Opsional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Cth: Klinik Gigi Indramayu Batch 1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Jumlah Hasil (Max Leads)
                </label>
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value={10}>10 Prospek Cepat</option>
                  <option value={20}>20 Prospek Standar</option>
                  <option value={30}>30 Prospek Lengkap</option>
                  <option value={50}>50 Prospek Maksimal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kata Kunci Bisnis (Keyword) <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Cth: Klinik Gigi, Bengkel Mobil, Salon, Notaris..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Wilayah / Lokasi Target <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Cth: Indramayu, Jakarta Selatan, Cirebon..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Filter WhatsApp Only Toggle */}
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/90 flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={waOnly}
                  onChange={(e) => setWaOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    Hanya Simpan Nomor yang Valid di WhatsApp
                  </span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Bisnis yang tidak mencantumkan nomor HP WhatsApp (misal hanya telepon kabel kantor atau kosong) akan otomatis <strong>diskip</strong>.
                  </p>
                </div>
              </label>
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
                Aktif
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-sm shadow-emerald-600/20 hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                Mulai Ekstraksi Google Maps
              </button>
            </div>
          </form>
        </div>

        {/* Tips Box */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-amber-700 mb-3 font-bold text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Filter & Validasi Prospek
            </div>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Filter Otomatis WA Aktif:</strong> Nomor telepon rumah/kantor kabel PSTN (021, 0234, dll.) yang tidak support WA otomatis disaring dan dilewati.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Target Tanpa Website:</strong> Peluang penawaran landing page tertinggi ada pada bisnis yang belum memiliki link situs resmi.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>1-Klik Chat WhatsApp:</strong> Buka prospek langsung ke WhatsApp Web / Aplikasi dengan salam pembuka personal.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Divalidasi dengan scraper Google Maps live + filter nomor seluler WhatsApp.
          </div>
        </div>
      </div>

      {/* Campaigns History Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Riwayat Kampanye Ekstraksi ({campaigns.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Daftar pencarian yang telah selesai dan tersimpan</p>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400 text-xs">Memuat daftar kampanye...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Search className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">Belum ada kampanye</p>
            <p className="text-xs text-slate-400 mt-1">Gunakan form di atas untuk mengekstrak prospek pertamamu.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Nama Kampanye</th>
                  <th className="py-3 px-4 font-semibold">Kata Kunci & Lokasi</th>
                  <th className="py-3 px-4 font-semibold">Total Prospek</th>
                  <th className="py-3 px-4 font-semibold">Tanggal Dibuat</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((camp) => (
                  <tr
                    key={camp.id}
                    onClick={() => router.push(`/projects/${camp.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                      {camp.name}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                          {camp.keyword}
                        </span>
                        <span className="text-slate-600 flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {camp.location}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        {camp.leads_count || 0} Prospek
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-mono">
                      {new Date(camp.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/projects/${camp.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 flex items-center gap-1"
                        >
                          Buka Tabel <ArrowRight className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={(e) => handleDelete(camp.id, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Kampanye"
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

      {/* Extraction Animation Modal */}
      <ExtractProgressModal
        isOpen={isExtracting}
        progress={progress}
        statusMessage={statusMessage}
        foundLeads={extractedLeads}
        isDone={isDone}
        onClose={() => {
          setIsExtracting(false);
          if (newCampaignId) {
            router.push(`/projects/${newCampaignId}`);
          }
        }}
      />
    </div>
  );
}
