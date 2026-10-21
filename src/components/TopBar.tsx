"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, HelpCircle, LogOut, ChevronDown, User } from "lucide-react";
import { useAuth } from "./auth/AuthProvider";
import { usePathname } from "next/navigation";
import { useSettingsModal } from "./SettingsModalProvider";

// ─── Avatar initials helper ───────────────────────────────────

function getInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) return firstName[0].toUpperCase();
  if (email) return email[0].toUpperCase();
  return '?';
}

// ─── Profile Dropdown ─────────────────────────────────────────

function ProfileDropdown() {
  const { user, logout } = useAuth();
  const { openSettings } = useSettingsModal();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleEditProfile = useCallback(() => {
    setOpen(false);
    openSettings('profile');
  }, [openSettings]);

  const handleSignOut = useCallback(() => {
    setOpen(false);
    logout();
  }, [logout]);

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || user?.email || 'User';
  const displayEmail = user?.email || '';
  const initials = getInitials(user?.firstName, user?.lastName, user?.email);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-container transition-colors cursor-pointer group"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold select-none overflow-hidden shadow-sm">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-on-surface-variant group-hover:text-on-surface transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-2xl z-50 overflow-hidden"
            role="menu"
            aria-label="Account actions"
          >
            {/* User info */}
            <div className="px-4 py-3.5 border-b border-outline-variant/10 bg-surface-container/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-on-surface truncate">
                    {displayName}
                  </p>
                  {displayEmail && (
                    <p className="text-xs text-on-surface-variant truncate">
                      {displayEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Actions */}
            <div className="p-1.5 space-y-0.5">
              {/* Edit Profile */}
              <button
                onClick={handleEditProfile}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-on-surface hover:bg-surface-container transition-colors cursor-pointer text-left font-medium"
                role="menuitem"
              >
                <User className="w-4 h-4 text-primary shrink-0" />
                <span>Edit profile</span>
              </button>

              {/* Sign out */}
              <div className="pt-1 mt-1 border-t border-outline-variant/10">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left font-medium"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────

export default function TopBar() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Hide profile dropdown on public pages
  const isPublicPage = pathname === '/login' || pathname === '/signup' || pathname === '/';

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant/15 flex justify-between items-center w-full px-8 h-16 fixed top-0 left-0 z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="App Logo" className="w-8 h-8 object-contain" />
          <span className="text-base font-bold text-on-surface tracking-tighter">
            Incident Intelligence Hub
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          <a
            className="text-on-surface border-b-2 border-secondary pb-1 text-xs font-medium"
            href="/dashboard"
            aria-current="page"
          >
            Incidents
          </a>
          <a className="text-on-surface-variant hover:text-on-surface transition-colors text-xs font-medium" href="#">
            Workspaces
          </a>
          <a className="text-on-surface-variant hover:text-on-surface transition-colors text-xs font-medium" href="#">
            Analytics
          </a>
          <a className="text-on-surface-variant hover:text-on-surface transition-colors text-xs font-medium" href="#">
            Team
          </a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-1.5 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-1.5 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </motion.button>

        {/* Profile dropdown — only show on authenticated pages */}
        {isAuthenticated && !isPublicPage && <ProfileDropdown />}
      </div>
    </header>
  );
}
