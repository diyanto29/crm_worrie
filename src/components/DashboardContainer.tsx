'use client';

import React from 'react';
import { useSidebar } from '@/lib/sidebarContext';

export default function DashboardContainer({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div 
      className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'lg:pl-[96px]' : 'lg:pl-[296px]'
      }`}
    >
      <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1920px] mx-auto">
        {children}
      </main>
    </div>
  );
}
