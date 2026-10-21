import { cn } from "@/lib/utils";

/**
 * Base Skeleton component with configurable shimmer animation.
 *
 * Uses CSS custom properties for theming (--skeleton-base, --skeleton-shimmer)
 * defined in globals.css. Supports both light and dark modes automatically.
 *
 * @example
 * <Skeleton className="h-4 w-32" />
 * <Skeleton className="h-10 w-10 rounded-full" />
 * <Skeleton width={200} height={16} borderRadius={8} />
 */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width in pixels (alternative to className) */
  width?: number | string;
  /** Height in pixels (alternative to className) */
  height?: number | string;
  /** Border radius in pixels (alternative to className) */
  borderRadius?: number | string;
}

function Skeleton({
  className,
  width,
  height,
  borderRadius,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-md", className)}
      aria-hidden="true"
      style={{
        ...(width !== undefined && { width: typeof width === "number" ? `${width}px` : width }),
        ...(height !== undefined && { height: typeof height === "number" ? `${height}px` : height }),
        ...(borderRadius !== undefined && { borderRadius: typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius }),
        ...style,
      }}
      {...props}
    />
  );
}

export { Skeleton };
export type { SkeletonProps };
