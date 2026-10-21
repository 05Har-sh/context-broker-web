# Skeleton Loading System

A production-grade skeleton screen system with shimmer effects for the Incident Intelligence Hub.

## Architecture

```
components/
├── ui/skeleton.tsx          # Base Skeleton component (enhanced)
├── skeletons/
│   ├── index.ts             # Barrel export
│   ├── CardSkeleton.tsx     # Card layout placeholder
│   ├── ListSkeleton.tsx     # List items with avatar + text
│   ├── TableSkeleton.tsx    # Generic table skeleton
│   ├── TextSkeleton.tsx     # Multi-line text blocks
│   ├── ImageSkeleton.tsx    # Image placeholders
│   ├── ButtonSkeleton.tsx   # Button placeholders
│   ├── AvatarSkeleton.tsx   # Circular avatar placeholders
│   ├── DashboardSkeleton.tsx          # Full dashboard page skeleton
│   ├── IncidentTableSkeleton.tsx      # Incident repository table
│   └── IncidentDetailSkeleton.tsx     # Incident detail page
├── LoadingContext.tsx        # Global loading state provider
hooks/
└── useLoading.ts             # Loading hook with minimum duration
app/
└── dashboard/loading.tsx     # Next.js Suspense loading boundary
```

## Quick Start

### Using Skeleton Variants

```tsx
import { CardSkeleton, ListSkeleton, TableSkeleton } from "@/components/skeletons";

// Card with image + text
<CardSkeleton showImage descriptionLines={3} />

// List with 5 items
<ListSkeleton count={5} showAvatar showAction />

// Table with custom columns
<TableSkeleton
  columns={[
    { header: "Name", width: "w-32" },
    { header: "Status", width: "w-20", rounded: true },
    { header: "Score", width: "w-14" },
  ]}
  rows={8}
/>
```

### Using the Base Skeleton

```tsx
import { Skeleton } from "@/components/ui/skeleton";

// With Tailwind classes
<Skeleton className="h-4 w-32" />
<Skeleton className="h-10 w-10 rounded-full" />

// With explicit props
<Skeleton width={200} height={16} borderRadius={8} />
```

### Using Page-Level Skeletons

The page-specific skeletons match the exact layout of each page:

```tsx
import { DashboardSkeleton, IncidentTableSkeleton, IncidentDetailSkeleton } from "@/components/skeletons";

// In Next.js loading.tsx (automatic Suspense boundary)
export default function Loading() {
  return <DashboardSkeleton />;
}

// In SWR/React Query patterns
{isLoading ? <IncidentTableSkeleton /> : <DataTable data={data} />}
```

## Integration Patterns

### 1. Next.js `loading.tsx` (Server Components)

For server-side data fetching, create a `loading.tsx` alongside `page.tsx`:

```tsx
// app/dashboard/loading.tsx
import { DashboardSkeleton } from "@/components/skeletons";

export default function DashboardLoading() {
  return (
    <div className="flex pt-16">
      <TopBar />
      <Sidebar />
      <main className="flex-1 bg-surface p-8">
        <DashboardSkeleton />
      </main>
    </div>
  );
}
```

### 2. SWR Integration (Client Components)

```tsx
const { data, isLoading } = useSWR<DataType>(apiKey, fetcher);

return isLoading && !data ? (
  <IncidentTableSkeleton />
) : (
  <ActualTable data={data} />
);
```

### 3. useLoading Hook (Custom Data Fetching)

```tsx
import { useLoading } from "@/hooks/useLoading";

function MyComponent() {
  const { isLoading, withLoading } = useLoading({ minimumDuration: 200 });
  const [data, setData] = useState(null);

  useEffect(() => {
    withLoading(async () => {
      const response = await fetch("/api/data");
      setData(await response.json());
    });
  }, []);

  return isLoading ? <CardSkeleton /> : <DataCard data={data} />;
}
```

### 4. LoadingContext (Multiple Loading States)

```tsx
import { LoadingProvider, useLoadingContext } from "@/components/LoadingContext";

// Wrap in provider
<LoadingProvider>
  <App />
</LoadingProvider>

// In any child component
function Widget() {
  const { isLoading, startLoading, stopLoading } = useLoadingContext();

  useEffect(() => {
    startLoading("widget-data");
    fetchData().then(() => stopLoading("widget-data"));
  }, []);

  return isLoading("widget-data") ? <CardSkeleton /> : <Widget />;
}
```

## Creating Custom Skeletons

Build custom skeletons that match your component layout:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

function MyCustomSkeleton() {
  return (
    <div className="bg-surface-container-lowest ghost-border p-6 rounded-md" aria-hidden="true">
      {/* Match your component's exact structure */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}
```

## Best Practices

1. **Match the layout exactly** — Skeletons should be indistinguishable from the real layout at a glance
2. **Use aria-hidden="true"** — All skeletons include this automatically
3. **Minimum loading duration** — Use `useLoading({ minimumDuration: 150 })` to avoid skeleton flash
4. **Dark mode** — The shimmer adapts automatically via CSS custom properties
5. **Reduced motion** — Shimmer animation is disabled for `prefers-reduced-motion: reduce`
6. **Avoid CLS** — Skeletons reserve the same space as real content, preventing layout shift

## Theming

Override skeleton colors via CSS custom properties:

```css
.skeleton-shimmer {
  --skeleton-base: #your-color;
  --skeleton-shimmer: rgba(255, 255, 255, 0.3);
}
```

The shimmer animation runs at **1.5s** with an `ease-in-out` timing function, using a `translateX` CSS transform for GPU-accelerated, 60fps performance.
