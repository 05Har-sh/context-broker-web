import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ImageVariant = "square" | "rectangular" | "wide";

interface ImageSkeletonProps {
  /** Shape variant */
  variant?: ImageVariant;
  /** Custom size class (overrides variant defaults) */
  sizeClassName?: string;
  /** Additional class names */
  className?: string;
}

const variantClasses: Record<ImageVariant, string> = {
  square: "w-24 h-24",
  rectangular: "w-full h-40",
  wide: "w-full h-24",
};

/**
 * Skeleton placeholder for image areas.
 * Supports square, rectangular, and wide variants.
 */
export function ImageSkeleton({
  variant = "rectangular",
  sizeClassName,
  className,
}: ImageSkeletonProps) {
  return (
    <Skeleton
      className={cn(
        "rounded-md",
        sizeClassName || variantClasses[variant],
        className
      )}
    />
  );
}
