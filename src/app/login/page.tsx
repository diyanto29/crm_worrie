'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { 
  ShieldCheck, 
  School, 
  Users, 
  GraduationCap, 
  Briefcase,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  FileText,
  Building2,
  Laptop
} from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, signInWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    try {
      setSubmitting(true);
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
      {/* LEFT SIDE: Brand Showcase & Corporate Identity (Navy & Yellow Accent) */}
      <div className="lg:w-1/2 bg-linear-to-br from-[#003058] via-[#004a87] to-[#002240] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle Ambient Decorative Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Brand Logo */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 shadow-sm">
            <img 
              src="/logo.png" 
              alt="Working Remotely Indonesia Logo" 
              className="h-10 w-10 object-contain rounded-xl bg-white p-1"
            />
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block leading-tight">Worrie.id</span>
              <span className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider block">Working Remotely ID</span>
            </div>
          </div>
        </div>

        {/* Center Content: Headline & Pillars */}
        <div className="my-10 lg:my-0 space-y-6 relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Education &bull; Digital Skills &bull; Career
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
            Mempersiapkan Talenta Indonesia untuk Dunia Kerja Digital.
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
            Platform CRM dan manajemen kemitraan terpadu untuk mengelola kolaborasi <b>B2B Institusi Pendidikan</b> (SMK, Kampus) serta program kesiapan karir <b>B2C Talenta Muda</b>.
          </p>

          {/* Interactive Feature Cards Showcase */}
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Kemitraan Sekolah & Kampus (B2B)</p>
                  <p className="text-[11px] text-blue-100/80">Seminar karir, workshop skill digital, dan MoU kurikulum</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 shrink-0">
                Pipeline Aktif
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Pelatihan Kerja Remote & Skill (B2C)</p>
                  <p className="text-[11px] text-blue-100/80">Content creation, virtual assistant, copywriting, portofolio</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                Talenta Digital
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Stat */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-blue-200 relative z-10">
          <span>&copy; {new Date().getFullYear()} Working Remotely Indonesia</span>
          <span className="flex items-center gap-1.5 font-medium text-amber-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Sistem Internal Terverifikasi
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: Clean Light Login Interface */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white relative">
        <div className="w-full max-w-md space-y-8">
          {/* Header Mobile Brand (Only shown on small screens) */}
          <div className="lg:hidden text-center space-y-2 pb-2">
            <img 
              src="/logo.png" 
              alt="Worrie.id" 
              className="h-14 w-14 mx-auto object-contain rounded-2xl bg-slate-50 p-1 border border-slate-200 shadow-xs" 
            />
            <h2 className="text-xl font-extrabold text-slate-900">Working Remotely Indonesia</h2>
            <p className="text-xs text-[#004a87] font-bold uppercase tracking-wider">Worrie.id CRM Platform</p>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#004a87] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block">
              Portal Akses Staf
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              Masuk menggunakan akun Google (Gmail) resmi Anda untuk mengakses dashboard kemitraan dan prospek.
            </p>
          </div>

          {/* Error Banner */}
          {errorParam && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-bold">Otentikasi Gagal</p>
                <p className="mt-0.5 text-rose-600">
                  {errorParam === 'account_deactivated'
                    ? 'Akun Anda telah dinonaktifkan oleh Administrator. Hubungi admin untuk informasi lebih lanjut.'
                    : errorParam === 'unauthorized_admin_only'
                    ? 'Akses dibatasi hanya untuk Administrator. Silakan login dengan akun yang memiliki hak akses.'
                    : 'Gagal memverifikasi akun Google. Silakan klik tombol di bawah untuk mencoba kembali.'}
                </p>
              </div>
            </div>
          )}

          {/* Main Action: Google SSO Button */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={submitting || loading}
              className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm sm:text-base flex items-center justify-center gap-3.5 border-2 border-slate-200 hover:border-[#004a87] transition-all transform active:scale-[0.99] shadow-sm hover:shadow-md disabled:opacity-60 cursor-pointer group"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#004a87]" />
                  <span className="text-[#004a87]">Menghubungkan ke Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span className="text-slate-800 group-hover:text-slate-950 font-bold">Lanjutkan dengan Akun Google</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#004a87] group-hover:translate-x-1 transition-all ml-auto" />
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400">
              Sistem otomatis menyinkronkan nama dan foto avatar dari akun Google Anda.
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Fitur Pengelolaan Internal
            </span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          {/* Value Props Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <p className="font-bold text-slate-900">Multi-Kontak PIC</p>
              <p className="text-[11px] text-slate-500">Kepala Sekolah, Guru BK, Humas</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#004a87] flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <p className="font-bold text-slate-900">Quotation Kerjasama</p>
              <p className="text-[11px] text-slate-500">Proposal seminar & workshop</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="font-bold text-slate-900">Timeline 360° View</p>
              <p className="text-[11px] text-slate-500">Audit trail aktivitas & follow-up</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="font-bold text-slate-900">Akses Tim Aman</p>
              <p className="text-[11px] text-slate-500">Role Admin vs Marketing</p>
            </div>
          </div>

          {/* Footer Assistance */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-1 text-xs text-slate-500">
            <p>
              Perlu bantuan akun? Hubungi Admin di <a href="mailto:halo@worrie.id" className="text-[#004a87] font-bold hover:underline">halo@worrie.id</a>
            </p>
            <p className="text-[10px] text-slate-400">
              Dilindungi oleh Supabase Auth Enterprise &bull; Enkripsi End-to-End
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">Memuat portal Worrie.id...</div>}>
      <LoginForm />
    </Suspense>
  );
}
