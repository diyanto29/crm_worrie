'use client';

import React, { useRef } from 'react';
import { Download, ExternalLink, Printer, X, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  filename: string;
  title: string;
  subtitle?: string;
  loading?: boolean;
}

export default function PdfPreviewModal({
  isOpen,
  onClose,
  pdfUrl,
  filename,
  title,
  subtitle,
  loading = false
}: PdfPreviewModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNewTab = () => {
    if (!pdfUrl) return;
    window.open(pdfUrl, '_blank');
  };

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
      } catch {
        // Fallback open in new tab for print
        window.open(pdfUrl || '', '_blank');
      }
    } else {
      window.open(pdfUrl || '', '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/90 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#004a87] shrink-0 shadow-2xs">
              <FileText className="w-5 h-5 text-[#004a87]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                  {title}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Pure PDF
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-md mt-0.5">
                {subtitle || filename}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={loading || !pdfUrl}
              className="px-3.5 py-2 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Unduh file .PDF murni langsung ke komputer Anda"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh PDF</span>
            </button>

            <button
              onClick={handleOpenNewTab}
              disabled={loading || !pdfUrl}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Buka dokumen PDF di tab baru browser"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Tab Baru</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={loading || !pdfUrl}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Cetak dokumen PDF murni"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            <div className="w-[1px] h-6 bg-slate-200 mx-1 hidden sm:block" />

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Pure PDF Viewer */}
        <div className="flex-1 bg-slate-100/90 relative overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
              <div className="w-12 h-12 border-3 border-blue-200 border-t-[#004a87] rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">Menyusun Dokumen PDF Murni...</p>
                <p className="text-xs text-slate-500 mt-1">Mengonversi tabel, kop surat Worrie.id, dan tanda tangan digital</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              ref={iframeRef}
              src={`${pdfUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full border-0 bg-slate-200/50"
              title={title}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
              <FileText className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">Gagal memuat pratinjau dokumen PDF</p>
              <p className="text-xs text-slate-400">Silakan coba buat ulang atau hubungi administrator</p>
            </div>
          )}
        </div>

        {/* Bottom Status Info */}
        <div className="px-5 py-2.5 bg-white border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Dokumen resmi terverifikasi CRM PT Working Remotely Indonesia</span>
          </div>
          <span className="font-mono text-slate-400 text-[10px]">Pure PDF / A4 Format</span>
        </div>
      </div>
    </div>
  );
}
