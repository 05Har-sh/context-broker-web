import { Skeleton } from "@/components/ui/skeleton";
import { IncidentTableSkeleton } from "@/components/skeletons";

export default function IncidentsLoading() {
  return (
    <div className="flex pt-16">
      {/* TopBar shell placeholder */}
      <header className="bg-surface-container-lowest border-b border-outline-variant/15 flex justify-between items-center w-full px-8 h-16 fixed top-0 left-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-surface-container" />
            <div className="h-4 w-40 rounded bg-surface-container" />
          </div>
        </div>
      </header>

      {/* Sidebar shell placeholder */}
      <aside className="hidden md:flex flex-col py-6 px-3 bg-surface-container-low w-64 h-[calc(100vh-64px)] border-r border-outline-variant/15 sticky top-16 z-40 shrink-0">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded-md bg-surface-container/50" />
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-surface min-w-0">
        <div className="max-w-[1200px] mx-auto px-10 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-60" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>

          {/* Filter Panel */}
          <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-md p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              ))}
              <div className="space-y-1.5">
                <Skeleton className="h-2.5 w-12" />
                <Skeleton className="h-9 w-28 rounded-md" />
              </div>
            </div>
          </div>

          {/* Table */}
          <IncidentTableSkeleton rows={8} />
        </div>
      </main>
    </div>
  );
}
