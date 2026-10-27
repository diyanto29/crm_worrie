'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Unlock, KeyRound, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';

const PIN_STORAGE_KEY = 'gmap_prospek_unlocked_token';
const PIN_SETTING_KEY = 'gmap_prospek_custom_pin';
const PIN_ENABLED_KEY = 'gmap_prospek_pin_enabled';
const DEFAULT_PIN = '123456';

export function isPinProtectionEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(PIN_ENABLED_KEY);
  return stored !== 'false'; // default is true
}

export function getStoredPin(): string {
  if (typeof window === 'undefined') return DEFAULT_PIN;
  return localStorage.getItem(PIN_SETTING_KEY) || DEFAULT_PIN;
}

export function setCustomPin(newPin: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PIN_SETTING_KEY, newPin);
}

export function setPinProtectionEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PIN_ENABLED_KEY, enabled ? 'true' : 'false');
}

export function lockWorkspace(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PIN_STORAGE_KEY);
  window.location.reload();
}

export default function PinProtection({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  useEffect(() => {
    setMounted(true);
    const enabled = isPinProtectionEnabled();
    if (!enabled) {
      setIsUnlocked(true);
      return;
    }

    const token = localStorage.getItem(PIN_STORAGE_KEY);
    if (token === 'unlocked_session') {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = getStoredPin();

    if (inputPin.trim() === correctPin.trim()) {
      setIsUnlocked(true);
      setErrorMsg('');
      if (rememberDevice) {
        localStorage.setItem(PIN_STORAGE_KEY, 'unlocked_session');
      }
    } else {
      setErrorMsg('PIN yang Anda masukkan salah. Silakan coba lagi.');
      setInputPin('');
    }
  };

  return (
    <>
      {children}

      {/* Lockscreen Overlay when locked */}
      {mounted && !isUnlocked && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden font-sans">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Icon */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Workspace Terproteksi
              </h1>
              <p className="text-xs text-slate-500">
                Masukkan PIN akses untuk membuka data prospek & CRM Anda.
              </p>
            </div>

            {/* PIN Form */}
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>PIN Keamanan</span>
                  <span className="text-[11px] text-slate-400 font-normal">Default: 123456</span>
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    autoFocus
                    maxLength={10}
                    value={inputPin}
                    onChange={(e) => {
                      setInputPin(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="••••••"
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 text-center text-xl font-mono tracking-widest focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700"
                    title={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Ingat perangkat ini</span>
                </label>
                <span className="text-slate-400 text-[11px]">Bisa diganti di Pengaturan</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer hover:scale-[1.01]"
              >
                <Unlock className="w-4 h-4" />
                Buka Workspace
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
              Gmap Prospek &bull; Personal Workspace Security
            </div>
          </div>
        </div>
      )}
    </>
  );
}
