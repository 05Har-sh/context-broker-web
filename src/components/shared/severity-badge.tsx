"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

const severityVariantMap: Record<SeverityLevel, "critical" | "high" | "medium" | "low"> = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

interface SeverityBadgeProps {
  severity: string;
  showResolved?: boolean;
  className?: string;
}

export function SeverityBadge({ severity, showResolved = false, className }: SeverityBadgeProps) {
  if (showResolved) {
    return (
      <Badge variant="resolved" className={className}>
        <CheckCircle className="h-3 w-3" />
        Resolved
      </Badge>
    );
  }

  const normalized = severity?.toUpperCase() as SeverityLevel;
  const variant = severityVariantMap[normalized] || "default";

  return (
    <Badge variant={variant} className={className}>
      {severity || "Unknown"}
    </Badge>
  );
}
