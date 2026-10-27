'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type SidebarTheme = 'light' | 'navy';
type WorkspaceMode = 'b2b' | 'b2c';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  sidebarTheme: SidebarTheme;
  setSidebarTheme: (theme: SidebarTheme) => void;
  toggleTheme: () => void;
  workspaceMode: WorkspaceMode;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarTheme, setSidebarTheme] = useState<SidebarTheme>('light');
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('b2b');

  // Hydrate preferences from localStorage
  useEffect(() => {
    try {
      const savedCollapsed = localStorage.getItem('worrie_sidebar_collapsed');
      if (savedCollapsed !== null) {
        setIsCollapsed(savedCollapsed === 'true');
      }

      const savedTheme = localStorage.getItem('worrie_sidebar_theme') as SidebarTheme;
      if (savedTheme === 'light' || savedTheme === 'navy') {
        setSidebarTheme(savedTheme);
      }

      const savedMode = localStorage.getItem('worrie_workspace_mode') as WorkspaceMode;
      if (savedMode === 'b2b' || savedMode === 'b2c') {
        setWorkspaceMode(savedMode);
      }
    } catch {
      // Ignore localStorage errors (e.g. private browsing)
    }
  }, []);

  const handleSetCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem('worrie_sidebar_collapsed', String(collapsed));
    } catch {}
  };

  const toggleCollapsed = () => {
    handleSetCollapsed(!isCollapsed);
  };

  const handleSetTheme = (theme: SidebarTheme) => {
    setSidebarTheme(theme);
    try {
      localStorage.setItem('worrie_sidebar_theme', theme);
    } catch {}
  };

  const toggleTheme = () => {
    handleSetTheme(sidebarTheme === 'light' ? 'navy' : 'light');
  };

  const handleSetWorkspaceMode = (mode: WorkspaceMode) => {
    setWorkspaceMode(mode);
    try {
      localStorage.setItem('worrie_workspace_mode', mode);
    } catch {}
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed: handleSetCollapsed,
        toggleCollapsed,
        sidebarTheme,
        setSidebarTheme: handleSetTheme,
        toggleTheme,
        workspaceMode,
        setWorkspaceMode: handleSetWorkspaceMode,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
