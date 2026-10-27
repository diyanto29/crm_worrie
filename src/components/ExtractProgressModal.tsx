import React from 'react';
import { Loader2, CheckCircle2, Globe, Phone, MapPin, Sparkles, Check } from 'lucide-react';
import { Lead, CampaignProspect } from '@/types/database';

interface ExtractProgressModalProps {
  isOpen: boolean;
  progress: number; // 0 - 100
  statusMessage: string;
  foundLeads: Array<Partial<Lead> | Partial<CampaignProspect>>;
  isDone: boolean;
  onClose: () => void;
}

export default function ExtractProgressModal({
  isOpen,
  progress,
  statusMessage,
  foundLeads,
  isDone,
  onClose,
}: ExtractProgressModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700 animate-pulse'}`}>
              {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Loader2 className="w-6 h-6 animate-spin" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {isDone ? 'Ekstraksi Selesai!' : 'Sedang Mengekstrak Data Google Maps'}
                {!isDone && <Sparkles className="w-4 h-4 text-amber-500 animate-bounce" />}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{statusMessage}</p>
            </div>
          </div>
          <span className="text-sm font-mono font-bold px-2.5 py-1 rounded-md bg-white text-emerald-700 border border-slate-200 shadow-2xs">
            {progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Realtime Discovered Leads Feed */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2.5 min-h-[220px]">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>Prospek Terverifikasi WhatsApp ({foundLeads.length})</span>
            </span>
            <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              WA Aktif Only
            </span>
          </p>

          {foundLeads.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-2" />
              Menghubungi Google Maps & memvalidasi nomor WhatsApp...
            </div>
          ) : (
            foundLeads.map((lead, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-all flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <p className="font-bold text-slate-900 text-sm truncate">{lead.business_name}</p>
                  <p className="text-slate-500 truncate flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{lead.address || 'Alamat terdeteksi'}</span>
                  </p>
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-600 flex-wrap pt-0.5">
                    {lead.phone && (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        {lead.phone}
                      </span>
                    )}
                    {lead.rating && (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11px]">
                        ★ {lead.rating} <span className="text-slate-400 font-normal">({lead.reviews_count || 0})</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  {lead.has_website ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      <Globe className="w-2.5 h-2.5" />
                      Ada Web
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Tanpa Web
                    </span>
                  )}
                  {(() => {
                    const score = typeof lead.prospect_score === 'number' ? lead.prospect_score : (lead.has_website ? 65 : 95);
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                        🔥 {score}%
                      </span>
                    );
                  })()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {isDone
              ? `Berhasil mendapatkan ${foundLeads.length} prospek ber-WhatsApp valid!`
              : 'Memfilter nomor telp agar hanya menyimpan WA valid...'}
          </p>
          <button
            onClick={onClose}
            disabled={!isDone}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs ${
              isDone
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-600/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isDone ? 'Buka Hasil Ekstraksi' : 'Memproses...'}
          </button>
        </div>
      </div>
    </div>
  );
}
