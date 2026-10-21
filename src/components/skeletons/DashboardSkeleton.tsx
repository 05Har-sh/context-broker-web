import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

/**
 * Full-page skeleton for the dashboard overview.
 * Layout mirrors the actual DashboardPage: SystemHealth → PriorityQueue/TrendChart/RiskSpotlight → EventTimeline/ContextBreakdown → IncidentTable.
 */
export function DashboardSkeleton() {
  const metricWidths = ["w-3/5", "w-1/4", "w-4/5", "w-1/3", "w-full"];

  return (
    <div aria-hidden="true" aria-label="Loading dashboard" className="w-full">
      {/* Section 1: System Health & Risk (3-col grid) */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* System Health Card */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest ghost-border p-6 rounded-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-3 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Gauge placeholder */}
            <Skeleton className="w-[140px] h-[140px] rounded-full shrink-0" />
            {/* Diagnostics */}
            <div className="flex-1 space-y-3">
              <Skeleton className="h-2.5 w-20" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
              <div className="border-t border-outline-variant/10 pt-2 flex items-center justify-between">
                <Skeleton className="h-3 w-28" />
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="w-[3px] rounded-full" style={{ height: `${8 + i * 2}px` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Score Card */}
        <div className="col-span-12 lg:col-span-3 bg-surface-container-lowest ghost-border p-6 rounded-md flex flex-col items-center justify-center">
          <Skeleton className="h-3 w-28 self-start mb-3" />
          <Skeleton className="w-[100px] h-[100px] rounded-full my-auto" />
          <Skeleton className="h-2.5 w-40 mt-2" />
        </div>

        {/* Metric Cards */}
        <div className="col-span-12 lg:col-span-3 grid grid-rows-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest ghost-border px-4 py-2 rounded-md flex items-center justify-between gap-3">
              <Skeleton className="h-3 w-12 shrink-0" />
              <div className="flex-1 h-1 rounded-full bg-surface-container-high overflow-hidden">
                <Skeleton className={cn("h-full rounded-full", metricWidths[i])} />
              </div>
              <Skeleton className="h-3.5 w-6 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: PriorityQueue / TrendChart / RiskSpotlight */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Priority Queue */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest ghost-border p-6 rounded-md">
          <Skeleton className="h-3 w-32 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between bg-surface py-2 px-3 rounded-md gap-4">
                <Skeleton className="w-[72px] h-7 rounded-md shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-2.5 w-14" />
                    <Skeleton className="h-2.5 w-6" />
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <Skeleton className={cn("h-full rounded-full", ["w-4/5", "w-3/5", "w-2/5"][i])} />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Trend Chart */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest ghost-border p-6 rounded-md flex flex-col">
          <div className="flex justify-between mb-4">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex-1 flex items-end gap-2 min-h-[120px]">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <Skeleton
                  className="w-full rounded-t-md"
                  style={{ height: `${20 + Math.sin((i / 6) * Math.PI) * 60}%` }}
                />
                <Skeleton className="h-2 w-4 mt-1.5" />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1 pt-2 border-t border-outline-variant/10">
            <Skeleton className="h-2.5 w-12" />
            <Skeleton className="h-2.5 w-10" />
            <Skeleton className="h-2.5 w-12" />
          </div>
        </div>

        {/* Risk Spotlight */}
        <div className="col-span-12 lg:col-span-3 bg-surface-container-lowest ghost-border p-6 rounded-md flex flex-col border-l-4 border-error/40">
          <Skeleton className="h-2.5 w-36 mb-2" />
          <div className="flex-1 flex flex-col justify-center">
            <Skeleton className="h-6 w-24 mb-1" />
            <Skeleton className="h-3 w-40 mb-4" />
            <div className="bg-surface-container-low p-3 rounded-md">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-8" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: EventTimeline / ContextBreakdown */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Event Timeline */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest ghost-border p-6 rounded-md flex flex-col justify-between h-full">
          <div>
            <Skeleton className="h-3 w-28 mb-6" />
            <div className="relative pl-1">
              <div className="absolute left-[6px] top-2 bottom-3 w-[2px] bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="relative flex items-start gap-4">
                    <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1 flex-1">
                      <Skeleton className="h-2.5 w-14" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 pt-1">
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Context Breakdown */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest ghost-border p-6 rounded-md h-full flex flex-col justify-between">
          <div>
            <Skeleton className="h-3 w-64 mb-6" />
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-3 w-44" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                  <Skeleton className="h-full w-3/5 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                  <Skeleton className="h-full w-2/5 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Incident Table */}
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
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent cursor-default">
                <TableCell>
                  <Skeleton className="h-3.5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-surface-container-low h-1 rounded-full overflow-hidden">
                      <Skeleton className="h-full w-3/4 rounded-full" />
                    </div>
                    <Skeleton className="h-3.5 w-6" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
