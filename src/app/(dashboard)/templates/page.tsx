'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquareQuote, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Copy, 
  Check, 
  Sparkles,
  Info,
  BookOpen,
  Wand2,
  BookmarkPlus,
  RefreshCw,
  Flame,
  ArrowRight
} from 'lucide-react';
import { DataStore } from '@/lib/dataStore';
import { MessageTemplate } from '@/types/database';
import { 
  RECOMMENDED_TEMPLATES, 
  TemplateRecommendation, 
  generateAITemplate, 
  AIGeneratorOptions 
} from '@/lib/aiTemplates';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my_templates' | 'recommendations'>('my_templates');

  // Form State for manual creating/editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  // AI Generator Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiCategory, setAiCategory] = useState<AIGeneratorOptions['category']>('new_web');
  const [aiIndustry, setAiIndustry] = useState<AIGeneratorOptions['industry']>('general');
  const [aiTone, setAiTone] = useState<AIGeneratorOptions['tone']>('friendly');
  const [aiGeneratedResult, setAiGeneratedResult] = useState<{ title: string; body: string } | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Recommendation Category Filter
  const [recFilter, setRecFilter] = useState<string>('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const data = await DataStore.getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setBody('');
    setIsEditing(true);
  };

  const handleOpenEdit = (t: MessageTemplate) => {
    setEditingId(t.id);
    setTitle(t.title);
    setBody(t.body);
    setIsEditing(true);
  };

  const handleInsertVariable = (variable: string) => {
    setBody((prev) => `${prev} ${variable}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      alert('Judul dan isi template wajib diisi.');
      return;
    }

    if (editingId) {
      await DataStore.updateTemplate(editingId, {
        title: title.trim(),
        body: body.trim(),
      });
    } else {
      await DataStore.createTemplate({
        title: title.trim(),
        body: body.trim(),
      });
    }

    setIsEditing(false);
    loadTemplates();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus template pesan ini?')) {
      await DataStore.deleteTemplate(id);
      loadTemplates();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Add recommended template to My Templates with 1 click
  const handleAddRecommended = async (rec: TemplateRecommendation) => {
    await DataStore.createTemplate({
      title: rec.title,
      body: rec.body,
    });
    setAddedId(rec.id);
    setTimeout(() => setAddedId(null), 2500);
    await loadTemplates();
  };

  // Trigger AI Template Generation
  const handleGenerateAI = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const result = generateAITemplate({
        category: aiCategory,
        industry: aiIndustry,
        tone: aiTone,
      });
      setAiGeneratedResult(result);
      setIsAiGenerating(false);
    }, 400);
  };

  // Save AI Generated Template to Database
  const handleSaveAiTemplate = async () => {
    if (!aiGeneratedResult) return;
    await DataStore.createTemplate({
      title: aiGeneratedResult.title,
      body: aiGeneratedResult.body,
    });
    setIsAiModalOpen(false);
    setActiveTab('my_templates');
    await loadTemplates();
  };

  // Preview replacement using sample business
  const previewBody = body
    .replace(/{business_name}/g, 'Drg. Senyum Sehat Dental')
    .replace(/{rating}/g, '4.8')
    .replace(/{reviews_count}/g, '142')
    .replace(/{address}/g, 'Jl. Fatmawati No. 42, Jakarta Selatan')
    .replace(/{contact_phone}/g, '0812-9876-5432')
    .replace(/{app_url}/g, 'https://aplikasikita.com/coba-gratis');

  const filteredRecommendations = recFilter === 'all' 
    ? RECOMMENDED_TEMPLATES 
    : RECOMMENDED_TEMPLATES.filter((r) => r.category === recFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquareQuote className="w-7 h-7 text-emerald-600" />
            Template Pesan WhatsApp & AI Copywriting
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola template salam penawaran, gunakan rekomendasi siap pakai, atau generate kata-kata promosi dengan AI.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => {
              setIsAiModalOpen(true);
              if (!aiGeneratedResult) handleGenerateAI();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            ✨ AI Magic Generator
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tulis Manual
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('my_templates')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'my_templates'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquareQuote className="w-4 h-4" />
          Template Saya ({templates.length})
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'recommendations'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          Rekomendasi Siap Pakai ({RECOMMENDED_TEMPLATES.length})
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            Terbukti Closing
          </span>
        </button>
      </div>

      {/* TAB 1: Template Saya (Custom Templates) */}
      {activeTab === 'my_templates' && (
        <div className="space-y-6">
          {/* Manual Editor Modal / Form */}
          {isEditing && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-600" />
                  {editingId ? 'Edit Template Pesan' : 'Buat Template Baru'}
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Judul Template
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Cth: Penawaran Website Bisnis Tanpa Web"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Isi Pesan WhatsApp
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Klik variabel di bawah untuk menambahkan
                    </span>
                  </div>

                  {/* Variable Helper Pills */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[
                      { tag: '{business_name}', label: '+ Nama Bisnis' },
                      { tag: '{rating}', label: '+ Rating' },
                      { tag: '{reviews_count}', label: '+ Jumlah Ulasan' },
                      { tag: '{address}', label: '+ Alamat' },
                      { tag: '{app_url}', label: '+ Link Aplikasi' },
                      { tag: '{contact_phone}', label: '+ No WA Bantuan/CS' },
                    ].map((v) => (
                      <button
                        key={v.tag}
                        type="button"
                        onClick={() => handleInsertVariable(v.tag)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-medium transition-colors cursor-pointer"
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={6}
                    required
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Halo kak, salam kenal dari tim digital agency. Kami melihat {business_name} memiliki rating tinggi ({rating} ⭐)..."
                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                  />
                </div>

                {/* Live Preview Box */}
                {body && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <p className="font-semibold text-slate-600 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-blue-600" />
                      Pratinjau Pesan yang Diterima Klien:
                    </p>
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed font-sans bg-white p-3 rounded-lg border border-slate-200">
                      {previewBody}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Template
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Templates Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                Memuat template pesan...
              </div>
            ) : templates.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 space-y-3 bg-white p-8 rounded-2xl border border-slate-200">
                <MessageSquareQuote className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">Belum ada template tersimpan</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Anda bisa gunakan rekomendasi template siap pakai di tab atas atau generate langsung dengan AI.
                </p>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Lihat Rekomendasi Siap Pakai &rarr;
                </button>
              </div>
            ) : (
              templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs flex flex-col justify-between transition-all group space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {tmpl.title}
                      </h3>
                      <button
                        onClick={() => handleCopy(tmpl.body, tmpl.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                        title="Salin Isi Pesan"
                      >
                        {copiedId === tmpl.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed line-clamp-6 font-sans">
                      {tmpl.body}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {new Date(tmpl.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(tmpl)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Edit Template"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tmpl.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Rekomendasi Siap Pakai (Library Template Terbukti Closing) */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
            {[
              { id: 'all', label: 'Semua Rekomendasi' },
              { id: 'app_offer', label: '📱 Penawaran Aplikasi Kita' },
              { id: 'noweb', label: '🔥 Bisnis Tanpa Web' },
              { id: 'followup', label: '🤝 Follow Up' },
              { id: 'promo', label: '⏳ Promo & Urgensi' },
              { id: 'redesign', label: '🚀 Redesain Web' },
              { id: 'niche', label: '🎯 Khusus Industri (F&B / Klinik)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setRecFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer shrink-0 ${
                  recFilter === f.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs flex flex-col justify-between transition-all space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {rec.badge}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      {rec.categoryLabel}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1">{rec.title}</h3>
                  <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">{rec.description}</p>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans max-h-56 overflow-y-auto">
                    {rec.body}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(rec.body, rec.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedId === rec.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === rec.id ? 'Tersalin' : 'Salin'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddRecommended(rec)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    {addedId === rec.id ? <Check className="w-3.5 h-3.5 text-white" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                    {addedId === rec.id ? 'Tersimpan!' : 'Pakai Template Ini'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI MAGIC TEMPLATE GENERATOR MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI Copywriting Generator</h3>
                  <p className="text-xs text-slate-500">Ciptakan penawaran WhatsApp berkonversi tinggi dalam hitungan detik</p>
                </div>
              </div>

              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tujuan Penawaran:</label>
                  <select
                    value={aiCategory}
                    onChange={(e) => setAiCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
                  >
                    <option value="app_offer">📱 Penawaran Aplikasi Kita (Free Trial + Bantuan)</option>
                    <option value="new_web">Website Baru (Tanpa Web)</option>
                    <option value="redesign">Redesain & Upgrade Web</option>
                    <option value="followup">Follow Up Prospek</option>
                    <option value="promo">Promo Diskon Kilat</option>
                    <option value="consultation">Audit & Konsultasi Gratis</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Industri:</label>
                  <select
                    value={aiIndustry}
                    onChange={(e) => setAiIndustry(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
                  >
                    <option value="general">Umum / Semua Bisnis</option>
                    <option value="fnb">Kuliner / Resto / Cafe</option>
                    <option value="health">Klinik & Kesehatan</option>
                    <option value="service">Jasa / Salon / Bengkel</option>
                    <option value="property">Kos / Properti / Hotel</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gaya Bahasa / Tone:</label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
                  >
                    <option value="friendly">Ramah & Hangat (Casual)</option>
                    <option value="professional">Profesional & Sopan</option>
                    <option value="direct">To The Point (Singkat)</option>
                    <option value="urgent">Urgensi & Diskon (FOMO)</option>
                  </select>
                </div>
              </div>

              {/* Generate Action Button */}
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isAiGenerating}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isAiGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {isAiGenerating ? 'AI Sedang Merangkai Kata...' : '✨ Generate / Buat Ulang dengan AI'}
              </button>

              {/* Generated Result Box */}
              {aiGeneratedResult && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Hasil Copywriting AI:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(aiGeneratedResult.body, 'ai-res')}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'ai-res' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedId === 'ai-res' ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>

                  <p className="text-xs font-bold text-emerald-800">{aiGeneratedResult.title}</p>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans bg-white p-3.5 rounded-xl border border-slate-200">
                    {aiGeneratedResult.body}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>

              {aiGeneratedResult && (
                <button
                  type="button"
                  onClick={handleSaveAiTemplate}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/10 cursor-pointer"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  Simpan ke Template Saya
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
