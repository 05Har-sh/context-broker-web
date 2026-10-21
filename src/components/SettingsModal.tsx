"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Palette,
  Building2,
  BarChart3,
  Users,
  Sun,
  Moon,
  Monitor,
  Check,
  Rows3,
  BookOpen,
  X,
  Globe,
  Briefcase,
  ShieldCheck,
  Plus,
  Mail,
  Calendar,
  Clock,
  Key,
  BadgeCheck,
  Fingerprint,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { auditApi, AuditEvent } from "@/lib/api/audit";
import { hasPermission } from "@/lib/permissions";

export type SettingsTab = "organization" | "profile" | "appearance" | "analytics" | "team" | "audit";

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
}

const tabs = [
  { id: "organization" as SettingsTab, label: "Organization", icon: Building2 },
  { id: "profile" as SettingsTab, label: "User Profile", icon: UserIcon },
  { id: "appearance" as SettingsTab, label: "Appearance", icon: Palette },
  { id: "analytics" as SettingsTab, label: "Analytics", icon: BarChart3 },
  { id: "team" as SettingsTab, label: "Team Members", icon: Users },
  { id: "audit" as SettingsTab, label: "Audit Logs", icon: ShieldCheck },
];

const themeOptions = [
  { id: "light" as const, label: "Light", icon: Sun },
  { id: "dark" as const, label: "Dark", icon: Moon },
  { id: "system" as const, label: "System", icon: Monitor },
];

const INDUSTRY_OPTIONS = [
  "Software / Technology",
  "Financial Services",
  "Healthcare",
  "E-Commerce",
  "Education",
  "Manufacturing",
  "Cybersecurity",
  "Media & Entertainment",
  "Other",
];

const TEAM_SIZE_OPTIONS = [
  "1–10",
  "11–50",
  "51–200",
  "201–500",
  "500+",
];

export default function SettingsModal({ isOpen, onClose, initialTab }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab || "organization");
  const { theme, setTheme, highContrast, setHighContrast, sidebarLayout, setSidebarLayout } = useTheme();
  const { user, organization, membership, updateUser, updateOrganization } = useAuth();

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Organization state
  const [orgName, setOrgName] = useState(organization?.name || "Acme Technologies");
  const [workspaceUrl, setWorkspaceUrl] = useState(organization?.workspaceUrl || "acme");
  const [industry, setIndustry] = useState(organization?.industry || "Software / Technology");
  const [teamSize, setTeamSize] = useState(organization?.teamSize || "11–50");

  // User Profile state
  const [firstName, setFirstName] = useState(user?.firstName || "Acme");
  const [lastName, setLastName] = useState(user?.lastName || "Admin");
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
  );

  // Audit Logs state
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [isAuditLoading, setIsAuditLoading] = useState(false);

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    if (organization) {
      setOrgName(organization.name || "Acme Technologies");
      setWorkspaceUrl(organization.workspaceUrl || "acme");
      setIndustry(organization.industry || "Software / Technology");
      setTeamSize(organization.teamSize || "11–50");
    }
  }, [organization]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
    }
  }, [user]);

  // Load audit logs when opening the audit tab
  useEffect(() => {
    if (isOpen && activeTab === "audit") {
      const canView = hasPermission(user?.role || membership?.role, "VIEW_AUDIT_LOG");
      if (canView) {
        setIsAuditLoading(true);
        auditApi.getAuditEvents()
          .then(data => setAuditEvents(data.content))
          .catch(() => setAuditEvents([]))
          .finally(() => setIsAuditLoading(false));
      }
    }
  }, [isOpen, activeTab, user?.role, membership?.role]);

  if (!isOpen) return null;

  const canViewAudit = hasPermission(user?.role || membership?.role, "VIEW_AUDIT_LOG");

  const handleSaveOrg = () => {
    updateOrganization({
      name: orgName,
      workspaceUrl,
      industry,
      teamSize,
    });
    setNotificationMsg("Organization settings saved!");
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleSaveProfile = () => {
    updateUser({
      firstName,
      lastName,
      avatarUrl,
    });
    setNotificationMsg("Profile updated successfully!");
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-[920px] max-w-[95vw] h-[640px] bg-surface-container-lowest flex rounded-xl overflow-hidden shadow-2xl border border-outline-variant/15 font-body"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar Navigation */}
        <aside className="w-60 bg-surface-container-low border-r border-outline-variant/15 flex flex-col pt-8 pb-4 px-3 shrink-0">
          <div className="px-3 mb-6">
            <h1 className="text-sm font-semibold text-on-surface">Settings</h1>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Manage preferences & organization</p>
          </div>
          <nav className="space-y-[2px]" aria-label="Settings sections">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors text-left",
                    isActive
                      ? "bg-secondary/10 text-secondary font-bold"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  )}
                >
                  <Icon className={cn("h-[16px] w-[16px]", isActive ? "text-secondary" : "text-on-surface-variant")} />
                  {tab.label}
                </motion.button>
              );
            })}
          </nav>

          <div className="mt-auto px-3 pt-4 border-t border-outline-variant/10">
            <div className="flex items-center gap-2">
              <img
                className="w-7 h-7 rounded-full object-cover border border-outline-variant/20"
                src={avatarUrl}
                alt="Profile"
              />
              <div className="text-[11px] leading-tight overflow-hidden">
                <p className="font-semibold text-on-surface truncate">
                  {firstName} {lastName}
                </p>
                <p className="text-on-surface-variant truncate">{user?.email || "admin@acmecorp.com"}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-surface-container-lowest">
          {notificationMsg && (
            <div className="bg-secondary/10 border-b border-secondary/20 px-8 py-2 text-secondary text-xs font-semibold flex items-center justify-between">
              <span>{notificationMsg}</span>
              <button onClick={() => setNotificationMsg(null)} className="hover:opacity-70">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* 1. ORGANIZATION TAB */}
            {activeTab === "organization" && (
              <motion.main
                key="organization"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex-1 overflow-y-auto no-scrollbar flex flex-col"
              >
                <header className="h-12 flex items-center justify-between px-8 border-b border-outline-variant/15 shrink-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Organization Settings
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
                    aria-label="Close settings"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>

                <div className="px-8 py-6 space-y-6 max-w-xl">
                  <div>
                    <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-secondary" />
                      Organization
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Configure company details, workspace URL, industry, and team size.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Organization Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        Organization name
                      </label>
                      <Input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="Acme Technologies"
                        className="h-9 text-sm"
                      />
                    </div>

                    {/* Workspace URL */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        Workspace URL
                      </label>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-2 rounded-l-md border border-r-0 border-outline-variant/20 bg-surface-container-low text-on-surface-variant text-xs font-mono">
                          app.contextbroker.io/
                        </span>
                        <Input
                          type="text"
                          value={workspaceUrl}
                          onChange={(e) => setWorkspaceUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                          placeholder="acme"
                          className="h-9 text-sm rounded-l-none"
                        />
                      </div>
                    </div>

                    {/* Industry */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        Industry
                      </label>
                      <div className="relative">
                        <select
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full h-9 px-3 text-xs text-on-surface border border-outline-variant/20 rounded-md bg-surface transition-all focus:outline-none focus:border-secondary appearance-none cursor-pointer"
                        >
                          {INDUSTRY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-on-surface-variant">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Team Size */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        Team size
                      </label>
                      <div className="relative">
                        <select
                          value={teamSize}
                          onChange={(e) => setTeamSize(e.target.value)}
                          className="w-full h-9 px-3 text-xs text-on-surface border border-outline-variant/20 rounded-md bg-surface transition-all focus:outline-none focus:border-secondary appearance-none cursor-pointer"
                        >
                          {TEAM_SIZE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-on-surface-variant">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto px-8 py-4 border-t border-outline-variant/15 flex justify-end gap-3 shrink-0">
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    Close
                  </Button>
                  <Button size="sm" onClick={handleSaveOrg}>
                    Save changes
                  </Button>
                </div>
              </motion.main>
            )}

            {/* 2. USER PROFILE TAB */}
            {activeTab === "profile" && (
              <motion.main
                key="profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex-1 overflow-y-auto no-scrollbar flex flex-col"
              >
                <header className="h-12 flex items-center justify-between px-8 border-b border-outline-variant/15 shrink-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    User Profile & Membership
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
                    aria-label="Close settings"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>

                <div className="px-8 py-6 space-y-6 max-w-xl">
                  <div>
                    <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-primary" />
                      User Profile
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Manage your account information, authentication details, and organization membership.
                    </p>
                  </div>

                  {notificationMsg && (
                    <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-lg text-secondary text-xs font-semibold flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4" />
                      <span>{notificationMsg}</span>
                    </div>
                  )}

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/10 pb-1.5">
                      Personal Information
                    </div>

                    {/* Avatar & Photo URL */}
                    <div className="flex items-center gap-4">
                      <img
                        src={avatarUrl}
                        alt="User Avatar"
                        className="w-14 h-14 rounded-full object-cover border border-outline-variant/20 bg-surface-container-low"
                        onError={() =>
                          setAvatarUrl(
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
                          )
                        }
                      />
                      <div className="flex-1 space-y-1">
                        <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                          Avatar URL
                        </label>
                        <Input
                          type="url"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          className="h-8 text-xs font-mono"
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                    </div>

                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                          First Name
                        </label>
                        <Input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                          Last Name
                        </label>
                        <Input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    {/* Email & Verification */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> Email Address
                        </label>
                        {user?.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/20">
                            <BadgeCheck className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            Unverified
                          </span>
                        )}
                      </div>
                      <Input
                        type="email"
                        value={user?.email || "admin@acmecorp.com"}
                        readOnly
                        className="h-9 text-xs font-mono bg-surface-container-low/50 cursor-not-allowed text-on-surface-variant"
                      />
                    </div>
                  </div>

                  {/* Stored User Fields Breakdown */}
                  <div className="space-y-2 border-t border-outline-variant/15 pt-4">
                    <div className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      Identity & Authentication Meta
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
                        <span className="text-on-surface-variant font-medium flex items-center gap-1.5 mb-0.5">
                          <Fingerprint className="w-3.5 h-3.5 text-primary" /> User ID (id)
                        </span>
                        <p className="font-mono text-on-surface font-semibold truncate">{user?.id || "usr_9482103a"}</p>
                      </div>
                      <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
                        <span className="text-on-surface-variant font-medium flex items-center gap-1.5 mb-0.5">
                          <Key className="w-3.5 h-3.5 text-primary" /> Auth Provider (authProvider)
                        </span>
                        <p className="font-mono text-on-surface font-semibold capitalize">{user?.authProvider || "keycloak"}</p>
                      </div>
                      <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
                        <span className="text-on-surface-variant font-medium flex items-center gap-1.5 mb-0.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Provider User ID
                        </span>
                        <p className="font-mono text-on-surface font-semibold truncate">{user?.providerUserId || "kc-user-109283"}</p>
                      </div>
                      <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
                        <span className="text-on-surface-variant font-medium flex items-center gap-1.5 mb-0.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" /> Created At
                        </span>
                        <p className="font-mono text-on-surface font-semibold truncate">{formatDate(user?.createdAt || "2025-01-15T08:30:00.000Z")}</p>
                      </div>
                      <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10 col-span-2">
                        <span className="text-on-surface-variant font-medium flex items-center gap-1.5 mb-0.5">
                          <Clock className="w-3.5 h-3.5 text-primary" /> Last Login At
                        </span>
                        <p className="font-mono text-on-surface font-semibold">{formatDate(user?.lastLoginAt || new Date().toISOString())}</p>
                      </div>
                    </div>
                  </div>

                  {/* OrganizationMembership Schema Breakdown */}
                  <div className="space-y-2 border-t border-outline-variant/15 pt-4">
                    <div className="text-xs font-bold text-on-surface flex items-center justify-between uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-primary" /> Organization Membership
                      </span>
                      <span className="text-[10px] text-secondary font-semibold bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">
                        {membership?.status || "ACTIVE"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
                        <span className="text-on-surface-variant font-medium">Membership ID (id)</span>
                        <p className="font-mono text-on-surface font-semibold truncate">{membership?.id || "mem_7720194b"}</p>
                      </div>
                      <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
                        <span className="text-on-surface-variant font-medium">User ID (userId)</span>
                        <p className="font-mono text-on-surface font-semibold truncate">{membership?.userId || user?.id || "usr_9482103a"}</p>
                      </div>
                      <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
                        <span className="text-on-surface-variant font-medium">Tenant ID (tenantId)</span>
                        <p className="font-mono text-on-surface font-semibold truncate">{membership?.tenantId || "org_acme_001"}</p>
                      </div>
                      <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
                        <span className="text-on-surface-variant font-medium">Role</span>
                        <p className="font-mono text-on-surface font-semibold">{membership?.role || user?.role || "ADMIN"}</p>
                      </div>
                      <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10 col-span-2">
                        <span className="text-on-surface-variant font-medium">Joined At</span>
                        <p className="font-mono text-on-surface font-semibold">{formatDate(membership?.joinedAt || "2025-01-15T08:30:00.000Z")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto px-8 py-4 border-t border-outline-variant/15 flex justify-end gap-3 shrink-0">
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    Close
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile}>
                    Update profile
                  </Button>
                </div>
              </motion.main>
            )}

            {/* 3. APPEARANCE TAB */}
            {activeTab === "appearance" && (
              <motion.main
                key="appearance"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex-1 overflow-y-auto no-scrollbar flex flex-col"
              >
                <header className="h-12 flex items-center justify-between px-8 border-b border-outline-variant/15 shrink-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Appearance
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
                    aria-label="Close settings"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>

                <div className="px-8 py-6 space-y-6 max-w-xl">
                  <section className="space-y-4">
                    <div>
                      <h2 className="text-sm font-semibold text-on-surface mb-0.5">Interface Theme</h2>
                      <p className="text-xs text-on-surface-variant">
                        Customize how the interface looks on your device.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {themeOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = theme === opt.id;
                        return (
                          <motion.label key={opt.id} whileTap={{ scale: 0.98 }} className="group cursor-pointer">
                            <input
                              className="sr-only"
                              name="theme"
                              type="radio"
                              checked={isSelected}
                              onChange={() => setTheme(opt.id)}
                            />
                            <div
                              className={cn(
                                "p-2.5 rounded-md border transition-all flex items-center gap-2",
                                isSelected
                                  ? "border-secondary bg-secondary/5"
                                  : "border-outline-variant/15 hover:border-outline-variant/30"
                              )}
                            >
                              <Icon className={cn("h-4 w-4", isSelected ? "text-secondary" : "text-on-surface-variant")} />
                              <span className="text-xs font-medium text-on-surface">{opt.label}</span>
                              {isSelected && <Check className="h-3 w-3 text-secondary ml-auto" />}
                            </div>
                          </motion.label>
                        );
                      })}
                    </div>
                  </section>

                  {/* Density & High Contrast Typography */}
                  <section className="space-y-4 pt-4 border-t border-outline-variant/15">
                    <div>
                      <h2 className="text-sm font-semibold text-on-surface mb-0.5">Typography & Contrast</h2>
                      <p className="text-xs text-on-surface-variant">Adjust typography contrast for enhanced readability across all pages.</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2.5">
                          <BookOpen className="h-4 w-4 text-on-surface-variant" />
                          <div>
                            <span className="text-xs font-medium text-on-surface block">High Contrast Typography</span>
                            <span className="text-[10px] text-on-surface-variant block">Default is OFF</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={highContrast}
                          onClick={() => setHighContrast(!highContrast)}
                          className={cn(
                            "w-8 h-4.5 rounded-full relative transition-colors duration-200 cursor-pointer",
                            highContrast ? "bg-secondary" : "bg-outline-variant/30"
                          )}
                        >
                          <div
                            className={cn(
                              "absolute top-0.5 w-3.5 h-3.5 bg-surface-container-lowest rounded-full transition-transform duration-200",
                              highContrast ? "right-0.5" : "left-0.5"
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Sidebar Layout Options */}
                  <section className="space-y-4 pt-4 border-t border-outline-variant/15">
                    <div>
                      <h2 className="text-sm font-semibold text-on-surface mb-0.5">Sidebar Layout</h2>
                      <p className="text-xs text-on-surface-variant">Configure navigation menu behavior. Default is Always Visible.</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={sidebarLayout === "always-visible" ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setSidebarLayout("always-visible")}
                        className="flex-1 text-xs"
                      >
                        Always Visible
                      </Button>
                      <Button
                        type="button"
                        variant={sidebarLayout === "auto-hide" ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setSidebarLayout("auto-hide")}
                        className="flex-1 text-xs"
                      >
                        Auto-hide
                      </Button>
                      <Button
                        type="button"
                        variant={sidebarLayout === "icons-only" ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setSidebarLayout("icons-only")}
                        className="flex-1 text-xs"
                      >
                        Icons Only
                      </Button>
                    </div>
                  </section>
                </div>

                <div className="mt-auto px-8 py-4 border-t border-outline-variant/15 flex justify-end gap-3 shrink-0">
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </motion.main>
            )}

            {/* 4. ANALYTICS TAB */}
            {activeTab === "analytics" && (
              <motion.main
                key="analytics"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex-1 overflow-y-auto no-scrollbar flex flex-col"
              >
                <header className="h-12 flex items-center justify-between px-8 border-b border-outline-variant/15 shrink-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Analytics Settings
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
                    aria-label="Close settings"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>

                <div className="px-8 py-6 space-y-6 max-w-xl">
                  <div>
                    <h2 className="text-xl font-bold text-on-surface">Analytics & Telemetry</h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Configure data collection intervals and automated reports.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        Telemetry Ingestion Interval
                      </label>
                      <select className="w-full h-9 px-3 text-xs text-on-surface border border-outline-variant/20 rounded-md bg-surface">
                        <option>Real-time (5 seconds)</option>
                        <option>Standard (30 seconds)</option>
                        <option>Batch (5 minutes)</option>
                      </select>
                    </div>

                    <div className="space-y-1 border-t border-outline-variant/15 pt-4">
                      <span className="text-xs font-semibold text-on-surface">Weekly Executive Summary</span>
                      <p className="text-xs text-on-surface-variant">
                        Email digest of weekly incident response MTTR metrics.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto px-8 py-4 border-t border-outline-variant/15 flex justify-end gap-3 shrink-0">
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </motion.main>
            )}

            {/* 5. TEAM TAB */}
            {activeTab === "team" && (
              <motion.main
                key="team"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex-1 overflow-y-auto no-scrollbar flex flex-col"
              >
                <header className="h-12 flex items-center justify-between px-8 border-b border-outline-variant/15 shrink-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Team Members
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
                    aria-label="Close settings"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>

                <div className="px-8 py-6 space-y-6 max-w-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-on-surface">Team & Roles</h2>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Manage members and organization membership roles.
                      </p>
                    </div>
                    <Button size="sm" className="flex items-center gap-1 text-xs">
                      <Plus className="h-3.5 w-3.5" /> Invite Member
                    </Button>
                  </div>

                  <section className="border border-outline-variant/15 rounded-md overflow-hidden bg-surface-container-lowest">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-container-low border-b border-outline-variant/15 text-on-surface-variant font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Member</th>
                          <th className="py-2.5 px-3">Role</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                        <tr>
                          <td className="py-2.5 px-3 font-medium">
                            {firstName} {lastName} ({user?.email})
                          </td>
                          <td className="py-2.5 px-3 text-on-surface-variant">{membership?.role || "ADMIN"}</td>
                          <td className="py-2.5 px-3 text-secondary font-semibold">{membership?.status || "ACTIVE"}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-medium">Sarah Connor (sarah@acme.tech)</td>
                          <td className="py-2.5 px-3 text-on-surface-variant">MEMBER</td>
                          <td className="py-2.5 px-3 text-secondary font-semibold">ACTIVE</td>
                        </tr>
                      </tbody>
                    </table>
                  </section>
                </div>

                <div className="mt-auto px-8 py-4 border-t border-outline-variant/15 flex justify-end gap-3 shrink-0">
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </motion.main>
            )}

            {/* 6. AUDIT LOGS TAB */}
            {activeTab === "audit" && (
              <motion.main
                key="audit"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex-1 overflow-y-auto no-scrollbar flex flex-col"
              >
                <header className="h-12 flex items-center justify-between px-8 border-b border-outline-variant/15 shrink-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Security & Audit Log
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
                    aria-label="Close settings"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>

                <div className="px-8 py-6 space-y-6 max-w-2xl">
                  <div>
                    <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      Security & Audit Logs
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Review workspace security events, authentication records, and operator activity.
                    </p>
                  </div>

                  {!canViewAudit ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-surface-container-low border border-outline-variant/15 rounded-xl text-center">
                      <ShieldCheck className="w-8 h-8 text-amber-500 mb-2" />
                      <h3 className="text-sm font-bold text-on-surface">Access Restricted</h3>
                      <p className="text-xs text-on-surface-variant mt-1 max-w-sm">
                        You do not have permission to view the audit log. Please contact your workspace administrator.
                      </p>
                    </div>
                  ) : isAuditLoading ? (
                    <div className="p-8 text-center text-xs text-on-surface-variant flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading audit events…</span>
                    </div>
                  ) : auditEvents.length === 0 ? (
                    <div className="p-8 text-center text-xs text-on-surface-variant bg-surface-container-low rounded-lg border border-outline-variant/10">
                      No security events recorded.
                    </div>
                  ) : (
                    <div className="border border-outline-variant/15 rounded-lg overflow-hidden bg-surface-container-lowest divide-y divide-outline-variant/10">
                      {auditEvents.map((event) => (
                        <div key={event.id} className="p-3.5 hover:bg-surface-container-low/50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase tracking-wider",
                                    event.status === "SUCCESS"
                                      ? "bg-primary/10 text-primary border border-primary/20"
                                      : "bg-red-500/10 text-red-500 border border-red-500/20"
                                  )}
                                >
                                  {event.status}
                                </span>
                                <span className="font-semibold text-on-surface text-xs font-mono">{event.type}</span>
                              </div>
                              <p className="text-xs text-on-surface-variant">{event.description}</p>
                              <p className="text-[11px] font-mono text-on-surface-variant/70">Actor: {event.actor}</p>
                            </div>
                            <span className="text-[11px] text-on-surface-variant shrink-0 font-mono">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-auto px-8 py-4 border-t border-outline-variant/15 flex justify-end gap-3 shrink-0">
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </motion.main>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
