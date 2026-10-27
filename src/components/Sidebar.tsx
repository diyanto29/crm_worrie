'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Users,
  FileSpreadsheet,
  CheckSquare,
  MessageSquareQuote,
  Settings,
  Menu,
  X,
  Compass,
  UserCheck,
  LogOut,
  Sparkles,
  LogIn,
  Building2,
  Kanban,
  Bell,
  MessageSquare,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Layers,
  Calendar,
  Sun,
  Moon,
  ShieldCheck,
  Check,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { useSidebar } from '@/lib/sidebarContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  badge?: number;
  badgeColor?: string;
}

const mainNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Database Leads', href: '/leads', icon: Building2 },
  { name: 'Pipeline CRM', href: '/crm', icon: Kanban },
  { name: 'Kampanye & Scraper', href: '/projects', icon: Compass },
  { name: 'Penawaran & MoU', href: '/quotations', icon: FileSpreadsheet },
  { name: 'Agenda Follow-Up', href: '/tasks', icon: Calendar },
  { name: 'Laporan & Analitik', href: '/reports', icon: BarChart3 },
];

const accountNavItems: NavItem[] = [
  { name: 'Template Pesan', href: '/templates', icon: MessageSquareQuote },
  { name: 'Manajemen Tim', href: '/team', icon: UserCheck, adminOnly: true },
  { name: 'Pengaturan Gateway', href: '/settings', icon: Settings, adminOnly: true },
];

function SidebarInner() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { user, profile, signOut } = useAuth();
  const {
    isCollapsed,
    toggleCollapsed,
    sidebarTheme,
    toggleTheme
  } = useSidebar();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
  const isNavy = sidebarTheme === 'navy';

  // Close profile popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileMenuOpen]);

  const filteredMain = mainNavItems.filter((i) => !i.adminOnly || isAdmin);
  const filteredAccount = accountNavItems.filter((i) => !i.adminOnly || isAdmin);

  return (
    <>
      {/* =========================================================================
          MOBILE TOP NAVBAR (< lg screen)
      ========================================================================== */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40 shadow-xs">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="p-1 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
            <img src="/logo.png" alt="Worrie.id" className="h-7 w-auto object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm">Worrie.id</span>
              <span className="text-[10px] text-slate-400 font-medium">v1.0</span>
            </div>
            <span className="text-[10px] text-[#004a87] font-semibold block leading-tight">Working Remotely ID</span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 cursor-pointer transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* =========================================================================
          FLOATING PILL SIDEBAR (Desktop & Mobile Drawer)
      ========================================================================== */}
      <aside
        className={`fixed z-50 transition-all duration-300 ease-in-out flex flex-col ${
          // Desktop positioning: floating card with margin
          'lg:top-3.5 lg:bottom-3.5 lg:left-3.5'
          } ${
          // Mobile positioning: slide-out drawer
          mobileOpen
            ? 'top-2 bottom-2 left-2 right-2 w-auto translate-x-0'
            : 'max-lg:-translate-x-full max-lg:top-0 max-lg:bottom-0 max-lg:left-0 max-lg:w-72'
          } ${
          // Desktop collapsed width vs expanded width
          isCollapsed ? 'lg:w-[76px]' : 'lg:w-[272px]'
          }`}
      >
        <div
          className={`h-full w-full rounded-[30px] flex flex-col justify-between transition-colors duration-300 relative select-none ${isNavy
            ? 'bg-[#004a87] text-white border border-blue-400/20 shadow-2xl shadow-blue-950/30'
            : 'bg-white text-slate-900 border border-slate-200/90 shadow-xl shadow-slate-200/50'
            }`}
        >
          {/* =====================================================================
              TOP SECTION: Mac Traffic Light Dots + Brand + Toggle Switcher
          ====================================================================== */}
          <div className="p-4 sm:p-5 pb-2 shrink-0">
            {/* macOS 3 Traffic Light Dots (Interactive!) */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <span
                  onClick={toggleCollapsed}
                  className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] hover:opacity-75 transition-opacity cursor-pointer inline-block"
                  title={isCollapsed ? 'Perbesar Sidebar' : 'Kecilkan Sidebar'}
                />
                <span
                  onClick={toggleTheme}
                  className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] hover:opacity-75 transition-opacity cursor-pointer inline-block"
                  title={`Ganti Tema: ${isNavy ? 'Putih Bersih' : 'Royal Navy Blue'}`}
                />
                <span
                  onClick={() => router.push('/')}
                  className="w-2.5 h-2.5 rounded-full bg-[#27c93f] hover:opacity-75 transition-opacity cursor-pointer inline-block"
                  title="Ke Halaman Utama (Dashboard)"
                />
              </div>

              {/* Collapsed / Expand Action Toggle Button */}
              <button
                onClick={toggleCollapsed}
                className={`hidden lg:flex p-1 rounded-lg transition-colors cursor-pointer ${isNavy
                  ? 'text-white/60 hover:text-white hover:bg-white/10'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Brand Title Row with Official Worrie Logo */}
            {!isCollapsed ? (
              <div className="flex items-center justify-between gap-2 mb-2">
                <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
                  <div className={`p-1 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 border ${isNavy ? 'bg-white border-white/20 shadow-xs' : 'bg-slate-50 border-slate-200/90 shadow-xs'
                    }`}>
                    <img src="/logo.png" alt="Worrie.id" className="h-7 w-auto object-contain" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="font-black text-sm tracking-tight truncate">Worrie.id</span>
                      <span className={`text-[10px] font-semibold ${isNavy ? 'text-blue-200' : 'text-slate-400'}`}>v1.0</span>
                    </div>
                    <span className={`text-[10px] font-medium block truncate mt-0.5 ${isNavy ? 'text-blue-200/80' : 'text-slate-500'}`}>
                      Working Remotely ID
                    </span>
                  </div>
                </Link>

                {/* Quick Search Trigger */}
                <button
                  onClick={() => router.push('/leads')}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${isNavy
                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  title="Cari Leads atau Menu"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Collapsed Centered Brand & Search */
              <div className="flex flex-col items-center gap-2.5 mb-2">
                <Link href="/" className="group" title="Worrie.id CRM v1.0">
                  <div className={`p-1.5 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 border ${isNavy ? 'bg-white border-white/20 shadow-xs' : 'bg-slate-50 border-slate-200/90 shadow-xs'
                    }`}>
                    <img src="/logo.png" alt="Worrie.id" className="h-6 w-auto object-contain" />
                  </div>
                </Link>
                <button
                  onClick={() => router.push('/leads')}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${isNavy
                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  title="Cari Leads"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* =====================================================================
              MIDDLE NAVIGATION LIST (Main Items & Account Items)
          ====================================================================== */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin">
            {/* 1. Main Navigation Items */}
            <div className="space-y-1">
              {filteredMain.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={item.name}
                    className={`group relative flex items-center rounded-2xl transition-all duration-150 cursor-pointer ${isCollapsed
                      ? 'justify-center p-2.5 mx-auto w-11 h-11'
                      : 'gap-3 px-3.5 py-2.5'
                      } ${isActive
                        ? isNavy
                          ? 'text-white font-bold bg-white/15 shadow-2xs'
                          : 'text-slate-900 font-bold bg-slate-100/90 shadow-2xs'
                        : isNavy
                          ? 'text-white/70 hover:text-white hover:bg-white/10 font-medium'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                      }`}
                  >
                    <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive
                      ? isNavy ? 'text-white' : 'text-[#004a87]'
                      : isNavy ? 'text-white/60 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'
                      }`} />

                    {!isCollapsed && (
                      <span className="text-xs truncate tracking-tight">
                        {item.name}
                      </span>
                    )}

                    {/* Active Pip in Collapsed Mode */}
                    {isCollapsed && isActive && (
                      <span className={`absolute right-1 w-1.5 h-1.5 rounded-full ${isNavy ? 'bg-white' : 'bg-[#004a87]'
                        }`} />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Divider Line */}
            <hr className={`border-t transition-colors ${isNavy ? 'border-white/10' : 'border-slate-100'
              }`} />

            {/* 2. Account Section */}
            <div className="space-y-1">
              {!isCollapsed ? (
                <div className="px-3 pb-1">
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isNavy ? 'text-white/40' : 'text-slate-400'
                    }`}>
                    Account
                  </span>
                </div>
              ) : (
                <div className="h-2" />
              )}

              {filteredAccount.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={item.name}
                    className={`group relative flex items-center rounded-2xl transition-all duration-150 cursor-pointer ${isCollapsed
                      ? 'justify-center p-2.5 mx-auto w-11 h-11'
                      : 'gap-3 px-3.5 py-2.5'
                      } ${isActive
                        ? isNavy
                          ? 'text-white font-bold bg-white/15'
                          : 'text-slate-900 font-bold bg-slate-100/90'
                        : isNavy
                          ? 'text-white/70 hover:text-white hover:bg-white/10 font-medium'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                      }`}
                  >
                    <div className="relative">
                      <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive
                        ? isNavy ? 'text-white' : 'text-[#004a87]'
                        : isNavy ? 'text-white/60 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'
                        }`} />

                      {/* Mini dot badge in collapsed mode */}
                      {isCollapsed && item.badge && (
                        <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${item.badgeColor || 'bg-lime-500'} ring-2 ring-white`} />
                      )}
                    </div>

                    {!isCollapsed && (
                      <span className="text-xs truncate tracking-tight flex-1">
                        {item.name}
                      </span>
                    )}

                    {/* Numeric Pill Badge in Expanded mode */}
                    {!isCollapsed && item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow-2xs ${item.badgeColor || 'bg-[#84cc16]'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* =====================================================================
              BOTTOM SECTION: Profile Pill Card + More Actions Popup
          ====================================================================== */}
          <div className="p-3 sm:p-4 pt-2 shrink-0 relative" ref={profileMenuRef}>
            {/* Profile Pill Card */}
            {!isCollapsed ? (
              <div className={`p-1.5 pr-2.5 rounded-full flex items-center justify-between gap-2.5 transition-all duration-200 border ${isNavy
                ? 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200/90 shadow-2xs hover:border-slate-300 text-slate-900'
                }`}>
                {/* User Avatar + Info */}
                <div
                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'User Avatar'}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-black/5"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full font-extrabold flex items-center justify-center text-xs shrink-0 ${isNavy ? 'bg-white text-[#004a87]' : 'bg-[#004a87] text-white'
                      }`}>
                      {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate leading-tight">
                      {profile?.full_name || 'Nina Ergemla'}
                    </p>
                    <p className={`text-[10px] truncate leading-tight ${isNavy ? 'text-blue-200/70' : 'text-slate-400'}`}>
                      {profile?.email || 'nina_erg@argamla.com'}
                    </p>
                  </div>
                </div>

                {/* More Action Dots */}
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${isNavy
                    ? 'text-white/60 hover:text-white hover:bg-white/10'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  title="Menu Akun & Pengaturan"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Collapsed Profile Avatar & 3-dots */
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${isNavy ? 'text-white/60 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  title="Menu Akun"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
                <div
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="cursor-pointer group relative"
                  title={profile?.full_name || 'Akun'}
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'Avatar'}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/80 transition-transform duration-200 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs ring-2 ring-emerald-500/80 ${isNavy ? 'bg-white text-[#004a87]' : 'bg-[#004a87] text-white'
                      }`}>
                      {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
              </div>
            )}

            {/* Profile Popover Menu */}
            {profileMenuOpen && (
              <div className={`absolute z-60 bottom-full mb-2 w-64 rounded-2xl p-3 shadow-2xl border animate-modal-pop ${isCollapsed ? 'left-full ml-2 bottom-0 mb-0' : 'left-3 right-3'
                } ${isNavy
                  ? 'bg-[#003866] text-white border-blue-400/20 shadow-blue-950/60'
                  : 'bg-white text-slate-800 border-slate-200 shadow-slate-300/50'
                }`}>
                {/* User Details */}
                <div className="pb-2.5 border-b border-slate-200/50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black truncate">{profile?.full_name || 'Nina Ergemla'}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${profile?.role === 'superadmin'
                      ? 'bg-amber-100 text-amber-800'
                      : profile?.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-[#004a87]'
                      }`}>
                      {profile?.role === 'superadmin' ? 'Superadmin' : profile?.role === 'admin' ? 'Admin' : 'Marketing'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{profile?.email || user?.email}</p>
                </div>

                {/* Theme Switcher in Popover */}
                <div className="py-2 border-b border-slate-200/50 space-y-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">Gaya Sidebar</div>
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (isNavy) toggleTheme();
                      }}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${!isNavy
                        ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Putih</span>
                      {!isNavy && <Check className="w-3 h-3 text-[#004a87] ml-0.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isNavy) toggleTheme();
                      }}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isNavy
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-blue-200" />
                      <span>Navy</span>
                      {isNavy && <Check className="w-3 h-3 text-white ml-0.5" />}
                    </button>
                  </div>
                </div>

                {/* Sign Out Action */}
                <div className="pt-2">
                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Yakin ingin keluar dari akun Worrie.id?')) {
                          signOut();
                        }
                      }}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar (Sign Out)</span>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#004a87] text-white flex items-center justify-center gap-2 transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Masuk Akun Google</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<aside className="fixed top-3.5 bottom-3.5 left-3.5 z-50 w-[272px] bg-white rounded-[30px] border border-slate-200 hidden lg:block" />}>
      <SidebarInner />
    </Suspense>
  );
}
