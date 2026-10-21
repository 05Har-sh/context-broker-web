"use client";

import { Button } from '@/components/ui/button';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-outline/10 rounded-xl bg-surface space-y-4">
      <h2 className="text-xl font-bold text-error">Failed to load settings</h2>
      <p className="text-sm text-on-surface-variant">{error.message || 'An unexpected error occurred.'}</p>
      <Button onClick={() => reset()} variant="outline">
        Retry
      </Button>
    </div>
  );
}
