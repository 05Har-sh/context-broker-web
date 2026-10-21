"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Palette, Users, Cable, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsNavTabs() {
  const pathname = usePathname();

  const tabs = [
    { label: "Organization", href: "/settings/organization", icon: Building2 },
    { label: "Appearance", href: "/settings/appearance", icon: Palette },
    { label: "Team Members", href: "/settings/members", icon: Users },
    { label: "Integrations", href: "/settings/integrations", icon: Cable },
    { label: "Audit Logs", href: "/settings/audit", icon: ShieldCheck },
  ];

  return (
    <div className="border-b border-outline-variant/15 mb-6">
      <nav className="flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Settings tabs">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href === "/settings/integrations" && pathname === "/integrations") ||
            (tab.href === "/settings/organization" && (pathname === "/settings/workspace" || pathname === "/settings"));
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                isActive
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant/30"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-on-surface-variant")} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
