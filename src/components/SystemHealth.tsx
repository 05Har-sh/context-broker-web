"use client";

import { motion } from "framer-motion";

interface SystemHealthProps {
  score?: number | null;
  reasons?: string[] | null;
  status?: string | null;
  metrics?: {
    total?: number;
    active?: number;
    critical?: number;
    stale?: number;
    resolved?: number;
    averageRisk?: number;
  } | null;
  emptyState?: 'NO_INTEGRATIONS' | 'INTEGRATION_CONNECTED_NO_EVENTS' | 'EVENTS_NO_ACTIVE_INCIDENTS' | 'ACTIVE_DATA';
  onConnectClick?: () => void;
  isError?: boolean;
  onRetry?: () => void;
}

/* Smooth continuous arc gauge — System Health */
function HealthArc({ score, size = 140 }: { score: number; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) - 14;
  const strokeW = 8;
  const startAngle = 135;
  const sweepAngle = 270;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const x1 = cx + radius * Math.cos(toRad(startAngle));
  const y1 = cy + radius * Math.sin(toRad(startAngle));
  const endAngle = startAngle + sweepAngle;
  const x2 = cx + radius * Math.cos(toRad(endAngle));
  const y2 = cy + radius * Math.sin(toRad(endAngle));
  const largeArc = sweepAngle > 180 ? 1 : 0;
  const arcPath = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

  const arcLength = (sweepAngle / 360) * 2 * Math.PI * radius;
  const activeLength = (score / 100) * arcLength;
  const dashOffset = arcLength - activeLength;

  const arcColor = score > 80 ? '#2E7D32' : score > 50 ? '#d97706' : '#9e422c';
  const glowColor = score > 80 ? 'rgba(46,125,50,0.35)' : score > 50 ? 'rgba(217,119,6,0.35)' : 'rgba(158,66,44,0.35)';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path
        d={arcPath}
        fill="none"
        stroke="rgba(172,179,180,0.12)"
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      <motion.path
        d={arcPath}
        fill="none"
        stroke={arcColor}
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeDasharray={arcLength}
        initial={{ strokeDashoffset: arcLength }}
        animate={{ strokeDashoffset: dashOffset }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          filter: `drop-shadow(0 0 6px ${glowColor})`,
        }}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" className="fill-on-surface" style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
        {score}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-on-surface-variant" style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
        HEALTH
      </text>
    </svg>
  );
}

/* Radial donut gauge with sweep animation — Risk Score */
function RiskDonut({ risk, size = 100 }: { risk: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size / 2) - strokeWidth - 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (risk / 100) * circumference;
  const riskColor = risk >= 80 ? '#9e422c' : risk >= 50 ? '#d97706' : '#2E7D32';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(172,179,180,0.12)" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={riskColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 4px ${riskColor}55)`,
        }}
      />
    </svg>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function SystemHealth({
  score,
  reasons,
  status,
  metrics,
  emptyState = 'NO_INTEGRATIONS',
  onConnectClick,
  isError = false,
  onRetry,
}: SystemHealthProps) {
  if (isError) {
    return (
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 bg-amber-500/10 border border-amber-500/30 p-6 rounded-md flex items-center justify-between text-xs text-amber-700 dark:text-amber-400">
          <span>Unable to retrieve system health metrics. The backend service may be initializing or unreachable.</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="underline font-semibold hover:opacity-80 transition-opacity ml-4 cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (score === null || score === undefined) {
    return (
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 bg-surface-container-lowest ghost-border p-6 rounded-md flex items-center justify-center text-xs text-on-surface-variant">
          Loading system health data…
        </div>
      </div>
    );
  }

  const isHealthy = score > 80;
  const healthTextColor = isHealthy ? 'text-secondary' : 'text-error';
  const statusDot = isHealthy ? 'bg-secondary' : 'bg-error';
  const riskVal = metrics?.averageRisk ?? 0;
  const hasConfirmedMetrics = metrics !== null && metrics !== undefined;

  const metricCards = [
    {
      label: 'Active',
      value: hasConfirmedMetrics ? (metrics.active ?? 0) : undefined,
      color: 'bg-secondary',
      textColor: 'text-on-surface-variant',
      cta: emptyState === 'NO_INTEGRATIONS' && onConnectClick ? 'Connect' : undefined,
    },
    {
      label: 'Critical',
      value: hasConfirmedMetrics ? (metrics.critical ?? 0) : undefined,
      color: 'bg-error',
      textColor: 'text-error',
    },
    {
      label: 'Resolved',
      value: hasConfirmedMetrics ? (metrics.resolved ?? 0) : undefined,
      color: 'bg-green-500',
      textColor: 'text-on-surface',
    },
    {
      label: 'Stale',
      value: hasConfirmedMetrics ? (metrics.stale ?? 0) : undefined,
      color: 'bg-orange-500',
      textColor: 'text-on-surface-variant',
      tooltip: 'Flags incidents without updates for >24h',
    },
    {
      label: 'Total',
      value: hasConfirmedMetrics ? (metrics.total ?? 0) : undefined,
      color: 'bg-outline-variant',
      textColor: 'text-on-surface-variant',
    },
  ];

  return (
    <div className="grid grid-cols-12 gap-6 mb-8">
      {/* System Health — Segmented Arc */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="col-span-12 lg:col-span-6 bg-surface-container-lowest ghost-border p-6 rounded-md flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">System Health</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${statusDot}`} />
              <span className={`text-[10px] font-medium ${healthTextColor}`}>
                {status || (isHealthy ? 'Healthy' : 'Degraded')} ({score}%)
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="shrink-0">
            <HealthArc score={score} />
          </div>
          <div className="flex-1 flex flex-col justify-center gap-3">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Diagnostics</span>
              {reasons && reasons.length > 0 ? (
                <ul className="space-y-1.5">
                  {reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-on-surface-variant leading-snug">
                      <span className={`mt-1 shrink-0 w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-secondary/60' : 'bg-error/60'}`} />
                      {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-on-surface-variant">
                  {hasConfirmedMetrics && metrics.total === 0
                    ? 'No incidents recorded yet. All systems ready.'
                    : 'All systems operational.'}
                </p>
              )}
            </div>
            <div className="border-t border-outline-variant/10 pt-2 flex items-center justify-between">
              <span className="text-[10px] font-mono text-outline">System Score: {score}/100</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-[3px] rounded-full transition-all duration-500 ${isHealthy ? 'bg-secondary' : 'bg-error'}`}
                    style={{
                      height: `${6 + Math.sin((i / 4) * Math.PI) * (score / 100) * 12}px`,
                      opacity: score >= (i + 1) * 20 ? 1 : 0.15,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Risk Score — Radial Donut */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="col-span-12 lg:col-span-3 bg-surface-container-lowest ghost-border p-6 rounded-md flex flex-col items-center justify-between"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant self-start">Current Risk Score</span>
        <div className="relative flex items-center justify-center my-auto py-2">
          <RiskDonut risk={riskVal} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-on-surface leading-none">
              {hasConfirmedMetrics ? (metrics.averageRisk ?? 0) : '--'}
            </span>
            <span className="text-[9px] text-on-surface-variant font-medium mt-0.5">/100</span>
          </div>
        </div>
        <p className="text-[10px] text-on-surface-variant leading-tight text-center">
          {hasConfirmedMetrics && metrics.total === 0
            ? 'Risk metrics require incident telemetry.'
            : 'Weighted severity & volume factors.'}
        </p>
      </motion.div>

      {/* Metric Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="col-span-12 lg:col-span-3 grid grid-rows-5 gap-2"
      >
        {metricCards.map((item) => {
          const total = (hasConfirmedMetrics && metrics.total ? metrics.total : 1);
          const valNum = typeof item.value === 'number' ? item.value : 0;
          const pct = item.label === 'Total' ? 100 : Math.min((valNum / total) * 100, 100);

          return (
            <motion.div
              key={item.label}
              variants={itemVariants}
              className="bg-surface-container-lowest ghost-border px-4 py-2 rounded-md flex items-center justify-between gap-3 group relative"
            >
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] font-medium ${item.textColor}`}>{item.label}</span>
                {item.tooltip && (
                  <span
                    className="text-[9px] text-on-surface-variant/50 cursor-help"
                    title={item.tooltip}
                  >
                    ⓘ
                  </span>
                )}
              </div>
              <div className="flex-1 h-1 rounded-full bg-surface-container-high overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${item.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${hasConfirmedMetrics ? pct : 0}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-xs font-bold ${item.label === 'Critical' ? 'text-error' : ''}`}>
                  {item.value !== undefined ? item.value : '--'}
                </span>
                {item.cta && onConnectClick && (
                  <button
                    onClick={onConnectClick}
                    className="text-[10px] text-primary hover:underline font-medium cursor-pointer"
                  >
                    +{item.cta}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
