import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for the /dashboard/incidents/[incidentKey] detail page.
 * Matches the breadcrumb → title → 4-column info card & description → audit timeline layout.
 */
export function IncidentDetailSkeleton() {
  return (
    <div aria-hidden="true" aria-label="Loading incident details">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-7">
        <Skeleton className="h-3 w-16" />
        <span className="text-xs text-outline-variant">›</span>
        <Skeleton className="h-3 w-20" />
        <span className="text-xs text-outline-variant">›</span>
        <Skeleton className="h-3 w-16" />
        <span className="text-xs text-outline-variant">›</span>
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Title */}
      <div className="mb-7">
        <Skeleton className="h-8 w-3/4 max-w-lg" />
      </div>

      {/* Info card */}
      <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 md:p-7 mb-9">
        {/* 4-col metadata grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
          {/* Priority */}
          <div>
            <Skeleton className="h-2.5 w-16 mb-2" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          {/* Status */}
          <div>
            <Skeleton className="h-2.5 w-14 mb-2" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* Severity Score */}
          <div>
            <Skeleton className="h-2.5 w-24 mb-2" />
            <div className="flex items-baseline gap-1">
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-6" />
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <Skeleton className="h-2.5 w-20 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-7 h-7 rounded-full shrink-0" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>

        {/* Divider & Description */}
        <div className="border-t border-outline-variant/10 pt-5 space-y-2">
          <Skeleton className="h-2.5 w-20 mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>

      {/* Audit Timeline */}
      <div>
        <div className="flex items-center gap-2 mb-7">
          <Skeleton className="h-6 w-36" />
        </div>

        {/* Timeline items matching EventTimeline full mode */}
        <div className="relative space-y-4 before:absolute before:left-[9px] before:top-3 before:bottom-3 before:w-px before:bg-outline-variant/25">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="relative pl-7">
              <Skeleton className="absolute left-0 top-[5px] w-[19px] h-[19px] rounded-full ring-2 ring-surface" />
              <div className="rounded-lg px-4 py-3 bg-surface-container-low border border-outline/10 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-12 rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

