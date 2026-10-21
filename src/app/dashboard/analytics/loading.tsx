import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6" aria-hidden="true" aria-label="Loading analytics">
      <div>
        <Skeleton className="h-8 w-36 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface p-6 rounded-xl border border-outline/10 shadow-sm space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-20" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Incident Volume Trend Skeleton */}
        <div className="bg-surface p-6 rounded-xl border border-outline/10 shadow-sm flex flex-col">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="h-64 flex flex-col justify-between">
            <div className="flex-1 flex items-end gap-2 min-h-[140px] pb-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <Skeleton
                    className="w-full rounded-t-md"
                    style={{ height: `${25 + Math.sin((i / 6) * Math.PI) * 55}%` }}
                  />
                  <Skeleton className="h-2 w-4 mt-2" />
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-outline-variant/10 pt-2">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        </div>

        {/* Severity Distribution Skeleton */}
        <div className="bg-surface p-6 rounded-xl border border-outline/10 shadow-sm">
          <Skeleton className="h-6 w-44 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
