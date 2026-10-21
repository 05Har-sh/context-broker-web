"use client";

import { useAuth } from './AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Role } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Optional role required to view this page */
  requiredRole?: Role;
}

/**
 * Wraps protected pages. Redirects unauthenticated users to the branded /login page.
 * Shows loading state during initialization.
 * Shows access-denied for missing roles.
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { authState, isAuthenticated, isLoading, hasRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const redirectTriggeredRef = useRef(false);

  useEffect(() => {
    // Once initialization is done and user is not authenticated, redirect to frontend login
    if (authState === 'unauthenticated' && !redirectTriggeredRef.current) {
      redirectTriggeredRef.current = true;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('auth_redirect', pathname);
      }
      router.push('/login');
    }
  }, [authState, pathname, router]);

  // Loading / initializing state
  if (isLoading || authState === 'initializing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-on-surface-variant">Loading…</p>
        </div>
      </div>
    );
  }

  // Not authenticated — don't render content (login redirect is in progress)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-on-surface-variant">Redirecting to sign in…</p>
        </div>
      </div>
    );
  }

  // Authenticated but missing required role
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 max-w-md text-center p-8">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-on-surface">Access Denied</h2>
          <p className="text-sm text-on-surface-variant">
            You don&apos;t have the required permissions to view this page.
            Contact your workspace administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
