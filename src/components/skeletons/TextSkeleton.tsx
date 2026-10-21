import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TextSkeletonProps {
  /** Number of lines to render */
  lines?: number;
  /** Width of the last line (default: "w-3/5") */
  lastLineWidth?: string;
  /** Line height class (default: "h-3") */
  lineHeight?: string;
  /** Gap between lines (default: "space-y-2.5") */
  gap?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Skeleton placeholder for multi-line text blocks.
 * The last line is shorter to mimic natural paragraph endings.
 */
export function TextSkeleton({
  lines = 3,
  lastLineWidth = "w-3/5",
  lineHeight = "h-3",
  gap = "space-y-2.5",
  className,
}: TextSkeletonProps) {
  return (
    <div className={cn(gap, className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            lineHeight,
            i === lines - 1 ? lastLineWidth : "w-full"
          )}
        />
      ))}
    </div>
  );
}
