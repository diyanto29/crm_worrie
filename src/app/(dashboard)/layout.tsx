import React from 'react';
import Sidebar from '@/components/Sidebar';
import PinProtection from '@/components/PinProtection';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PinProtection>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-emerald-500 selection:text-white">
        {/* Sidebar (Desktop fixed left, Mobile drawer) */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </PinProtection>
  );
}
