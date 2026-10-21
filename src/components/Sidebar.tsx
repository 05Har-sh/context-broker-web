"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ListTodo,
  Cable,
  HelpCircle,
  Settings,
  ChevronRight,
} from "lucide-react";
import IntegrationsModal from "./IntegrationsModal";
import { useTheme } from "./ThemeProvider";
import { useSettingsModal } from "./SettingsModalProvider";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const { openSettings } = useSettingsModal();
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { sidebarLayout } = useTheme();

  useEffect(() => {
    if (
      (searchParams.has('slack_oauth') || searchParams.has('slack') || searchParams.has('jira')) &&
      pathname !== '/settings/integrations' &&
      pathname !== '/integrations'
    ) {
      const timer = setTimeout(() => setIsIntegrationsOpen(true), 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, pathname]);

  const isIconsOnly = sidebarLayout === "icons-only";
  const isAutoHide = sidebarLayout === "auto-hide";

  // Sidebar is expanded if layout is always-visible, or if auto-hide is active and currently hovered
  const isExpanded = sidebarLayout === "always-visible" || (isAutoHide && isHovered);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, isButton: false },
    { label: "Incident Repo", href: "/dashboard/incidents", icon: ListTodo, isButton: false },
    {
      label: "Integrations",
      icon: Cable,
      isButton: true,
      onClick: () => setIsIntegrationsOpen(true),
    },
  ];

  return (
    <>
      <aside
        onMouseEnter={() => isAutoHide && setIsHovered(true)}
        onMouseLeave={() => isAutoHide && setIsHovered(false)}
        className={cn(
          "hidden md:flex flex-col py-6 px-3 bg-surface-container-low left-0 h-[calc(100vh-64px)] border-r border-outline-variant/15 sticky top-16 transition-all duration-300 z-40",
          isIconsOnly && "w-16 items-center px-2",
          !isIconsOnly && isExpanded && "w-64 shadow-lg",
          !isIconsOnly && !isExpanded && isAutoHide && "w-12 opacity-80 hover:opacity-100 cursor-pointer overflow-hidden"
        )}
      >
        {/* Header / Brand */}
        <div className={cn("mb-6 px-2 transition-all", isIconsOnly && "px-0 flex justify-center")}>
          {isIconsOnly ? (
            <img src="/logo.svg" alt="Logo" className="w-8 h-8 object-contain" title="Incident Intel" />
          ) : isAutoHide && !isExpanded ? (
            <div className="flex items-center justify-center w-full py-1 text-secondary" title="Hover to expand sidebar">
              <ChevronRight className="h-5 w-5 animate-pulse" />
            </div>
          ) : (
            <div>
              <h2 className="text-sm font-semibold text-on-surface flex items-center gap-2">
                Incident Intel
                {isAutoHide && (
                  <span className="text-[9px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded font-mono uppercase">
                    Auto
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-on-surface-variant">Active Ops</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 w-full" aria-label="Sidebar navigation">
          {navItems.map((item) => {
            const isActive = !item.isButton && pathname === item.href;
            const Icon = item.icon;

            if (item.isButton) {
              return (
                <motion.button
                  key={item.label}
                  type="button"
                  title={isIconsOnly || (isAutoHide && !isExpanded) ? item.label : undefined}
                  whileHover={{ x: isIconsOnly ? 0 : 2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={item.onClick}
                  className={cn(
                    "w-full flex items-center gap-3 py-2 px-3 rounded-md transition-all duration-200 group text-left",
                    isIconsOnly && "justify-center px-0",
                    isIntegrationsOpen
                      ? "text-on-surface font-bold bg-surface-container-lowest shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] transition-colors duration-200 shrink-0",
                      isIntegrationsOpen
                        ? "text-secondary"
                        : "text-on-surface-variant group-hover:text-on-surface"
                    )}
                  />
                  {(isExpanded && !isIconsOnly) && (
                    <span className="text-xs font-medium tracking-normal truncate">{item.label}</span>
                  )}
                </motion.button>
              );
            }

            return (
              <motion.a
                key={item.label}
                href={item.href}
                title={isIconsOnly || (isAutoHide && !isExpanded) ? item.label : undefined}
                whileHover={{ x: isIconsOnly ? 0 : 2 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-md transition-all duration-200 group",
                  isIconsOnly && "justify-center px-0",
                  isActive
                    ? "text-on-surface font-bold bg-surface-container-lowest shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] transition-colors duration-200 shrink-0",
                    isActive ? "text-secondary" : "text-on-surface-variant group-hover:text-on-surface"
                  )}
                />
                {(isExpanded && !isIconsOnly) && (
                  <span className="text-xs font-medium tracking-normal truncate">{item.label}</span>
                )}
              </motion.a>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="mt-auto pt-4 space-y-1 border-t border-outline-variant/10 w-full">
          <motion.a
            whileHover={{ x: isIconsOnly ? 0 : 2 }}
            whileTap={{ scale: 0.97 }}
            title={isIconsOnly || (isAutoHide && !isExpanded) ? "Help & Support" : undefined}
            className={cn(
              "flex items-center gap-3 py-2 px-3 text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-md transition-all duration-200 group",
              isIconsOnly && "justify-center px-0"
            )}
            href="#"
          >
            <HelpCircle className="h-[18px] w-[18px] group-hover:text-on-surface transition-colors shrink-0" />
            {(isExpanded && !isIconsOnly) && (
              <span className="text-xs font-medium tracking-normal truncate">Help &amp; Support</span>
            )}
          </motion.a>
          <motion.button
            whileHover={{ x: isIconsOnly ? 0 : 2 }}
            whileTap={{ scale: 0.97 }}
            title={isIconsOnly || (isAutoHide && !isExpanded) ? "Settings" : undefined}
            onClick={() => openSettings()}
            className={cn(
              "w-full flex items-center gap-3 py-2 px-3 text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-md transition-all duration-200 group",
              isIconsOnly && "justify-center px-0"
            )}
          >
            <Settings className="h-[18px] w-[18px] group-hover:text-on-surface transition-colors shrink-0" />
            {(isExpanded && !isIconsOnly) && (
              <span className="text-xs font-medium tracking-normal text-left truncate">Settings</span>
            )}
          </motion.button>
        </div>
      </aside>
      <IntegrationsModal isOpen={isIntegrationsOpen} onClose={() => setIsIntegrationsOpen(false)} />
    </>
  );
}
