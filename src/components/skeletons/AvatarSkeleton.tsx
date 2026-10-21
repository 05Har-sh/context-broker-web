import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg";

interface AvatarSkeletonProps {
  /** Size variant */
  size?: AvatarSize;
  /** Additional class names */
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-20 h-20",
};

/**
 * Skeleton placeholder for circular avatar elements.
 * Sizes match the avatar sizes used in TopBar (sm), SettingsModal (lg), etc.
 */
export function AvatarSkeleton({
  size = "sm",
  className,
}: AvatarSkeletonProps) {
  return (
    <Skeleton
      className={cn("rounded-full", sizeClasses[size], className)}
    />
  );
}
