'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Search, 
  Users, 
  MessageSquareQuote, 
  Settings, 
  Menu, 
  X,
  Compass,
  CheckCircle2,
  Database,
  Smartphone,
  Lock
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { lockWorkspace } from '@/components/PinProtection';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Kampanye & Scraper', href: '/projects', icon: Search },
  { name: 'Pipeline CRM', href: '/crm', icon: Users },
  { name: 'Template Pesan', href: '/templates', icon: MessageSquareQuote },
  { name: 'Pengaturan Gateway', href: '/settings', icon: Settings },
];

function SidebarInner() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base">Gmap Prospek</span>
            <span className="text-[10px] text-emerald-700 ml-1.5 px-1.5 py-0.5 rounded bg-emerald-100 font-medium">CRM</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out shadow-xs lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">Gmap Prospek</span>
              </div>
              <p className="text-xs text-slate-500">Tools Leads & CRM WhatsApp</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Status Indicator */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              Database:
            </span>
            {isSupabaseConfigured ? (
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Supabase Aktif
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-700 font-semibold" title="Data tersimpan di browser (Local Storage)">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Local Mode
              </span>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* PWA / Mobile Banner footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
          <button
            onClick={() => {
              if (confirm('Kunci workspace sekarang?')) {
                lockWorkspace();
              }
            }}
            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Kunci Layar Workspace
          </button>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-start gap-2.5">
              <Smartphone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-slate-800">Aplikasi PWA Siap</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Dapat di-install di HP Android/iOS via menu browser <i>"Add to Home Screen"</i>.
                </p>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-400">
            v1.0.0 &bull; Next.js + Supabase + PWA
          </p>
        </div>
      </aside>
    </>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 hidden lg:block" />}>
      <SidebarInner />
    </Suspense>
  );
}
