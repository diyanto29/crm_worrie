'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  Check, 
  ChevronDown, 
  X, 
  User, 
  UserCheck
} from 'lucide-react';
import { UserProfile } from '@/types/database';
import { DataStore } from '@/lib/dataStore';

// ============================================================================
// 1. GENERIC SEARCHABLE SELECT
// ============================================================================
export interface SearchableOption {
  value: string;
  label: string;
  sublabel?: string;
  avatarUrl?: string | null;
  badge?: string;
  badgeColor?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SearchableSelectProps {
  options: SearchableOption[];
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  dropdownAlign?: 'left' | 'right';
  disabled?: boolean;
  allowClear?: boolean;
  clearLabel?: string;
  renderCustomTrigger?: (selected: SearchableOption | undefined, isOpen: boolean) => React.ReactNode;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih opsi...',
  searchPlaceholder = 'Cari...',
  className = '',
  dropdownAlign = 'left',
  disabled = false,
  allowClear = true,
  clearLabel = 'Semua / Reset',
  renderCustomTrigger
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = useMemo(() => {
    return options.find(o => o.value === value);
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(o => 
      o.label.toLowerCase().includes(q) || 
      (o.sublabel && o.sublabel.toLowerCase().includes(q)) ||
      (o.badge && o.badge.toLowerCase().includes(q))
    );
  }, [options, query]);

  const wrapperClass = className.includes('w-') 
    ? `relative inline-block ${className}` 
    : `relative inline-block w-full ${className}`;

  return (
    <div className={wrapperClass} ref={containerRef}>
      {/* Trigger Button */}
      {renderCustomTrigger ? (
        <div onClick={() => !disabled && setIsOpen(!isOpen)} className="cursor-pointer">
          {renderCustomTrigger(selectedOption, isOpen)}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-2xs ${
            isOpen 
              ? 'bg-white border-[#004a87] ring-2 ring-[#004a87]/20 text-slate-900' 
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {selectedOption?.avatarUrl ? (
              <img 
                src={selectedOption.avatarUrl} 
                alt={selectedOption.label} 
                className="w-5 h-5 rounded-full object-cover shrink-0" 
              />
            ) : selectedOption?.icon ? (
              <selectedOption.icon className="w-4 h-4 text-slate-400 shrink-0" />
            ) : null}

            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>

            {selectedOption?.badge && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${selectedOption.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                {selectedOption.badge}
              </span>
            )}
          </div>

          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Dropdown Floating Menu with Fixed Safe Width & Alignment */}
      {isOpen && (
        <div 
          className={`absolute z-50 mt-1.5 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-1.5 animate-modal-pop ${
            dropdownAlign === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {/* Search Input Box */}
          <div className="relative mb-1 px-1 pt-0.5">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004a87] focus:border-[#004a87]"
            />
            {query && (
              <button 
                type="button" 
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 py-0.5 scrollbar-thin">
            {allowClear && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                  !value ? 'bg-blue-50 text-[#004a87] font-bold' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span>{clearLabel}</span>
                {!value && <Check className="w-3.5 h-3.5 text-[#004a87]" />}
              </button>
            )}

            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                Tidak ada hasil ditemukan
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50 text-[#004a87] font-bold' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {option.avatarUrl ? (
                        <img 
                          src={option.avatarUrl} 
                          alt={option.label} 
                          className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-slate-200" 
                        />
                      ) : option.icon ? (
                        <option.icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#004a87]' : 'text-slate-400'}`} />
                      ) : null}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate">{option.label}</span>
                          {option.badge && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${option.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                              {option.badge}
                            </span>
                          )}
                        </div>
                        {option.sublabel && (
                          <p className="text-[10px] text-slate-400 truncate">{option.sublabel}</p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#004a87] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 2. STANDARDIZED SEARCHABLE PIC SELECT (Directly connected to Management Tim)
// ============================================================================
export interface SearchablePicSelectProps {
  value?: string | null; // e.g. member.full_name
  onChange: (fullName: string) => void;
  teamMembers?: UserProfile[];
  placeholder?: string;
  className?: string;
  dropdownAlign?: 'left' | 'right';
  disabled?: boolean;
  compact?: boolean; // small chip mode for headers and tables
}

export function SearchablePicSelect({
  value,
  onChange,
  teamMembers: propMembers,
  placeholder = 'Belum Ditugaskan',
  className = '',
  dropdownAlign = 'right',
  disabled = false,
  compact = false
}: SearchablePicSelectProps) {
  const [members, setMembers] = useState<UserProfile[]>(propMembers || []);

  // Fetch team members if not provided via props
  useEffect(() => {
    if (propMembers && propMembers.length > 0) {
      setMembers(propMembers);
      return;
    }

    let isMounted = true;
    DataStore.getTeamMembers().then((res) => {
      if (isMounted) {
        setMembers(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [propMembers]);

  // Convert team members to SearchableOptions
  const options: SearchableOption[] = useMemo(() => {
    return members.map((m) => {
      const isSuper = m.role === 'superadmin';
      const isAdmin = m.role === 'admin';
      return {
        value: m.full_name,
        label: m.full_name,
        sublabel: m.email || undefined,
        avatarUrl: m.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name)}&background=004a87&color=fff&bold=true`,
        badge: isSuper ? 'Superadmin' : isAdmin ? 'Admin' : 'Marketing',
        badgeColor: isSuper 
          ? 'bg-amber-100 text-amber-800' 
          : isAdmin 
          ? 'bg-purple-100 text-purple-800' 
          : 'bg-blue-100 text-[#004a87]'
      };
    });
  }, [members]);

  const selectedMember = useMemo(() => {
    return members.find(m => m.full_name === value);
  }, [members, value]);

  if (compact) {
    return (
      <SearchableSelect
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        searchPlaceholder="Ketik nama PIC..."
        clearLabel="-- Semua Tim / PIC --"
        className={`w-auto shrink-0 ${className}`}
        dropdownAlign={dropdownAlign}
        disabled={disabled}
        renderCustomTrigger={(selected, isOpen) => (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all shadow-2xs cursor-pointer select-none whitespace-nowrap ${
            isOpen 
              ? 'bg-blue-50 border-[#004a87] text-[#004a87] ring-2 ring-[#004a87]/20' 
              : selected 
              ? 'bg-white border-slate-200/90 text-slate-800 hover:border-slate-300' 
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}>
            {selected?.avatarUrl ? (
              <img 
                src={selected.avatarUrl} 
                alt={selected.label} 
                className="w-4.5 h-4.5 rounded-full object-cover shrink-0 ring-1 ring-slate-200" 
              />
            ) : (
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}

            <span className="text-xs font-bold truncate max-w-[140px]">
              {selected ? selected.label : placeholder}
            </span>

            {selected?.badge && (
              <span className={`text-[9px] font-extrabold px-1 rounded ${selected.badgeColor}`}>
                {selected.badge}
              </span>
            )}

            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        )}
      />
    );
  }

  return (
    <SearchableSelect
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Cari anggota tim PIC..."
      clearLabel="-- Belum Ditugaskan --"
      className={className}
      dropdownAlign={dropdownAlign}
      disabled={disabled}
    />
  );
}

export default SearchableSelect;
