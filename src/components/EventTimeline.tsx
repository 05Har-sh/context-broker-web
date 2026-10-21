"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { IncidentEvent } from "@/types";

// ─── event type metadata ─────────────────────────────────────────────────────

const EVENT_META: Record<string, { label: string; dotColor: string; bgColor: string; textColor: string }> = {
  ALERT_SENT:         { label: "Alert Sent",          dotColor: "bg-red-500",    bgColor: "bg-red-500/10",    textColor: "text-red-400" },
  SEVERITY_CHANGED:   { label: "Severity Changed",    dotColor: "bg-orange-400", bgColor: "bg-orange-400/10", textColor: "text-orange-400" },
  SEVERITY_EVALUATED: { label: "Severity Evaluated",  dotColor: "bg-yellow-400", bgColor: "bg-yellow-400/10", textColor: "text-yellow-400" },
  INCIDENT_CREATED:   { label: "Detection: Automated Alert", dotColor: "bg-emerald-500", bgColor: "bg-emerald-500/10", textColor: "text-emerald-400" },
  INCIDENT_RESOLVED:  { label: "Resolved",            dotColor: "bg-green-500",  bgColor: "bg-green-500/10",  textColor: "text-green-400" },
  COMMENT_ADDED:      { label: "Comment",             dotColor: "bg-purple-400", bgColor: "bg-purple-400/10", textColor: "text-purple-400" },
  ASSIGNED:           { label: "Assigned",            dotColor: "bg-cyan-400",   bgColor: "bg-cyan-400/10",   textColor: "text-cyan-400" },
};

function getMeta(eventType: string) {
  return EVENT_META[eventType] ?? {
    label: eventType.replace(/_/g, " "),
    dotColor: "bg-outline-variant",
    bgColor: "bg-surface-variant/40",
    textColor: "text-on-surface-variant",
  };
}

function formatUtcTime(ts: string) {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    const hh = d.getUTCHours().toString().padStart(2, "0");
    const mm = d.getUTCMinutes().toString().padStart(2, "0");
    return `${hh}:${mm} UTC`;
  } catch { return ts; }
}

function formatTs(ts: string) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  } catch { return ts; }
}

// ─── animations ─────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10, y: 4 },
  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
};

// ─── component ──────────────────────────────────────────────────────────────

interface EventTimelineProps {
  events?: IncidentEvent[] | null;
  /** Show compact (dashboard) mode with max 4 items + "view more" link */
  compact?: boolean;
  /** Incident key used for the "view more" link in compact mode */
  incidentKey?: string;
  emptyState?: 'NO_INTEGRATIONS' | 'INTEGRATION_CONNECTED_NO_EVENTS' | 'EVENTS_NO_ACTIVE_INCIDENTS' | 'ACTIVE_DATA';
  onConnectClick?: () => void;
}

export default function EventTimeline({
  events,
  compact = false,
  incidentKey,
  emptyState = 'NO_INTEGRATIONS',
  onConnectClick,
}: EventTimelineProps) {
  const hasEvents = Boolean(events && events.length > 0);

  // ── compact mode (dashboard widget matching screenshot) ──────────────────
  if (compact) {
    if (!hasEvents) {
      return (
        <div className="bg-surface-container-lowest ghost-border p-6 rounded-md flex flex-col justify-between h-full">
          <div>
            <h3 className="text-xs font-bold text-on-surface mb-4">Event Progression</h3>
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-2.5">
                <span className="text-sm font-mono">0</span>
              </div>
              <h4 className="text-xs font-semibold text-on-surface mb-1">
                Your incident timeline will appear here
              </h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed max-w-[240px]">
                {emptyState === 'NO_INTEGRATIONS'
                  ? 'Connect Slack or Jira to start streaming real-time incident event telemetry.'
                  : emptyState === 'INTEGRATION_CONNECTED_NO_EVENTS'
                  ? 'Waiting for first event. Chronological alerts will be logged here automatically.'
                  : 'No active incident timeline. You can review past events in history.'}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-outline-variant/10 flex items-center justify-between text-xs">
            {emptyState === 'NO_INTEGRATIONS' && onConnectClick ? (
              <button
                onClick={onConnectClick}
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                Connect integration &rarr;
              </button>
            ) : (
              <span className="text-[11px] text-on-surface-variant/60">
                {emptyState === 'INTEGRATION_CONNECTED_NO_EVENTS' ? 'Awaiting events…' : 'All clear'}
              </span>
            )}
            <Link
              href="/dashboard/incidents"
              className="text-[11px] font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Incident history
            </Link>
          </div>
        </div>
      );
    }

    const LIMIT = 4;
    const sorted = [...events!].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const visible = sorted.slice(0, LIMIT);
    const targetUrl = incidentKey ? `/dashboard/incidents/${incidentKey}` : `/dashboard/incidents`;

    return (
      <div className="bg-surface-container-lowest ghost-border p-6 rounded-md flex flex-col justify-between h-full">
        <div>
          <h3 className="text-xs font-bold text-on-surface mb-6">Event Progression</h3>

          <div className="relative pl-1">
            {/* vertical connector line behind dots */}
            <div className="absolute left-[6px] top-2 bottom-3 w-[2px] bg-slate-200 dark:bg-slate-700" />

            <div className="space-y-4">
              {visible.map((evt, idx) => {
                const isFirst = idx === 0;
                const meta = getMeta(evt.eventType);
                const title = evt.description || meta.label;
                const timeStr = formatUtcTime(evt.timestamp);

                return (
                  <div key={`${evt.eventType}-${evt.timestamp}-${idx}`} className="relative flex items-start gap-4">
                    {/* Dot */}
                    <div
                      className={`relative z-10 w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 ${
                        isFirst
                          ? "bg-emerald-600 border-2 border-emerald-600 shadow-[0_0_6px_rgba(22,163,74,0.4)]"
                          : "bg-slate-400 dark:bg-slate-600 border-2 border-surface"
                      }`}
                    />

                    {/* Content: Time above, Title below */}
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-[11px] font-mono ${isFirst ? "text-emerald-700 dark:text-emerald-400 font-semibold" : "text-slate-400 font-medium"}`}>
                        {timeStr}
                      </span>
                      <span className={`text-xs leading-snug ${isFirst ? "font-bold text-on-surface" : "font-semibold text-on-surface-variant"}`}>
                        {title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-1">
          <Link
            href={targetUrl}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer inline-block"
          >
            view more
          </Link>
        </div>
      </div>
    );
  }

  // ── full mode (incident detail / timeline page) ───────────────────────────
  if (!hasEvents) {
    return (
      <div className="p-8 text-center bg-surface-container-low rounded-lg border border-outline-variant/15">
        <p className="text-sm font-semibold text-on-surface">Your incident timeline will appear here</p>
        <p className="text-xs text-on-surface-variant mt-1">
          No events recorded for this incident yet.
        </p>
      </div>
    );
  }

  const sorted = [...events!].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative space-y-4 before:absolute before:left-[9px] before:top-3 before:bottom-3 before:w-px before:bg-outline-variant/25"
    >
      {sorted.map((evt, idx) => {
        const meta = getMeta(evt.eventType);
        return (
          <motion.div
            key={`${evt.eventType}-${evt.timestamp}-${idx}`}
            variants={itemVariants}
            className="relative pl-7"
          >
            {/* colored dot */}
            <span className={`absolute left-0 top-[5px] w-[19px] h-[19px] rounded-full ${meta.dotColor} ring-2 ring-surface shadow-sm`} />

            <div className={`rounded-lg px-4 py-3 ${meta.bgColor} border border-outline/10`}>
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${meta.textColor}`}>
                  {meta.label}
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono shrink-0">
                  {formatTs(evt.timestamp)}
                </span>
              </div>

              <p className="text-xs text-on-surface leading-relaxed">{evt.description}</p>

              {evt.content && (
                <p className="mt-1 text-[11px] text-on-surface-variant italic">{evt.content}</p>
              )}

              <span className="inline-block mt-2 text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-outline/10 text-outline">
                {evt.source}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
