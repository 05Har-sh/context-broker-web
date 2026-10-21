"use client";

import { Suspense } from 'react';
import IntegrationsView from '@/components/integrations/IntegrationsView';

export default function IntegrationsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-44 bg-surface-variant/40 rounded animate-pulse" />
          <div className="h-4 w-72 bg-surface-variant/30 rounded mt-2 animate-pulse" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-48 bg-surface border border-outline/20 rounded-xl animate-pulse" />
            <div className="h-48 bg-surface border border-outline/20 rounded-xl animate-pulse" />
          </div>
        </div>
      }
    >
      <IntegrationsView />
    </Suspense>
  );
}
