"use client";

import { useTheme, SidebarLayoutOption, Theme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
  BookOpen,
  LayoutGrid,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const themeOptions = [
  { id: "light" as Theme, label: "Light", icon: Sun },
  { id: "dark" as Theme, label: "Dark", icon: Moon },
  { id: "system" as Theme, label: "System", icon: Monitor },
];

const sidebarOptions: { id: SidebarLayoutOption; label: string; description: string }[] = [
  {
    id: "always-visible",
    label: "Always Visible",
    description: "Standard full sidebar with menu item labels.",
  },
  {
    id: "auto-hide",
    label: "Auto-hide",
    description: "Collapses automatically; expands on hover.",
  },
  {
    id: "icons-only",
    label: "Icons Only",
    description: "Compact icon bar with hover tooltips.",
  },
];

export default function AppearanceSettingsPage() {
  const { theme, setTheme, highContrast, setHighContrast, sidebarLayout, setSidebarLayout } =
    useTheme();

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
          <Palette className="w-6 h-6 text-primary" />
          Appearance Settings
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Customize interface theme, high contrast typography, and navigation sidebar layout.
        </p>
      </div>

      {/* 1. Interface Theme Section */}
      <div className="bg-surface border border-outline/20 rounded-xl p-6 space-y-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-on-surface">Interface Theme</h2>
          <p className="text-xs text-on-surface-variant">
            Choose your preferred color scheme for the application.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-outline/20 hover:border-outline/40 bg-surface-variant/20"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-on-surface-variant")} />
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </div>
                <span className="text-sm font-semibold text-on-surface">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. High Contrast Typography Section */}
      <div className="bg-surface border border-outline/20 rounded-xl p-6 space-y-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Density & Typography
          </h2>
          <p className="text-xs text-on-surface-variant">
            Adjust typography contrast for enhanced readability across all pages.
          </p>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-outline/10">
          <div className="space-y-0.5">
            <label htmlFor="high-contrast-toggle" className="text-sm font-semibold text-on-surface cursor-pointer">
              High Contrast Typography
            </label>
            <p className="text-xs text-on-surface-variant">
              Increases font weights, text contrast ratios, and sharpens visual elements. Default is OFF.
            </p>
          </div>
          <button
            id="high-contrast-toggle"
            type="button"
            role="switch"
            aria-checked={highContrast}
            onClick={() => setHighContrast(!highContrast)}
            className={cn(
              "w-12 h-6 rounded-full relative transition-colors duration-200 cursor-pointer flex-shrink-0",
              highContrast ? "bg-primary" : "bg-outline/30"
            )}
          >
            <div
              className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-surface transition-transform duration-200",
                highContrast ? "left-7" : "left-1"
              )}
            />
          </button>
        </div>
      </div>

      {/* 3. Sidebar Layout Section */}
      <div className="bg-surface border border-outline/20 rounded-xl p-6 space-y-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            Sidebar Layout Customization
          </h2>
          <p className="text-xs text-on-surface-variant">
            Choose how the left navigation menu behaves. Default is Always Visible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {sidebarOptions.map((opt) => {
            const isSelected = sidebarLayout === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSidebarLayout(opt.id)}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-outline/20 hover:border-outline/40 bg-surface-variant/20"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-on-surface">{opt.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">{opt.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
