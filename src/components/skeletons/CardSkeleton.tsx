import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CardSkeletonProps {
  /** Show image placeholder at top */
  showImage?: boolean;
  /** Number of text lines in description area */
  descriptionLines?: number;
  /** Additional class names */
  className?: string;
}

/**
 * Skeleton placeholder for content cards with image, title, and description.
 * Matches the typical card layout used in the dashboard widgets.
 */
export function CardSkeleton({
  showImage = true,
  descriptionLines = 2,
  className,
}: CardSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-surface-container-lowest ghost-border rounded-md p-6 space-y-4",
        className
      )}
      aria-hidden="true"
    >
      {showImage && (
        <Skeleton className="w-full h-32 rounded-md" />
      )}
      {/* Title */}
      <Skeleton className="h-4 w-3/4" />
      {/* Description lines */}
      <div className="space-y-2">
        {Array.from({ length: descriptionLines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-3", i === descriptionLines - 1 ? "w-1/2" : "w-full")}
          />
        ))}
      </div>
    </div>
  );
}
