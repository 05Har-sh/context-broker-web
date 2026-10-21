"use client";

import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  actions?: React.ReactNode;
}

export function PageHeader({ breadcrumbs, title, actions }: PageHeaderProps) {
  return (
    <div className="mb-10">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-[10px] text-on-surface-variant mb-3"
      >
        {breadcrumbs.map((crumb, idx) => (
          <span key={crumb.label} className="flex items-center gap-1.5">
            {idx > 0 && (
              <ChevronRight className="h-3 w-3 text-on-surface-variant/50" />
            )}
            {crumb.href ? (
              <a
                href={crumb.href}
                className="hover:text-on-surface transition-colors"
              >
                {crumb.label}
              </a>
            ) : (
              <span className="text-on-surface font-bold">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
          {title}
        </h1>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
