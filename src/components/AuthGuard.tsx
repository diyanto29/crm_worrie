'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Compass, Loader2, ShieldAlert, LogOut } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();

  useEffect(() => {
    // Jika Supabase aktif dan sudah selesai load tapi user belum login
    if (!loading && isSupabaseConfigured && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Sedang memeriksa status sesi
  if (loading && isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-4">
        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-md mb-3 animate-pulse">
          <img src="/logo.png" alt="Worrie.id" className="h-12 w-auto object-contain" />
        </div>
        <p className="text-sm font-extrabold text-slate-900 tracking-tight">Working Remotely Indonesia</p>
        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#004a87]" />
          Memverifikasi sesi akun Google...
        </p>
      </div>
    );
  }

  // Jika belum login, tahan render agar tidak bocor tampilan dashboard
  if (!user && isSupabaseConfigured) {
    return null;
  }

  // Jika akun pengguna telah dinonaktifkan oleh Administrator
  if (profile && profile.is_active === false) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white">Akses Akun Dinonaktifkan</h1>
        <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
          Akun Anda (<b>{profile.email || user?.email}</b>) telah dinonaktifkan oleh Administrator tim Working Remotely Indonesia. Silakan hubungi admin untuk mengaktifkan kembali akses Anda.
        </p>
        <button
          onClick={() => signOut()}
          className="mt-6 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
        >
          <LogOut className="w-4 h-4" />
          Keluar ke Halaman Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
