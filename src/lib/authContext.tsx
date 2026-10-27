'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserProfile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async (userId: string, currentUser?: User) => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      let profileData = (!error && data) ? data : null;

      // Jika belum ditemukan dengan user_id, cari profil yang didaftarkan Admin berdasarkan email
      if (!profileData && currentUser?.email) {
        const { data: emailData } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', currentUser.email.toLowerCase())
          .maybeSingle();

        if (emailData) {
          profileData = emailData;
          // Tautkan user_id ke baris profil tersebut
          if (!emailData.user_id) {
            await supabase
              .from('profiles')
              .update({ user_id: userId, is_active: true })
              .eq('id', emailData.id);
          }
        }
      }

      if (profileData) {
        setProfile(profileData as UserProfile);
        return profileData;
      }

      // Fallback jika trigger delay atau belum ada row
      if (currentUser) {
        const masterEmail = process.env.NEXT_PUBLIC_MASTER_ADMIN_EMAIL?.toLowerCase();
        const isMaster = Boolean(masterEmail && currentUser.email?.toLowerCase() === masterEmail);
        const fallbackProfile: UserProfile = {
          id: userId,
          user_id: userId,
          full_name:
            currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            currentUser.email?.split('@')[0] ||
            'Pengguna',
          email: currentUser.email || null,
          role: isMaster ? 'superadmin' : 'marketing',
          avatar_url:
            currentUser.user_metadata?.avatar_url ||
            currentUser.user_metadata?.picture ||
            null,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        setProfile(fallbackProfile);
        return fallbackProfile;
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
    return null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id, user);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user);
        } else if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event: import('@supabase/supabase-js').AuthChangeEvent, session: import('@supabase/supabase-js').Session | null) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      alert('Koneksi Supabase belum aktif di .env.local.');
      return;
    }

    const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${redirectOrigin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google Sign In Error:', error);
      alert(`Gagal login dengan Google: ${error.message}`);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
