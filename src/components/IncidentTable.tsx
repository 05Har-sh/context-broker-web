"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface IncidentData {
  incidentKey?: string;
  key?: string;
  severity?: string;
  jiraStatus?: string;
  riskScore?: number;
  riskLevel?: number;
}

function getSeverityVariant(severity?: string): "critical" | "high" | "medium" | "low" | "default" {
  const s = severity?.toLowerCase();
  if (s === "critical") return "critical";
  if (s === "high") return "high";
  if (s === "medium") return "medium";
  if (s === "low") return "low";
  return "default";
}

export default function IncidentTable({
  incidents = [],
  emptyState = 'NO_INTEGRATIONS',
  onConnectClick,
}: {
  incidents?: IncidentData[] | null;
  emptyState?: 'NO_INTEGRATIONS' | 'INTEGRATION_CONNECTED_NO_EVENTS' | 'EVENTS_NO_ACTIVE_INCIDENTS' | 'ACTIVE_DATA';
  onConnectClick?: () => void;
}) {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="bg-surface-container-lowest ghost-border rounded-md overflow-hidden mb-12">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent cursor-default">
              <TableHead>Key</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Jira Status</TableHead>
              <TableHead>Risk Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-transparent cursor-default">
              <TableCell colSpan={4} className="py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                  <span className="text-xs font-semibold text-on-surface">No activity yet</span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {emptyState === 'NO_INTEGRATIONS'
                      ? 'Connect Slack or Jira to start collecting incident data and populate your incident records.'
                      : emptyState === 'INTEGRATION_CONNECTED_NO_EVENTS'
                      ? "Your integration is connected. We're waiting for the first incident event to populate the database."
                      : "You're all caught up. There are no active incidents right now."}
                  </p>
                  {emptyState === 'NO_INTEGRATIONS' && onConnectClick && (
                    <button
                      onClick={onConnectClick}
                      className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      + Connect integration
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest ghost-border rounded-md overflow-hidden mb-12">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent cursor-default">
            <TableHead>Key</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Jira Status</TableHead>
            <TableHead>Risk Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.map((inc, i) => {
            const isCritical = inc.severity?.toLowerCase() === 'critical';
            const statusSafe = inc.jiraStatus || '';
            const statusColorClass = isCritical || statusSafe.includes('In Progress')
              ? 'bg-error'
              : statusSafe.includes('Resolved')
                ? 'bg-secondary'
                : 'bg-outline';
            const riskValue = inc.riskScore ?? inc.riskLevel ?? 0;
            const barColorClass = riskValue >= 80 ? 'bg-red-500' : riskValue >= 50 ? 'bg-orange-400' : 'bg-green-500';
            const incKey = inc.incidentKey || inc.key || '--';

            return (
              <motion.tr
                key={`${incKey}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={`transition-colors hover:bg-surface-container cursor-pointer ${isCritical ? 'bg-surface-container-low/30' : ''}`}
              >
                <TableCell className={`font-mono text-[10px] font-bold ${isCritical ? 'text-secondary' : 'text-on-surface-variant'}`}>
                  {incKey}
                </TableCell>
                <TableCell>
                  <Badge variant={getSeverityVariant(inc.severity)}>
                    {inc.severity || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusColorClass}`} />
                    <span className="text-[11px]">{inc.jiraStatus || '--'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-surface-container-low h-1 rounded-full">
                      <motion.div
                        className={`${barColorClass} h-full rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${riskValue}%` }}
                        transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-on-surface-variant">{riskValue}</span>
                  </div>
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
