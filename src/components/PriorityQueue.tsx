"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface Incident {
  key?: string;
  incidentKey?: string;
  summary?: string;
  severity?: string;
  status?: string;
  riskScore?: number;
  created?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function getSeverityVariant(severity?: string): "critical" | "high" | "medium" | "low" | "default" {
  const s = severity?.toLowerCase();
  if (s === "critical" || s === "high") return "critical";
  if (s === "medium") return "medium";
  if (s === "low") return "low";
  return "default";
}

export default function PriorityQueue({
  incidents = [],
  emptyState = 'NO_INTEGRATIONS',
  onConnectClick,
}: {
  incidents?: Incident[] | null;
  emptyState?: 'NO_INTEGRATIONS' | 'INTEGRATION_CONNECTED_NO_EVENTS' | 'EVENTS_NO_ACTIVE_INCIDENTS' | 'ACTIVE_DATA';
  onConnectClick?: () => void;
}) {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="bg-surface-container-lowest ghost-border p-6 rounded-md flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-on-surface">High Priority Queue</h3>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
              0 Active
            </span>
          </div>
          <div className="py-4 text-center">
            <p className="text-xs font-semibold text-on-surface mb-1">
              {emptyState === 'EVENTS_NO_ACTIVE_INCIDENTS'
                ? "You're all caught up"
                : emptyState === 'INTEGRATION_CONNECTED_NO_EVENTS'
                ? "Listening for active incidents"
                : "No active incidents detected"}
            </p>
            <p className="text-[11px] text-on-surface-variant leading-relaxed max-w-sm mx-auto">
              {emptyState === 'NO_INTEGRATIONS'
                ? 'Connect Slack or Jira to start collecting incident data.'
                : emptyState === 'INTEGRATION_CONNECTED_NO_EVENTS'
                ? "Your integration is connected. We're waiting for the first incident event."
                : 'There are no active incidents right now. The queue is completely clear.'}
            </p>
          </div>
        </div>

        {emptyState === 'NO_INTEGRATIONS' && onConnectClick && (
          <div className="pt-3 border-t border-outline-variant/10 flex justify-center">
            <button
              onClick={onConnectClick}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              + Connect integration
            </button>
          </div>
        )}
      </div>
    );
  }

  const sorted = [...incidents].sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
  const displayIncidents = sorted.slice(0, 3);

  return (
    <div className="bg-surface-container-lowest ghost-border p-6 rounded-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-on-surface">High Priority Queue</h3>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {displayIncidents.map((inc) => (
          <motion.div
            key={inc.incidentKey || inc.key}
            variants={rowVariants}
            whileHover={{ x: 2 }}
            className="flex items-center justify-between group cursor-pointer bg-surface hover:bg-surface-container-low py-2 px-3 rounded-md transition-colors border border-transparent hover:border-outline-variant/15 gap-4"
          >
            {/* Key */}
            <span className="font-mono text-[11px] font-bold text-on-surface bg-surface-container px-2 py-1 rounded-md shrink-0 w-[72px] text-center shadow-sm">
              {inc.incidentKey || inc.key}
            </span>

            {/* Risk Score */}
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[9px] font-bold text-on-surface-variant uppercase tracking-widest px-0.5">
                <span>Risk Score</span>
                <span className={
                  (inc.riskScore || 0) >= 80 ? 'text-error' :
                  (inc.riskScore || 0) >= 50 ? 'text-orange-500' :
                  'text-secondary'
                }>{inc.riskScore || 0}</span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden flex">
                <motion.div
                  className={`h-full rounded-full ${
                    (inc.riskScore || 0) >= 80 ? 'bg-error shadow-[0_0_8px_rgba(220,38,38,0.5)]' :
                    (inc.riskScore || 0) >= 50 ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' :
                    'bg-secondary shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(inc.riskScore || 0, 100)}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                />
              </div>
            </div>

            {/* Severity Badge */}
            <Badge
              variant={getSeverityVariant(inc.severity)}
              className="shrink-0 w-16 justify-center text-[9px]"
            >
              {inc.severity || 'Unknown'}
            </Badge>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
