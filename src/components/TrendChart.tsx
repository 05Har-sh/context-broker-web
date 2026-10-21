"use client";

import { motion } from "framer-motion";

interface TrendDataPoint {
  count: number;
  date: string;
}

type TrendInput = number | { count?: number; date?: string };

export default function TrendChart({ trend = [] }: { trend?: TrendInput[] | null }) {
  if (!trend || trend.length === 0) {
    return (
      <div className="bg-surface-container-lowest ghost-border p-6 rounded-md flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-on-surface">7-Day Incident Trend</h3>
            <span className="text-[9px] text-on-surface-variant font-medium uppercase tracking-wider">
              0 Incidents
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Incident activity across the past 7 days will be graphed here. Telemetry populates automatically as alerts are evaluated.
          </p>
        </div>
        <div className="flex items-end gap-2 h-20 pt-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="w-full h-1 bg-surface-container-high rounded-full" />
              <span className="text-[8px] text-on-surface-variant/40 mt-1 font-mono">D{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const dataPoints: TrendDataPoint[] = trend.slice(-7).map((d, i) => {
    if (typeof d === 'number') return { count: d, date: `Day ${i + 1}` };
    return { count: d.count || 0, date: d.date || `Day ${i + 1}` };
  });

  const max = Math.max(...dataPoints.map(d => d.count), 1);

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.startsWith('Day ')) return dateStr;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-surface-container-lowest ghost-border p-6 rounded-md flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-on-surface">7-Day Incident Trend</h3>
        <span className="text-[9px] text-on-surface-variant font-medium uppercase tracking-wider">
          Max: {max}
        </span>
      </div>
      {/* Chart area */}
      <div className="flex-1 flex items-end gap-2 min-h-[120px]">
        {dataPoints.map((d, i) => {
          const pct = (d.count / max) * 100;
          const barHeight = d.count === 0 ? '4px' : `${pct}%`;
          return (
            <div
              key={`trend-bar-${i}`}
              className="relative flex-1 flex flex-col items-center justify-end h-full group/bar"
            >
              {/* Tooltip */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-surface-container-high text-on-surface px-2 py-1 rounded-md text-[10px] opacity-0 group-hover/bar:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap shadow-sm border border-outline-variant/20">
                <span className="font-bold">{d.count}</span> <span className="text-on-surface-variant">on {formatDate(d.date)}</span>
              </div>
              {/* Bar */}
              <motion.div
                className="w-full rounded-t-md bg-secondary/80 group-hover/bar:bg-secondary cursor-pointer transition-colors"
                initial={{ height: 0 }}
                animate={{ height: barHeight }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 + i * 0.08 }}
                style={{ transformOrigin: 'bottom' }}
              />
              {/* Day label */}
              <span className="text-[8px] text-outline mt-1.5 font-medium">
                {formatDate(d.date).replace(/\s/, '\n').split('\n').pop()}
              </span>
            </div>
          );
        })}
      </div>
      {/* Date range footer */}
      <div className="flex justify-between mt-1 text-[9px] text-outline font-medium border-t border-outline-variant/10 pt-2">
        <span>{formatDate(dataPoints[0]?.date)}</span>
        <span className="text-[9px] text-on-surface-variant">{dataPoints.length} days</span>
        <span>{formatDate(dataPoints[dataPoints.length - 1]?.date)}</span>
      </div>
    </div>
  );
}
