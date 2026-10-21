"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hasPermission } from "@/lib/permissions";
import { Building2, Globe, Users, Briefcase, CheckCircle2, AlertCircle } from "lucide-react";

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

export default function OrganizationSettingsPage() {
  const { user, organization, updateOrganization } = useAuth();
  
  const [name, setName] = useState(organization?.name || "Acme Technologies");
  const [workspaceUrl, setWorkspaceUrl] = useState(organization?.workspaceUrl || "acme");
  const [industry, setIndustry] = useState(organization?.industry || "Software / Technology");
  const [teamSize, setTeamSize] = useState(organization?.teamSize || "11–50");
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (organization) {
      setName(organization.name || "Acme Technologies");
      setWorkspaceUrl(organization.workspaceUrl || "acme");
      setIndustry(organization.industry || "Software / Technology");
      setTeamSize(organization.teamSize || "11–50");
    }
  }, [organization]);

  const canManage = hasPermission(user?.role, "MANAGE_WORKSPACE");

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface border border-outline/20 rounded-xl">
        <AlertCircle className="w-10 h-10 text-error mb-3" />
        <h2 className="text-xl font-bold text-on-surface">Access Denied</h2>
        <p className="text-sm text-on-surface-variant mt-2 text-center max-w-md">
          You do not have permission to view or manage organization settings. Please contact your workspace administrator.
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSavedStatus(null);

    setTimeout(() => {
      updateOrganization({
        name,
        workspaceUrl,
        industry,
        teamSize,
      });
      setIsSubmitting(false);
      setSavedStatus("Organization settings updated successfully!");
      setTimeout(() => setSavedStatus(null), 3500);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          Organization
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Manage your organization name, workspace URL, industry, and team size settings.
        </p>
      </div>

      {savedStatus && (
        <div className="flex items-center gap-3 p-4 bg-secondary/10 border border-secondary/30 rounded-lg text-secondary text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{savedStatus}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface border border-outline/20 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 space-y-6">
          {/* Organization Name */}
          <div className="space-y-2">
            <label htmlFor="org-name" className="text-sm font-semibold text-on-surface flex items-center gap-2">
              <Building2 className="w-4 h-4 text-on-surface-variant" />
              Organization name
            </label>
            <Input
              id="org-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Technologies"
              required
              className="max-w-xl"
            />
            <p className="text-xs text-on-surface-variant">The official name of your company or team.</p>
          </div>

          {/* Workspace URL */}
          <div className="space-y-2">
            <label htmlFor="workspace-url" className="text-sm font-semibold text-on-surface flex items-center gap-2">
              <Globe className="w-4 h-4 text-on-surface-variant" />
              Workspace URL
            </label>
            <div className="flex items-center max-w-xl">
              <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-outline/20 bg-surface-variant/40 text-on-surface-variant text-xs font-mono">
                app.contextbroker.io/
              </span>
              <Input
                id="workspace-url"
                type="text"
                value={workspaceUrl}
                onChange={(e) => setWorkspaceUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="acme"
                required
                className="rounded-l-none"
              />
            </div>
            <p className="text-xs text-on-surface-variant">
              Unique slug used to access your organization dashboard.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-xl">
            {/* Industry Dropdown */}
            <div className="space-y-2">
              <label htmlFor="org-industry" className="text-sm font-semibold text-on-surface flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-on-surface-variant" />
                Industry
              </label>
              <div className="relative">
                <select
                  id="org-industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm text-on-surface border border-outline/20 rounded-md bg-surface transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer"
                >
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Team Size Dropdown */}
            <div className="space-y-2">
              <label htmlFor="org-teamsize" className="text-sm font-semibold text-on-surface flex items-center gap-2">
                <Users className="w-4 h-4 text-on-surface-variant" />
                Team size
              </label>
              <div className="relative">
                <select
                  id="org-teamsize"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm text-on-surface border border-outline/20 rounded-md bg-surface transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer"
                >
                  {TEAM_SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-surface-variant/30 border-t border-outline/10 flex items-center justify-between">
          <p className="text-xs text-on-surface-variant">
            Changes will take effect across all workspace members.
          </p>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>

      <div className="bg-surface border border-error/40 rounded-xl overflow-hidden mt-8 shadow-sm">
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-error">Danger Zone</h3>
          <p className="text-sm text-on-surface-variant">
            Irreversible and destructive actions for your organization workspace.
          </p>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-t border-error/20 pt-4 mt-4 gap-4">
            <div>
              <p className="font-medium text-on-surface">Delete this organization</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Once deleted, all telemetry, incidents, and member data will be permanently removed.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Organization
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
