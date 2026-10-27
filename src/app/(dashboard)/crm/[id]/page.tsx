'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  MessageSquare, 
  Globe, 
  MapPin, 
  Phone, 
  ExternalLink, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  Send, 
  Loader2, 
  Sparkles,
  Flame
} from 'lucide-react';
import { DataStore } from '@/lib/dataStore';
import { Lead, LeadStatus, MessageTemplate } from '@/types/database';
import { calculateProspectScore, getProspectScoreBadge } from '@/lib/score';

function LeadDetailContent() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form Fields
  const [status, setStatus] = useState<LeadStatus>('Belum dihubungi');
  const [dealValue, setDealValue] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // WhatsApp Message Composer
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [sendingGateway, setSendingGateway] = useState(false);
  const [gatewayResult, setGatewayResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [leadData, tmplData] = await Promise.all([
          DataStore.getLeadById(leadId),
          DataStore.getTemplates(),
        ]);
        if (leadData) {
          setLead(leadData);
          setStatus(leadData.status);
          setDealValue(Number(leadData.deal_value) || 0);
          setNotes(leadData.notes || '');

          if (tmplData.length > 0) {
            setTemplates(tmplData);
            setSelectedTemplateId(tmplData[0].id);
            // Prepare initial message
            const generated = tmplData[0].body
              .replace(/{business_name}/g, leadData.business_name)
              .replace(/{rating}/g, String(leadData.rating || ''))
              .replace(/{reviews_count}/g, String(leadData.reviews_count || ''))
              .replace(/{address}/g, leadData.address || '');
            setCustomMessage(generated);
          }
        }
      } catch (err) {
        console.error('Failed to load lead details', err);
      } finally {
        setLoading(false);
      }
    }
    if (leadId) {
      loadData();
    }
  }, [leadId]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl && lead) {
      const generated = tmpl.body
        .replace(/{business_name}/g, lead.business_name)
        .replace(/{rating}/g, String(lead.rating || ''))
        .replace(/{reviews_count}/g, String(lead.reviews_count || ''))
        .replace(/{address}/g, lead.address || '');
      setCustomMessage(generated);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const updated = await DataStore.updateLead(lead.id, {
        status,
        deal_value: Number(dealValue),
        notes,
      });
      if (updated) {
        setLead(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert('Gagal menyimpan perubahan prospek.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    if (confirm(`Yakin ingin menghapus prospek "${lead.business_name}"?`)) {
      await DataStore.deleteLead(lead.id);
      router.push('/crm');
    }
  };

  // Send WhatsApp via API Gateway
  const handleSendViaGateway = async () => {
    if (!lead?.phone) {
      alert('Nomor telepon prospek tidak tersedia.');
      return;
    }
    setSendingGateway(true);
    setGatewayResult(null);

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: lead.phone,
          message: customMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGatewayResult({
          success: true,
          message: data.message || 'Pesan berhasil diproses oleh gateway!',
        });
        // Automatically advance status to "Dihubungi" if it was "Belum dihubungi"
        if (status === 'Belum dihubungi') {
          setStatus('Dihubungi');
          await DataStore.updateLead(lead.id, { status: 'Dihubungi' });
        }
      } else {
        setGatewayResult({
          success: false,
          message: data.error || 'Gagal mengirim pesan melalui gateway.',
        });
      }
    } catch (err: any) {
      setGatewayResult({
        success: false,
        message: err?.message || 'Koneksi ke gateway gagal.',
      });
    } finally {
      setSendingGateway(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Memuat detail prospek...</div>;
  }

  if (!lead) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-slate-500">Prospek tidak ditemukan atau telah dihapus.</p>
        <Link href="/crm" className="text-emerald-600 hover:underline text-sm inline-block font-semibold">
          &larr; Kembali ke Pipeline CRM
        </Link>
      </div>
    );
  }

  const cleanPhone = lead.phone?.replace(/[^0-9]/g, '') || '';
  const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
  const directWaUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(customMessage)}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/crm"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
            title="Kembali ke CRM"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Detail Prospek</span>
              <span className="text-slate-300">&bull;</span>
              <span className="text-xs text-emerald-600 font-mono font-semibold">{lead.id.slice(0, 8)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
              {lead.business_name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
            title="Hapus Prospek"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Business Overview & CRM Management Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Business Metadata & Prospect Potential */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
            {/* Prospect Score Highlight */}
            {(() => {
              const score = typeof lead.prospect_score === 'number' ? lead.prospect_score : calculateProspectScore(lead);
              const meta = getProspectScoreBadge(score);
              return (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">Skor Potensi Prospek:</span>
                      <span className="text-xl font-extrabold text-emerald-700 font-mono">{score}%</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}>
                      {meta.tag}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                    <div className={`h-full rounded-full ${meta.barColor}`} style={{ width: `${score}%` }} />
                  </div>
                  {/* Scoring Reasons Breakdown Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                    {!lead.has_website ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                        +40% Belum Memiliki Website
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                        +15% Potensi Redesain Web
                      </span>
                    )}
                    {lead.phone && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                        +25% WhatsApp Aktif
                      </span>
                    )}
                    {Number(lead.rating) >= 4.0 && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 font-medium">
                        +15% Reputasi Rating Tinggi
                      </span>
                    )}
                    {Number(lead.reviews_count) >= 10 && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 font-medium">
                        +10% Review Aktif ({lead.reviews_count})
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Informasi Bisnis Google Maps
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Alamat Lengkap</span>
                <p className="text-slate-700 flex items-start gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  {lead.address || 'Alamat tidak tersedia'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Nomor WhatsApp / Telp</span>
                <p className="text-emerald-700 flex items-center gap-1.5 font-mono font-bold text-sm">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  {lead.phone || 'Tidak ada nomor'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Status Website</span>
                <div className="pt-0.5">
                  {lead.has_website ? (
                    <a
                      href={lead.website_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {lead.website_url || 'Website Terdeteksi'}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Belum Memiliki Website Resmi
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Ulasan & Rating</span>
                <p className="text-amber-600 font-bold flex items-center gap-1 text-sm">
                  ★ {lead.rating || 'N/A'} <span className="text-slate-500 font-normal text-xs">({lead.reviews_count || 0} reviews)</span>
                </p>
              </div>
            </div>

            {lead.gmaps_url && (
              <a
                href={lead.gmaps_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Lihat Lokasi di Google Maps Asli <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Form: CRM Deal Status & Notes */}
          <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Manajemen Status & Nilai Deal
              </h2>
              {saveSuccess && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tahapan Status CRM
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
                >
                  <option value="Belum dihubungi">Belum dihubungi</option>
                  <option value="Dihubungi">Dihubungi</option>
                  <option value="Follow Up">Follow Up</option>
                  <option value="Closing">Closing</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Estimasi Nilai Transaksi (IDR)
                </label>
                <input
                  type="number"
                  value={dealValue}
                  onChange={(e) => setDealValue(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Catatan Prospek & Riwayat Negosiasi
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tuliskan catatan hasil diskusi, penawaran harga, janji follow-up..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-400 leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/10 disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: WhatsApp Outreach Composer */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Composer WhatsApp</h3>
                <p className="text-xs text-slate-500">Kirim penawaran personal dengan cepat</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pilih Template Pesan:
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Isi Pesan (Bisa diedit sebelum dikirim):
              </label>
              <textarea
                rows={8}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
              />
            </div>

            {/* Gateway Result Alert */}
            {gatewayResult && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  gatewayResult.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {gatewayResult.message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              {lead.phone ? (
                <>
                  <a
                    href={directWaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/10 cursor-pointer text-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Buka WhatsApp Web / Aplikasi
                  </a>

                  <button
                    type="button"
                    onClick={handleSendViaGateway}
                    disabled={sendingGateway}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {sendingGateway ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-emerald-600" />}
                    Kirim via API Gateway (Otomatis)
                  </button>
                </>
              ) : (
                <div className="p-3 text-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs">
                  Nomor WhatsApp tidak tersedia untuk bisnis ini.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeadDetailPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500 text-sm">Memuat detail prospek...</div>}>
      <LeadDetailContent />
    </Suspense>
  );
}
