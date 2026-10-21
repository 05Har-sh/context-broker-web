"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseLoadingOptions {
  /** Minimum time (ms) the loading state stays true to avoid flash. Default: 150 */
  minimumDuration?: number;
  /** Start in loading state. Default: true */
  initialLoading?: boolean;
}

interface UseLoadingReturn {
  /** Current loading state */
  isLoading: boolean;
  /** Manually set loading state */
  setIsLoading: (loading: boolean) => void;
  /**
   * Start loading, run async work, then stop loading.
   * Enforces the minimum display duration to prevent flash-of-skeleton.
   */
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

/**
 * Custom hook for managing loading state with a minimum display duration
 * to prevent "flash of loading skeleton" (FOLS).
 *
 * @example
 * const { isLoading, withLoading } = useLoading({ minimumDuration: 200 });
 *
 * useEffect(() => {
 *   withLoading(async () => {
 *     const data = await fetchData();
 *     setData(data);
 *   });
 * }, []);
 *
 * return isLoading ? <Skeleton /> : <DataView data={data} />;
 */
export function useLoading({
  minimumDuration = 150,
  initialLoading = true,
}: UseLoadingOptions = {}): UseLoadingReturn {
  const [isLoading, setIsLoadingState] = useState(initialLoading);
  const loadStartTime = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const setIsLoading = useCallback(
    (loading: boolean) => {
      if (loading) {
        loadStartTime.current = Date.now();
        setIsLoadingState(true);
      } else {
        const elapsed = Date.now() - loadStartTime.current;
        const remaining = Math.max(0, minimumDuration - elapsed);

        if (remaining > 0) {
          timeoutRef.current = setTimeout(() => {
            setIsLoadingState(false);
          }, remaining);
        } else {
          setIsLoadingState(false);
        }
      }
    },
    [minimumDuration]
  );

  const withLoading = useCallback(
    async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
      setIsLoading(true);
      try {
        const result = await asyncFn();
        setIsLoading(false);
        return result;
      } catch (error) {
        setIsLoading(false);
        throw error;
      }
    },
    [setIsLoading]
  );

  return { isLoading, setIsLoading, withLoading };
}
