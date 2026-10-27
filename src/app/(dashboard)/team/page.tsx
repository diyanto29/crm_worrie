'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Shield, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Mail, 
  UserPlus,
  RefreshCw,
  Crown,
  Lock,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Plus,
  X,
  Phone,
  Share2,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { UserProfile, UserRole } from '@/types/database';
import { useAuth } from '@/lib/authContext';

export default function TeamManagementPage() {
  const { profile: currentProfile } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modal Tambah Anggota Tim
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('marketing');
  const [submittingNew, setSubmittingNew] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadProfiles = async () => {
    setLoading(true);
    let cloudProfiles: UserProfile[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data) {
          cloudProfiles = data as UserProfile[];
        }
      } catch (err) {
        console.error('Failed to load team profiles from Supabase:', err);
      }
    }

    if (cloudProfiles.length > 0) {
      setProfiles(cloudProfiles);
    } else {
      // Local fallback
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('crm_profiles');
        if (saved) {
          try {
            setProfiles(JSON.parse(saved));
          } catch (e) {}
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) {
      alert('Nama lengkap dan email akun Google wajib diisi.');
      return;
    }

    // Validasi duplikasi email
    const emailLower = newEmail.trim().toLowerCase();
    const emailExists = profiles.some(
      (p) => p.email && p.email.toLowerCase() === emailLower
    );
    if (emailExists) {
      alert(`Email "${newEmail.trim()}" sudah terdaftar di dalam tim!`);
      return;
    }

    setSubmittingNew(true);
    try {
      const newRecord = {
        full_name: newFullName.trim(),
        email: emailLower,
        role: newRole,
        phone: newPhone.trim() || null,
        is_active: true,
      };

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .insert(newRecord)
          .select()
          .single();

        if (error) throw error;
      }

      // Local fallback sync
      const createdProfile: UserProfile = {
        id: 'prof-' + Date.now(),
        full_name: newFullName.trim(),
        email: emailLower,
        role: newRole,
        phone: newPhone.trim() || null,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      setProfiles((prev) => {
        const updated = [...prev, createdProfile];
        if (typeof window !== 'undefined') {
          localStorage.setItem('crm_profiles', JSON.stringify(updated));
        }
        return updated;
      });

      setNewFullName('');
      setNewEmail('');
      setNewPhone('');
      setNewRole('marketing');
      setIsAddModalOpen(false);

      alert(`Anggota tim "${newFullName.trim()}" (${newRole}) berhasil didaftarkan!\n\nSaat pengguna login via Google SSO dengan email tersebut, akunnya akan otomatis tersambung.`);
      await loadProfiles();
    } catch (err: any) {
      console.error('Failed to add team member:', err);
      alert(`Gagal mendaftarkan anggota tim: ${err?.message || 'Terjadi kesalahan sistem'}`);
    } finally {
      setSubmittingNew(false);
    }
  };

  const handleRoleChange = async (profileId: string, newRole: UserRole) => {
    const target = profiles.find((p) => p.id === profileId);

    // Proteksi Superadmin tidak bisa diubah rolenya
    if (target?.role === 'superadmin') {
      alert('AKSI DITOLAK: Akun Superadmin dilindungi dan tidak dapat diturunkan rolenya!');
      return;
    }

    setUpdatingId(profileId);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', profileId);

        if (error) throw error;
      }

      setProfiles((prev) => {
        const updated = prev.map((p) => (p.id === profileId ? { ...p, role: newRole } : p));
        if (typeof window !== 'undefined') {
          localStorage.setItem('crm_profiles', JSON.stringify(updated));
        }
        return updated;
      });
    } catch (err: any) {
      alert(`Gagal mengubah peran: ${err?.message || 'Terjadi kesalahan'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (profile: UserProfile) => {
    // Proteksi Superadmin tidak bisa dinonaktifkan
    if (profile.role === 'superadmin') {
      alert('AKSI DITOLAK: Akun Superadmin tidak dapat dinonaktifkan!');
      return;
    }

    setUpdatingId(profile.id);
    const newStatus = profile.is_active === false;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({ is_active: newStatus })
          .eq('id', profile.id);

        if (error) throw error;
      }

      setProfiles((prev) => {
        const updated = prev.map((p) => (p.id === profile.id ? { ...p, is_active: newStatus } : p));
        if (typeof window !== 'undefined') {
          localStorage.setItem('crm_profiles', JSON.stringify(updated));
        }
        return updated;
      });
    } catch (err: any) {
      alert(`Gagal mengubah status akses: ${err?.message || 'Terjadi kesalahan'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (profile: UserProfile) => {
    // Proteksi Superadmin TIDAK BISA DIHAPUS
    if (profile.role === 'superadmin') {
      alert('AKSI DITOLAK: Akun Superadmin dilindungi sistem database dan TIDAK BISA DIHAPUS!');
      return;
    }

    if (!confirm(`Yakin ingin menghapus akun "${profile.full_name}" (${profile.email})?\n\nPerhatian: Pengguna ini akan kehilangan akses ke CRM Worrie.id.`)) {
      return;
    }

    setUpdatingId(profile.id);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', profile.id);

        if (error) throw error;
      }

      setProfiles((prev) => {
        const updated = prev.filter((p) => p.id !== profile.id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('crm_profiles', JSON.stringify(updated));
        }
        return updated;
      });
    } catch (err: any) {
      alert(`Gagal menghapus akun: ${err?.message || 'Terjadi kesalahan'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopyInviteText = (p: UserProfile) => {
    const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://worrie.id/login';
    const roleLabel = p.role === 'admin' ? 'Administrator' : p.role === 'sales_manager' ? 'Sales Manager' : 'Tim Marketing';
    const text = `Halo kak ${p.full_name}, akun CRM Worrie.id Anda telah didaftarkan dengan peran *${roleLabel}*.\n\nSilakan masuk menggunakan akun Google Anda (${p.email}) melalui link resmi:\n👉 ${loginUrl}\n\nSelamat bergabung di tim kemitraan Worrie.id!`;
    navigator.clipboard.writeText(text);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getInviteWhatsAppUrl = (p: UserProfile) => {
    const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://worrie.id/login';
    const roleLabel = p.role === 'admin' ? 'Administrator' : p.role === 'sales_manager' ? 'Sales Manager' : 'Tim Marketing';
    const text = `Halo kak ${p.full_name}, salam hangat dari Worrie.id!\n\nAkun Anda telah didaftarkan sebagai *${roleLabel}* di CRM Worrie.id. Silakan login menggunakan akun Google Anda (${p.email}) di tautan berikut:\n👉 ${loginUrl}\n\nTerima kasih dan selamat bergabung!`;
    const cleanPhone = p.phone?.replace(/\D/g, '') || '';
    const targetPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  };

  const totalMembers = profiles.length;
  const superadminCount = profiles.filter((p) => p.role === 'superadmin').length;
  const adminCount = profiles.filter((p) => p.role === 'admin').length;
  const marketingCount = profiles.filter((p) => p.role === 'marketing' || p.role === 'sales_manager').length;
  const activeCount = profiles.filter((p) => p.is_active !== false).length;

  const isCurrentSuperadmin = currentProfile?.role === 'superadmin';
  const isCurrentAdmin = currentProfile?.role === 'admin' || isCurrentSuperadmin;

  if (currentProfile && !isCurrentAdmin) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Akses Dibatasi</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Halaman Manajemen Tim hanya dapat diakses oleh Administrator &amp; Superadmin Working Remotely Indonesia.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#004a87] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              Working Remotely Indonesia
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-8 h-8 text-[#004a87]" />
            Manajemen Tim &amp; Hak Akses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftarkan staf marketing baru, tetapkan peran akses (RBAC), dan kelola penautan akun Google SSO.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={loadProfiles}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Segarkan data tim"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Tambah Anggota Tim
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-xs space-y-1 bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold">
            <span>Superadmin (Anti-Delete)</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-900 font-mono">{superadminCount}</p>
          <span className="text-[10px] text-amber-700">Akses master penuh</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Administrator</span>
            <Shield className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-extrabold text-purple-700 font-mono">{adminCount}</p>
          <span className="text-[10px] text-slate-400">Pengelola CRM</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tim Marketing</span>
            <UserPlus className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-[#004a87] font-mono">{marketingCount}</p>
          <span className="text-[10px] text-slate-400">Staf pipeline &amp; outreach</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Akun Aktif</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono">{activeCount}</p>
          <span className="text-[10px] text-slate-400">Dari {totalMembers} total staf</span>
        </div>
      </div>

      {/* Security Callout Anti-Delete */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="font-bold text-amber-950 flex items-center gap-1.5">
            <span>Proteksi Akun Superadmin &amp; Penautan Google SSO:</span>
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-mono">
              Database Protected
            </span>
          </p>
          <p className="text-amber-800 mt-0.5">
            Admin dan Superadmin dapat mendaftarkan email staf marketing terlebih dahulu. Saat staf tersebut login via Google SSO dengan email yang sama, akun Google mereka otomatis tertaut ke peran yang telah ditentukan. Akun dengan peran <b>Superadmin</b> kebal terhadap penghapusan maupun demosi di level basis data.
          </p>
        </div>
      </div>

      {/* Team Table */}
      <div className="animate-card-slide-slow bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#004a87]" />
            Daftar Anggota Tim Terdaftar ({profiles.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">RBAC &amp; Google SSO Linked</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#004a87]" />
            <span>Memuat data tim dari sistem...</span>
          </div>
        ) : profiles.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-600">Belum ada akun tim yang terdaftar.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Klik tombol "+ Tambah Anggota Tim" di atas untuk mendaftarkan staf marketing pertama Anda.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#004a87] text-white text-xs font-bold shadow-xs hover:bg-[#003866] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Daftarkan Staf Baru
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Nama Staf &amp; Email</th>
                  <th className="py-3 px-4">Peran (Role)</th>
                  <th className="py-3 px-4">Status SSO</th>
                  <th className="py-3 px-4">Status Akses</th>
                  <th className="py-3 px-4">Kontak HP</th>
                  <th className="py-3 px-4 text-right">Aksi &amp; Undangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {profiles.map((p) => {
                  const isCurrent = currentProfile?.id === p.id;
                  const isUpdating = updatingId === p.id;
                  const isActive = p.is_active !== false;
                  const isSuperadmin = p.role === 'superadmin';
                  const isSsoLinked = Boolean(p.user_id);

                  return (
                    <tr
                      key={p.id}
                      className={`table-row-standard hover:bg-blue-50/50 hover:translate-x-1 transition-all duration-150 group cursor-pointer ${
                        isSuperadmin ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {p.avatar_url ? (
                            <img
                              src={p.avatar_url}
                              alt={p.full_name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 group-hover:scale-110 group-hover:ring-2 group-hover:ring-[#004a87] transition-all duration-200 shadow-2xs"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-[#004a87] font-bold flex items-center justify-center text-xs shrink-0 group-hover:scale-110 transition-transform duration-200">
                              {(p.full_name || p.email || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-[#004a87] transition-colors flex items-center gap-1.5 truncate">
                              <span>{p.full_name || 'Tanpa Nama'}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold border border-slate-200">
                                  Anda
                                </span>
                              )}
                              {isSuperadmin && (
                                <span className="text-[10px] text-amber-600" title="Akun Superadmin Kebal Hapus">
                                  👑
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px] font-mono flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{p.email || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Dropdown */}
                      <td className="py-3.5 px-4">
                        {isSuperadmin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                            <Lock className="w-3 h-3 text-amber-600" />
                            Superadmin
                          </span>
                        ) : (
                          <select
                            value={p.role}
                            disabled={isUpdating}
                            onChange={(e) => handleRoleChange(p.id, e.target.value as UserRole)}
                            className={`text-xs font-bold py-1.5 px-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 transition-all cursor-pointer ${
                              p.role === 'admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : p.role === 'sales_manager'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-blue-50 text-[#004a87] border-blue-200'
                            }`}
                          >
                            <option value="marketing">Marketing (Staf Pipeline)</option>
                            <option value="sales_manager">Sales Manager</option>
                            <option value="admin">Administrator</option>
                          </select>
                        )}
                      </td>

                      {/* SSO Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isSsoLinked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Tertaut Google SSO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#004a87] border border-blue-200">
                            <AlertCircle className="w-3 h-3" />
                            Menunggu Login SSO
                          </span>
                        )}
                      </td>

                      {/* Status Aktif Toggle */}
                      <td className="py-3.5 px-4">
                        {isSuperadmin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Aktif Permanen
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleActive(p)}
                            disabled={isUpdating}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                            <span>{isActive ? 'Aktif' : 'Dinonaktifkan'}</span>
                          </button>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {p.phone || <span className="text-slate-300 italic">-</span>}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Salin Teks Akses */}
                          <button
                            onClick={() => handleCopyInviteText(p)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Salin teks informasi login akun"
                          >
                            {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          {/* Kirim via WA jika ada nomor telepon */}
                          {p.phone && (
                            <a
                              href={getInviteWhatsAppUrl(p)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                              title="Kirim pemberitahuan akses via WhatsApp"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Tombol Hapus (Dilindungi Anti-Delete Superadmin) */}
                          {isSuperadmin ? (
                            <span
                              className="p-1.5 rounded-lg text-slate-300 cursor-not-allowed"
                              title="Superadmin dilindungi anti-delete"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDeleteUser(p)}
                              disabled={isUpdating || isCurrent}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-40"
                              title="Hapus Akun Staf"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: TAMBAH ANGGOTA TIM BARU (PRE-REGISTER / INVITE)     */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-[#004a87]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Daftarkan Anggota Tim Baru
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Staf dapat langsung login via Google SSO dengan email ini
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap Staf *
                </label>
                <input
                  type="text"
                  placeholder="Misal: Dika Pratama"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#004a87] bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alamat Email Akun Google (SSO) *
                </label>
                <input
                  type="email"
                  placeholder="dika.marketing@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#004a87] font-mono bg-slate-50 focus:bg-white"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Pastikan email ini sama dengan akun Google yang digunakan staf saat Sign In.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Peran / Akses Sistem (Role) *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-[#004a87] font-semibold text-slate-800"
                >
                  <option value="marketing">Marketing (Akses Pipeline &amp; Scraper Prospek)</option>
                  <option value="sales_manager">Sales Manager (Supervisi Tim &amp; Pipeline)</option>
                  <option value="admin">Administrator (Akses Konfigurasi &amp; Manajemen Tim)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nomor WhatsApp / HP (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#004a87] font-mono bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingNew}
                  className="px-5 py-2.5 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white font-bold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
                >
                  {submittingNew ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mendaftarkan...</span>
                    </>
                  ) : (
                    <span>Daftarkan Anggota Tim</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
