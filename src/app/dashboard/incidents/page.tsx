'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  RefreshCw,
  UserPlus,
  SearchX,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CircleAlert,
  X,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { fetcher } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { IncidentTableSkeleton } from '@/components/skeletons';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { SeverityBadge } from '@/components/shared/severity-badge';
import { StaleBadge } from '@/components/shared/stale-badge';
import { AssignModal } from '@/components/shared/assign-modal';
import { ToastContainer } from '@/components/shared/toast-notification';
import { FilterSelect } from '@/components/shared/filter-select';
import { PageHeader } from '@/components/shared/page-header';
import { cn } from '@/lib/utils';

// --- Types ---
interface Incident {
  incidentKey: string;
  jiraStatus: string;
  incidentStatus: string;
  lastMsg: string;
  lastUpdated: string;
  stale: boolean;
  riskScore: number;
  severity: string;
  assignedTo: string;
}

interface PaginatedResponse {
  content: Incident[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

interface Filters {
  severity: string;
  jiraStatus: string;
  assignedTo: string;
  stale: string;
}

// --- Build SWR key ---
function buildApiKey(page: number, size: number, filters: Filters): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('size', String(size));
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.jiraStatus) params.set('jiraStatus', filters.jiraStatus);
  if (filters.assignedTo) params.set('assignedTo', filters.assignedTo);
  if (filters.stale === 'true') params.set('stale', 'true');
  return `/incident/all?${params.toString()}`;
}

// --- Lucide icon wrappers for FilterSelect ---
import { AlertOctagon, CircleCheckBig, User } from 'lucide-react';

// Loading skeleton is now imported from @/components/skeletons

// --- Main Page ---
export default function IncidentRepositoryPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [filters, setFilters] = useState<Filters>({
    severity: '',
    jiraStatus: '',
    assignedTo: '',
    stale: '',
  });
  const [showFilters, setShowFilters] = useState(true);
  const [assignModal, setAssignModal] = useState<{ key: string; assignee: string | null } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [filters]);

  const swrKey = buildApiKey(page, size, filters);
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse>(swrKey, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    if (error) {
      const msg = error.message || 'Failed to load incidents. Please try again.';
      showToast(msg, 'error');
    }
  }, [error, showToast]);

  const handleAssignSuccess = useCallback((msg: string) => {
    setAssignModal(null);
    showToast(msg, 'success');
    mutate();
  }, [mutate, showToast]);

  const updateFilter = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ severity: '', jiraStatus: '', assignedTo: '', stale: '' });
  }, []);

  const hasActiveFilters = filters.severity || filters.jiraStatus || filters.assignedTo || filters.stale;

  const incidents = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const currentPage = data?.number ?? page;

  return (
    <div className="flex pt-16 min-h-screen bg-surface">
      <TopBar />
      <Sidebar />
      <main className="flex-1 bg-surface">
        <div className="max-w-[1200px] mx-auto px-10 py-8">
          {/* Header */}
          <PageHeader
            breadcrumbs={[{ label: 'Incident Repo' }]}
            title="Incident Repository"
            actions={
              <>
                <Button
                  variant={showFilters ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => mutate()}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </>
            }
          />

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-md p-5 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Filter Incidents
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-[10px] font-bold text-secondary hover:text-secondary-dim uppercase tracking-wider transition-colors flex items-center gap-1"
                      >
                        <X className="h-3.5 w-3.5" />
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <FilterSelect
                      label="Severity"
                      value={filters.severity}
                      onChange={(v) => updateFilter('severity', v)}
                      icon={<AlertOctagon />}
                      options={[
                        { value: '', label: 'All' },
                        { value: 'CRITICAL', label: 'Critical' },
                        { value: 'HIGH', label: 'High' },
                        { value: 'MEDIUM', label: 'Medium' },
                        { value: 'LOW', label: 'Low' },
                      ]}
                    />
                    <FilterSelect
                      label="Jira Status"
                      value={filters.jiraStatus}
                      onChange={(v) => updateFilter('jiraStatus', v)}
                      icon={<CircleCheckBig />}
                      options={[
                        { value: '', label: 'All' },
                        { value: 'OPEN', label: 'Open' },
                        { value: 'IN_PROGRESS', label: 'In Progress' },
                        { value: 'RESOLVED', label: 'Resolved' },
                      ]}
                    />
                    <FilterSelect
                      label="Assigned To"
                      value={filters.assignedTo}
                      onChange={(v) => updateFilter('assignedTo', v)}
                      icon={<User />}
                      options={[
                        { value: '', label: 'All' },
                        { value: 'UNASSIGNED', label: 'Unassigned' },
                      ]}
                    />
                    {/* Stale checkbox */}
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">
                        Stale
                      </label>
                      <label className="flex items-center gap-2.5 bg-surface-container-lowest border border-outline-variant/15 rounded-md px-3 py-2 cursor-pointer hover:border-secondary/30 transition-all">
                        <Checkbox
                          checked={filters.stale === 'true'}
                          onCheckedChange={(checked) => updateFilter('stale', checked ? 'true' : '')}
                        />
                        <span className="text-xs text-on-surface">Stale only</span>
                      </label>
                    </div>
                    {/* Filter count */}
                    <div className="flex items-end pb-0.5">
                      {hasActiveFilters && (
                        <span className="text-[10px] text-on-surface-variant font-medium">
                          {[filters.severity, filters.jiraStatus, filters.assignedTo, filters.stale].filter(Boolean).length} filter{[filters.severity, filters.jiraStatus, filters.assignedTo, filters.stale].filter(Boolean).length > 1 ? 's' : ''} active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error banner */}
          {error && !data && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-md p-5 mb-6 flex items-center gap-3"
            >
              <CircleAlert className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-sm font-bold text-on-surface">Connection Error</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Could not reach the Server.</p>
              </div>
              <Button size="sm" onClick={() => mutate()} className="ml-auto">
                Retry
              </Button>
            </motion.div>
          )}

          {/* Table */}
          {isLoading && !data ? (
            <IncidentTableSkeleton />
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-md overflow-hidden">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent cursor-default">
                    <TableHead>Incident Key</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Jira Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Stale</TableHead>
                    <TableHead className="w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.length > 0 ? (
                    incidents.map((inc, idx) => {
                      const isResolved = inc.incidentStatus === 'RESOLVED';
                      const isCritical = inc.severity?.toUpperCase() === 'CRITICAL';
                      const displayRisk = isResolved ? 0 : inc.riskScore;
                      const isUnassigned = !inc.assignedTo || inc.assignedTo === 'UNASSIGNED';

                      return (
                        <motion.tr
                          key={inc.incidentKey}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: idx * 0.03 }}
                          className={cn(
                            'group transition-colors cursor-pointer',
                            isResolved
                              ? 'opacity-55 hover:opacity-75'
                              : isCritical
                                ? 'bg-red-500/[0.03] hover:bg-red-500/[0.07]'
                                : 'hover:bg-surface-container-low'
                          )}
                          onClick={() => window.location.href = `/dashboard/incidents/${inc.incidentKey}`}
                        >
                          {/* Incident Key */}
                          <TableCell>
                            <span className={cn(
                              'font-mono text-[11px] font-bold',
                              isCritical && !isResolved ? 'text-red-500' : 'text-on-surface-variant'
                            )}>
                              {inc.incidentKey}
                            </span>
                          </TableCell>

                          {/* Message */}
                          <TableCell className="max-w-[260px]">
                            <span className="text-xs text-on-surface truncate block" title={inc.lastMsg}>
                              {inc.lastMsg || '—'}
                            </span>
                          </TableCell>

                          {/* Jira Status */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                'w-2 h-2 rounded-full flex-shrink-0',
                                inc.jiraStatus === 'OPEN' ? 'bg-blue-500' :
                                  inc.jiraStatus === 'IN_PROGRESS' ? 'bg-amber-500 animate-pulse' :
                                    inc.jiraStatus === 'RESOLVED' ? 'bg-green-500' :
                                      'bg-outline'
                              )} />
                              <span className="text-[11px] text-on-surface-variant font-medium whitespace-nowrap">
                                {inc.jiraStatus?.replace('_', ' ') || '—'}
                              </span>
                            </div>
                          </TableCell>

                          {/* Severity */}
                          <TableCell>
                            <SeverityBadge severity={inc.severity} showResolved={isResolved} />
                          </TableCell>

                          {/* Risk Score */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                                <motion.div
                                  className={cn(
                                    'h-full rounded-full',
                                    isResolved ? 'bg-gray-300 dark:bg-gray-600' :
                                      displayRisk >= 80 ? 'bg-red-500' :
                                        displayRisk >= 50 ? 'bg-orange-400' :
                                          'bg-green-500'
                                  )}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(displayRisk, 100)}%` }}
                                  transition={{ duration: 0.6, delay: 0.1 + idx * 0.03 }}
                                />
                              </div>
                              <span className={cn(
                                'text-[11px] font-bold',
                                isResolved ? 'text-gray-400' : 'text-on-surface-variant'
                              )}>
                                {displayRisk}
                              </span>
                            </div>
                          </TableCell>

                          {/* Assigned To */}
                          <TableCell>
                            {isUnassigned ? (
                              <Badge variant="muted">Unassigned</Badge>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center text-[10px] font-bold text-secondary flex-shrink-0">
                                  {inc.assignedTo.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs text-on-surface font-medium">{inc.assignedTo}</span>
                              </div>
                            )}
                          </TableCell>

                          {/* Stale */}
                          <TableCell>
                            <StaleBadge stale={inc.stale} />
                          </TableCell>

                          {/* Action */}
                          <TableCell>
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={isResolved}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isResolved) {
                                  setAssignModal({ key: inc.incidentKey, assignee: isUnassigned ? null : inc.assignedTo });
                                }
                              }}
                              className="text-[10px] uppercase tracking-wider gap-1"
                              title={isResolved ? 'Cannot assign resolved incidents' : 'Assign developer'}
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                              Assign
                            </Button>
                          </TableCell>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <TableRow className="hover:bg-transparent cursor-default">
                      <TableCell colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <SearchX className="h-9 w-9 text-on-surface-variant/30" />
                          <p className="text-sm text-on-surface-variant font-medium">No incidents found</p>
                          {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-xs text-secondary font-bold hover:underline mt-1">
                              Clear filters
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between text-xs text-on-surface-variant font-medium">
            <span className="uppercase tracking-widest">
              {totalElements > 0
                ? `Showing ${currentPage * size + 1}–${Math.min((currentPage + 1) * size, totalElements)} of ${totalElements} incidents`
                : 'No incidents'}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="px-3 py-1.5 text-on-surface font-bold">
                {currentPage + 1} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
        </div>
        </div>


      {/* Assign Modal */}
      <AssignModal
        incidentKey={assignModal?.key || ''}
        currentAssignee={assignModal?.assignee || null}
        open={!!assignModal}
        onOpenChange={(open) => !open && setAssignModal(null)}
        onSuccess={handleAssignSuccess}
      />

      {/* Toast */}
      <ToastContainer toast={toast} onDismiss={() => setToast(null)} />
      </main>
    </div>
  );
}

