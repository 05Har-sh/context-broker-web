"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cable, Radio, CheckCircle2, ArrowRight, RefreshCw, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardEmptyState } from "./types";

interface EmptyStateBannerProps {
  emptyState: DashboardEmptyState;
  onConnectClick: () => void;
  onViewStatusClick: () => void;
  onViewHistoryClick: () => void;
  onRefreshClick?: () => void;
  isRefreshing?: boolean;
}

export default function EmptyStateBanner({
  emptyState,
  onConnectClick,
  onViewStatusClick,
  onViewHistoryClick,
  onRefreshClick,
  isRefreshing = false,
}: EmptyStateBannerProps) {
  if (emptyState === "ACTIVE_DATA") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      {emptyState === "NO_INTEGRATIONS" && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Cable className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary">
                  Stage 1: Setup Required
                </span>
              </div>
              <h3 className="text-base font-bold text-on-surface">
                Connect Slack or Jira to start collecting incident data.
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">
                Context Broker passively listens to alerts and issues. Connect your first integration to start aggregating signals and correlating incident risks.
              </p>
            </div>
          </div>
          <Button
            onClick={onConnectClick}
            className="bg-primary text-on-primary hover:bg-primary/90 font-semibold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 shrink-0 cursor-pointer shadow-sm transition-transform active:scale-95"
          >
            <Cable className="w-4 h-4" />
            Connect integration
          </Button>
        </div>
      )}

      {emptyState === "INTEGRATION_CONNECTED_NO_EVENTS" && (
        <div className="rounded-xl border border-secondary/25 bg-secondary/5 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0 mt-0.5">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary/20 text-secondary">
                  Stage 2: Listening for Events
                </span>
              </div>
              <h3 className="text-base font-bold text-on-surface">
                Your integration is connected. We&apos;re waiting for the first incident event.
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">
                Webhooks are active and ready. As soon as an alert or issue triggers in your connected tool, Context Broker will automatically ingest telemetry and construct incident intelligence.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onRefreshClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefreshClick}
                disabled={isRefreshing}
                className="text-xs border-outline-variant/30 text-on-surface hover:bg-surface-container flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                Check again
              </Button>
            )}
            <Button
              onClick={onViewStatusClick}
              className="bg-secondary text-on-secondary hover:bg-secondary/90 font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              View integration status
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {emptyState === "EVENTS_NO_ACTIVE_INCIDENTS" && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  Stage 3: All Systems Operational
                </span>
              </div>
              <h3 className="text-base font-bold text-on-surface">
                You&apos;re all caught up. There are no active incidents right now.
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">
                All previously detected incident events have been resolved or mitigated. Telemetry streams remain open to detect new anomalies instantly.
              </p>
            </div>
          </div>
          <Button
            onClick={onViewHistoryClick}
            variant="outline"
            className="border-outline-variant/30 hover:bg-surface-container font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            View incident history
          </Button>
        </div>
      )}
    </motion.div>
  );
}
