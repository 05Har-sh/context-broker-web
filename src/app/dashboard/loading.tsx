import { DashboardSkeleton } from "@/components/skeletons";

export default function DashboardLoading() {
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
      <main className="flex-1 bg-surface p-8 lg:px-12 max-w-7xl mx-auto w-full min-w-0">
        <DashboardSkeleton />
      </main>
    </div>
  );
}

