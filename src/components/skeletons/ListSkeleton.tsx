import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ListSkeletonProps {
  /** Number of list items to render */
  count?: number;
  /** Show circular avatar placeholder */
  showAvatar?: boolean;
  /** Show a trailing action/badge placeholder */
  showAction?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Skeleton placeholder for list items with avatar + text layout.
 * Matches the PriorityQueue incident row structure.
 */
export function ListSkeleton({
  count = 3,
  showAvatar = true,
  showAction = true,
  className,
}: ListSkeletonProps) {
  return (
    <div
      className={cn("space-y-4", className)}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 bg-surface hover:bg-surface-container-low py-2 px-3 rounded-md"
        >
          {showAvatar && (
            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="h-2.5 w-2/5" />
          </div>
          {showAction && (
            <Skeleton className="h-5 w-16 rounded-full shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
