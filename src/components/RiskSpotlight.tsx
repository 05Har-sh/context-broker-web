"use client";

import { motion } from "framer-motion";

interface HighestRiskIncident {
  incidentKey?: string;
  key?: string;
  summary?: string;
  calculatedRisk?: number;
  riskScore?: number;
}

export default function RiskSpotlight({
  highestRiskIncident,
  onConnectClick,
}: {
  highestRiskIncident?: HighestRiskIncident | null;
  onConnectClick?: () => void;
}) {
  const hasIncident = Boolean(
    highestRiskIncident && (highestRiskIncident.incidentKey || highestRiskIncident.key)
  );

  if (!hasIncident) {
    return (
      <div className="bg-surface-container-lowest ghost-border p-6 rounded-md flex flex-col border-l-4 border-outline-variant/30 h-full justify-between">
        <div>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">
            Highest Risk Spotlight
          </span>
          <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
            Risk analytics need incident data. Once events arrive, Context Broker evaluates weighted severity, blast radius, and staleness to spotlight your highest risk issue.
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-outline-variant/10 flex items-center justify-between text-[11px] text-on-surface-variant/70">
          <span>Awaiting telemetry</span>
          {onConnectClick && (
            <button
              onClick={onConnectClick}
              className="text-primary hover:underline font-medium cursor-pointer"
            >
              Connect tools &rarr;
            </button>
          )}
        </div>
      </div>
    );
  }

  const incidentKey = highestRiskIncident!.incidentKey || highestRiskIncident!.key;
  const summary = highestRiskIncident!.summary || "No summary provided";
  const riskScore = highestRiskIncident!.calculatedRisk ?? highestRiskIncident!.riskScore ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="bg-surface-container-lowest ghost-border p-6 rounded-md flex flex-col border-l-4 border-error h-full justify-between"
    >
      <div>
        <span className="text-[10px] font-bold text-error uppercase tracking-widest mb-2 block">
          Highest Risk Spotlight
        </span>
        <div className="flex-1 flex flex-col justify-center mt-2">
          <h4 className="text-lg font-bold text-on-surface mb-1">
            {incidentKey}
          </h4>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] text-on-surface-variant line-clamp-2">
              {summary}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low p-3 rounded-md">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-medium text-on-surface-variant">Risk Score</span>
          <motion.span
            className="text-base font-bold text-error"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
          >
            {riskScore}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
