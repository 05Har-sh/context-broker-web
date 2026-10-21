"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  icon: React.ReactNode;
  id?: string;
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  icon,
  id,
}: FilterSelectProps) {
  const selectId = id || `filter-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="relative">
      <label
        htmlFor={selectId}
        className="block text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 [&_svg]:h-4 [&_svg]:w-4">
          {icon}
        </span>
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full appearance-none bg-surface-container-lowest border border-outline-variant/15 rounded-md",
            "pl-8 pr-8 py-2 text-xs text-on-surface",
            "focus:border-secondary focus:ring-1 focus:ring-secondary/20 outline-none",
            "transition-all cursor-pointer"
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant/50 pointer-events-none" />
      </div>
    </div>
  );
}
