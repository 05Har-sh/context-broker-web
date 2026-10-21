"use client";

import { motion } from "framer-motion";

interface SeverityItem {
  severity: string;
  count: number;
}

type SeverityData = SeverityItem[] | Record<string, number>;

export default function ContextBreakdown({
  severityData,
  onConnectClick,
}: {
  severityData?: SeverityData | null;
  onConnectClick?: () => void;
}) {
  let highImpact = 0;
  let lowImpact = 0;

  if (severityData) {
    if (Array.isArray(severityData)) {
      severityData.forEach(item => {
        const sev = item.severity?.toUpperCase();
        const count = item.count || 0;
        if (sev === 'CRITICAL' || sev === 'HIGH') highImpact += count;
        else if (sev === 'MEDIUM' || sev === 'LOW') lowImpact += count;
      });
    } else if (typeof severityData === 'object') {
      const data = severityData as Record<string, number>;
      highImpact = (data.High || 0) + (data.Critical || 0) + (data.high || 0) + (data.critical || 0);
      lowImpact = (data.Low || 0) + (data.Medium || 0) + (data.low || 0) + (data.medium || 0);
    }
  }

  const total = highImpact + lowImpact;

  if (total === 0) {
    return (
      <div className="bg-surface-container-lowest ghost-border p-6 rounded-md h-full flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-on-surface mb-2">Severity Distribution (High vs Low Impact)</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed mt-2">
            Severity appears after events arrive. Context Broker continuously analyzes incoming alert payloads to categorize incidents into Critical, High, Medium, and Low impact distribution.
          </p>
        </div>

        <div className="py-6 flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-sm space-y-3 opacity-60">
            <div>
              <div className="flex justify-between text-[10px] text-on-surface-variant mb-1">
                <span>High Impact (Critical / High)</span>
                <span>0 incidents</span>
              </div>
              <div className="w-full bg-surface-container-low h-1.5 rounded-full" />
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-on-surface-variant mb-1">
                <span>Low Impact (Medium / Low)</span>
                <span>0 incidents</span>
              </div>
              <div className="w-full bg-surface-container-low h-1.5 rounded-full" />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-outline-variant/10 flex items-center justify-between text-[11px] text-on-surface-variant/70">
          <span>0 events recorded</span>
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
  const highPct = total > 0 ? (highImpact / total) * 100 : 0;
  const lowPct = total > 0 ? (lowImpact / total) * 100 : 0;

  return (
    <div className="bg-surface-container-lowest ghost-border p-6 rounded-md h-full flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-bold text-on-surface mb-6">Severity Distribution (High vs Low Impact)</h3>
        <div className="space-y-8">
          <div>
            <div className="flex justify-between text-[10px] mb-2">
              <span className="font-medium">High Impact (Critical / High)</span>
              <span className="text-outline">{total > 0 ? highImpact : '--'} incidents</span>
            </div>
            <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
              <motion.div
                className="bg-error h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${highPct}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] mb-2">
              <span className="font-medium">Low Impact (Medium / Low)</span>
              <span className="text-outline">{total > 0 ? lowImpact : '--'} incidents</span>
            </div>
            <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
              <motion.div
                className="bg-secondary opacity-40 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${lowPct}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
