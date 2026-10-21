import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface IncidentTableSkeletonProps {
  /** Number of rows to render */
  rows?: number;
}

/**
 * Skeleton for the /dashboard/incidents page table.
 * Matches the 8-column IncidentRepository table layout exactly.
 */
export function IncidentTableSkeleton({ rows = 5 }: IncidentTableSkeletonProps) {
  return (
    <div
      className="bg-surface-container-lowest border border-outline-variant/15 rounded-md overflow-hidden"
      aria-hidden="true"
    >
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
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent cursor-default">
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-40" /></TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-1.5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-6" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-7 w-16 rounded-md" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
