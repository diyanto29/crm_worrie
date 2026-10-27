'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  Pause, 
  Play, 
  Square,
  Sparkles,
  Users,
  MessageSquare,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Lead, MessageTemplate, LeadStatus } from '@/types/database';
import { DataStore } from '@/lib/dataStore';
import { calculateProspectScore } from '@/lib/score';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  templates: MessageTemplate[];
  onLeadsUpdated?: () => void;
}

export default function BroadcastModal({
  isOpen,
  onClose,
  leads,
  templates,
  onLeadsUpdated,
}: BroadcastModalProps) {
  // Config state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customBody, setCustomBody] = useState<string>('');
  const [filterTarget, setFilterTarget] = useState<'all' | 'uncontacted' | 'noweb' | 'hot'>('uncontacted');
  const [sendMode, setSendMode] = useState<'gateway' | 'web'>('gateway');
  const [safeDelaySec, setSafeDelaySec] = useState<number>(8); // 8 seconds safe delay default

  // Execution state
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Manual WhatsApp Web queue state
  const [manualQueueIndex, setManualQueueIndex] = useState(0);

  // Ref to cancel or pause broadcast
  const cancelRef = useRef(false);
  const pauseRef = useRef(false);

  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id);
      setCustomBody(templates[0].body);
    }
  }, [templates, selectedTemplateId]);

  const handleTemplateChange = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl) {
      setCustomBody(tmpl.body);
    }
  };

  // Filter the target leads
  const targetLeads = leads.filter((lead) => {
    // Must have a valid phone number
    if (!lead.phone || lead.phone.replace(/[^0-9]/g, '').length < 10) return false;

    if (filterTarget === 'uncontacted') {
      return lead.status === 'Belum dihubungi';
    }
    if (filterTarget === 'noweb') {
      return !lead.has_website;
    }
    if (filterTarget === 'hot') {
      const score = typeof lead.prospect_score === 'number' ? lead.prospect_score : calculateProspectScore(lead);
      return score >= 80;
    }
    return true;
  });

  const generateLeadMessage = (lead: Lead) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aplikasikita.com';
    return customBody
      .replace(/{business_name}/g, lead.business_name)
      .replace(/{rating}/g, String(lead.rating || ''))
      .replace(/{reviews_count}/g, String(lead.reviews_count || ''))
      .replace(/{address}/g, lead.address || '')
      .replace(/{app_url}/g, origin)
      .replace(/{contact_phone}/g, '0812-3456-7890');
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Start Automated Gateway Broadcast
  const handleStartGatewayBroadcast = async () => {
    if (targetLeads.length === 0) {
      alert('Tidak ada kontak yang cocok dengan filter target.');
      return;
    }

    if (!customBody.trim()) {
      alert('Isi pesan broadcast tidak boleh kosong.');
      return;
    }

    cancelRef.current = false;
    pauseRef.current = false;
    setIsBroadcasting(true);
    setIsPaused(false);
    setIsCompleted(false);
    setSentCount(0);
    setFailedCount(0);
    setCurrentIndex(0);
    setLogs([]);

    addLog(`Memulai broadcast ke ${targetLeads.length} kontak dengan jeda aman ${safeDelaySec} detik.`);

    for (let i = 0; i < targetLeads.length; i++) {
      if (cancelRef.current) {
        addLog('Broadcast dihentikan oleh pengguna.');
        break;
      }

      // Check pause
      while (pauseRef.current) {
        await delay(500);
        if (cancelRef.current) break;
      }
      if (cancelRef.current) break;

      const lead = targetLeads[i];
      setCurrentIndex(i + 1);
      const personalizedMsg = generateLeadMessage(lead);

      addLog(`Mengirim ke: ${lead.business_name} (${lead.phone})...`);

      try {
        const res = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: lead.phone,
            message: personalizedMsg,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setSentCount((c) => c + 1);
          addLog(`✅ Terkirim ke ${lead.business_name}`);
          // Update status in data store
          await DataStore.updateLead(lead.id, { status: 'Dihubungi' });
        } else {
          setFailedCount((c) => c + 1);
          addLog(`❌ Gagal: ${data.error || 'Server menolak'}`);
        }
      } catch (err: any) {
        setFailedCount((c) => c + 1);
        addLog(`❌ Error koneksi ke ${lead.business_name}`);
      }

      // If not last contact, wait for safe delay + random jitter
      if (i < targetLeads.length - 1 && !cancelRef.current) {
        const jitter = Math.floor(Math.random() * 3) - 1; // +/- 1 second random variation
        const waitTime = Math.max(3, safeDelaySec + jitter);
        addLog(`⏳ Menunggu jeda aman anti-banned (${waitTime}s)...`);
        await delay(waitTime * 1000);
      }
    }

    setIsBroadcasting(false);
    setIsCompleted(true);
    addLog('🎉 Selesai! Seluruh antrean broadcast telah diproses.');
    if (onLeadsUpdated) {
      onLeadsUpdated();
    }
  };

  // Manual WhatsApp Web 1-Click Send
  const handleSendManualCurrent = async () => {
    if (manualQueueIndex >= targetLeads.length) return;
    const lead = targetLeads[manualQueueIndex];
    const cleanPhone = lead.phone?.replace(/[^0-9]/g, '') || '';
    const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const message = generateLeadMessage(lead);
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp Web in new tab
    window.open(waUrl, '_blank');

    // Update status to Dihubungi
    await DataStore.updateLead(lead.id, { status: 'Dihubungi' });
    setSentCount((c) => c + 1);
    setManualQueueIndex((i) => i + 1);
    if (onLeadsUpdated) {
      onLeadsUpdated();
    }
  };

  const handlePauseToggle = () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    pauseRef.current = nextState;
    if (nextState) {
      addLog('⏸️ Broadcast dijeda.');
    } else {
      addLog('▶️ Broadcast dilanjutkan.');
    }
  };

  const handleCancel = () => {
    if (confirm('Yakin ingin membatalkan broadcast yang sedang berjalan?')) {
      cancelRef.current = true;
      setIsBroadcasting(false);
      addLog('🛑 Broadcast dibatalkan.');
    }
  };

  if (!isOpen) return null;

  const currentManualLead = targetLeads[manualQueueIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Broadcast WhatsApp Massal
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Anti-Banned Ready
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kirim penawaran personal otomatis ke prospek dengan jeda waktu aman
              </p>
            </div>
          </div>

          {!isBroadcasting && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* While broadcasting: Show Live Progress */}
          {isBroadcasting || isCompleted ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Progress Bar & Status */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                    )}
                    {isCompleted
                      ? 'Proses Broadcast Selesai!'
                      : isPaused
                      ? 'Broadcast Dijeda'
                      : `Mengirim pesan (${currentIndex} dari ${targetLeads.length})...`}
                  </span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {Math.round((currentIndex / Math.max(1, targetLeads.length)) * 100)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                    style={{ width: `${Math.round((currentIndex / Math.max(1, targetLeads.length)) * 100)}%` }}
                  />
                </div>

                {/* Counter Badges */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Terkirim</span>
                    <p className="font-bold text-emerald-700 text-sm mt-0.5">{sentCount}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Gagal</span>
                    <p className="font-bold text-rose-700 text-sm mt-0.5">{failedCount}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Sisa Antrean</span>
                    <p className="font-bold text-slate-700 text-sm mt-0.5">{Math.max(0, targetLeads.length - currentIndex)}</p>
                  </div>
                </div>
              </div>

              {/* Realtime Terminal / Log Box */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] space-y-1 max-h-44 overflow-y-auto shadow-inner">
                {logs.map((log, i) => (
                  <p key={i} className={log.includes('❌') ? 'text-rose-400' : log.includes('✅') ? 'text-emerald-400' : 'text-slate-300'}>
                    {log}
                  </p>
                ))}
              </div>

              {/* Action Buttons while active */}
              <div className="flex items-center justify-between pt-2">
                {!isCompleted ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePauseToggle}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      {isPaused ? 'Lanjutkan' : 'Jeda'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-colors cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5" />
                      Hentikan
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    Selesai & Tutup Jendela
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Setup Configuration Screen */
            <div className="space-y-5">
              {/* Target Audience Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  1. Pilih Target Penerima Pesan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'uncontacted', label: 'Belum Dihubungi', count: leads.filter((l) => l.status === 'Belum dihubungi').length },
                    { id: 'noweb', label: 'Tanpa Website', count: leads.filter((l) => !l.has_website).length },
                    { id: 'hot', label: 'Hot Prospek (≥80%)', count: leads.filter((l) => (l.prospect_score || calculateProspectScore(l)) >= 80).length },
                    { id: 'all', label: 'Semua Kontak', count: leads.length },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFilterTarget(t.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        filterTarget === t.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white'
                      }`}
                    >
                      <span className="block text-[11px] truncate">{t.label}</span>
                      <span className="text-base font-extrabold block mt-0.5 font-mono">{t.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  2. Pilih Metode Broadcast:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setSendMode('gateway')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      sendMode === 'gateway'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Otomatis via API Gateway
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                      Mengirim satu per satu di latar belakang secara otomatis dengan jeda aman anti-banned.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSendMode('web')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      sendMode === 'web'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      Antrean WhatsApp Web (1-Klik)
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                      Gratis tanpa API key. Klik dan browser akan membuka WhatsApp Web dengan teks yang sudah terisi.
                    </p>
                  </button>
                </div>
              </div>

              {/* Safe Delay configuration (for Gateway mode) */}
              {sendMode === 'gateway' && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">Jeda Waktu Aman (Anti-Banned):</span>
                      <p className="text-[11px] text-slate-500">Mencegah nomor WhatsApp terblokir akibat spam</p>
                    </div>
                  </div>
                  <select
                    value={safeDelaySec}
                    onChange={(e) => setSafeDelaySec(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-semibold text-slate-800 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value={5}>5 Detik (Cepat)</option>
                    <option value={8}>8 Detik (Rekomendasi Aman)</option>
                    <option value={12}>12 Detik (Sangat Aman)</option>
                    <option value={15}>15 Detik (Maksimal)</option>
                  </select>
                </div>
              )}

              {/* Template Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  3. Pilih Template Pesan:
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message preview and editor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Isi Pesan (Variabel otomatis personal):</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Tersedia: {'{business_name}'}, {'{rating}'}, {'{address}'}
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                />
              </div>

              {/* Sample Preview */}
              {targetLeads.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 text-xs space-y-1">
                  <p className="font-semibold text-slate-500 text-[10px] uppercase">
                    Pratinjau Pesan yang Diterima ({targetLeads[0].business_name}):
                  </p>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-sans bg-white p-2.5 rounded-lg border border-slate-200">
                    {generateLeadMessage(targetLeads[0])}
                  </p>
                </div>
              )}

              {/* Manual Queue Action Box (If mode is WhatsApp Web) */}
              {sendMode === 'web' && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-900">
                      Antrean Manual: {manualQueueIndex} dari {targetLeads.length} Terkirim
                    </span>
                    <span className="font-mono text-blue-700 font-bold">
                      {Math.round((manualQueueIndex / Math.max(1, targetLeads.length)) * 100)}%
                    </span>
                  </div>

                  {currentManualLead ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-blue-200/80">
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{currentManualLead.business_name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{currentManualLead.phone}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSendManualCurrent}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Kirim Pesan Ini &rarr;
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-blue-800 font-semibold text-center py-2">
                      🎉 Seluruh antrean kontak telah selesai dibuka di WhatsApp!
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isBroadcasting && !isCompleted && (
          <div className="p-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Total <strong>{targetLeads.length} kontak</strong> siap menerima broadcast.
            </span>

            {sendMode === 'gateway' ? (
              <button
                type="button"
                onClick={handleStartGatewayBroadcast}
                disabled={targetLeads.length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/10 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Mulai Broadcast Otomatis ({targetLeads.length})
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Tutup
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
