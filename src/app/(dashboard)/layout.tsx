import React from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardContainer from '@/components/DashboardContainer';
import AuthGuard from '@/components/AuthGuard';
import { SidebarProvider } from '@/lib/sidebarContext';

// Dynamic server rendering for guarded dashboard pages
export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-amber-500 selection:text-slate-900">
          {/* Modern Floating Rounded Pill Sidebar */}
          <Sidebar />

          {/* Smooth Adaptive Main Content Area */}
          <DashboardContainer>
            {children}
          </DashboardContainer>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
