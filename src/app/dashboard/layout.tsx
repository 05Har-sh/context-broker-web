"use client";

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ReactNode } from 'react';

/**
 * Client-side layout wrapper for the dashboard route group.
 * Ensures the user is authenticated before rendering any dashboard content.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}


