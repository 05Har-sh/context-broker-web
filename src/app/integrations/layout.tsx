"use client";

import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import SettingsNavTabs from '@/components/SettingsNavTabs';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ReactNode } from 'react';

export default function IntegrationsLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-auto bg-background p-6 pt-20">
            <div className="max-w-5xl mx-auto space-y-6">
              <SettingsNavTabs />
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
