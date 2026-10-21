"use client";

import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface StaleBadgeProps {
  stale: boolean;
}

export function StaleBadge({ stale }: StaleBadgeProps) {
  if (!stale) {
    return <span className="text-on-surface-variant text-[11px]">—</span>;
  }

  return (
    <Badge variant="warning">
      <AlertTriangle className="h-3 w-3" />
      Stale
    </Badge>
  );
}
