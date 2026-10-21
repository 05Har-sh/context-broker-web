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

interface TableSkeletonColumn {
  /** Header label */
  header: string;
  /** Width class for the skeleton bar (e.g. "w-20", "w-40") */
  width?: string;
  /** Use rounded-full for badge-like cells */
  rounded?: boolean;
  /** Custom header class */
  headerClassName?: string;
}

interface TableSkeletonProps {
  /** Column definitions */
  columns?: TableSkeletonColumn[];
  /** Number of skeleton rows */
  rows?: number;
  /** Additional class names for the wrapper */
  className?: string;
}

/** Default columns matching the IncidentTable layout */
const DEFAULT_COLUMNS: TableSkeletonColumn[] = [
  { header: "Key", width: "w-20" },
  { header: "Severity", width: "w-16", rounded: true },
  { header: "Jira Status", width: "w-24" },
  { header: "Risk Score", width: "w-14" },
];

/**
 * Skeleton placeholder for table data with configurable columns and rows.
 * Defaults match the IncidentTable layout on the dashboard overview.
 */
export function TableSkeleton({
  columns = DEFAULT_COLUMNS,
  rows = 5,
  className,
}: TableSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-surface-container-lowest ghost-border rounded-md overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent cursor-default">
            {columns.map((col) => (
              <TableHead key={col.header} className={col.headerClassName}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <TableRow key={rowIdx} className="hover:bg-transparent cursor-default">
              {columns.map((col) => (
                <TableCell key={`${rowIdx}-${col.header}`}>
                  <Skeleton
                    className={cn(
                      "h-4",
                      col.width || "w-24",
                      col.rounded && "rounded-full h-5"
                    )}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
