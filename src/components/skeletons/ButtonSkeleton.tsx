import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonSkeletonProps {
  /** Button size variant */
  size?: ButtonSize;
  /** Additional class names */
  className?: string;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 w-20",
  md: "h-10 w-28",
  lg: "h-12 w-36",
};

/**
 * Skeleton placeholder for button elements.
 * Matches the shadcn Button sizing used across the app.
 */
export function ButtonSkeleton({
  size = "md",
  className,
}: ButtonSkeletonProps) {
  return (
    <Skeleton
      className={cn("rounded-md", sizeClasses[size], className)}
    />
  );
}
