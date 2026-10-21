"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface LoadingState {
  /** Map of loading state keys to their boolean values */
  states: Record<string, boolean>;
}

interface LoadingContextType {
  /** Check if a specific key is loading */
  isLoading: (key: string) => boolean;
  /** Check if ANY key is loading */
  isAnyLoading: boolean;
  /** Set loading state for a specific key */
  setLoading: (key: string, loading: boolean) => void;
  /** Start loading for a key */
  startLoading: (key: string) => void;
  /** Stop loading for a key */
  stopLoading: (key: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

/**
 * Provider for managing multiple independent loading states across the app.
 *
 * @example
 * // In layout.tsx or a parent component:
 * <LoadingProvider>
 *   <Dashboard />
 * </LoadingProvider>
 *
 * // In any child component:
 * const { isLoading, startLoading, stopLoading } = useLoadingContext();
 * const loading = isLoading("incidents");
 */
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingState, setLoadingState] = useState<LoadingState>({ states: {} });

  const isLoading = useCallback(
    (key: string) => !!loadingState.states[key],
    [loadingState.states]
  );

  const isAnyLoading = Object.values(loadingState.states).some(Boolean);

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingState((prev) => ({
      states: {
        ...prev.states,
        [key]: loading,
      },
    }));
  }, []);

  const startLoading = useCallback(
    (key: string) => setLoading(key, true),
    [setLoading]
  );

  const stopLoading = useCallback(
    (key: string) => setLoading(key, false),
    [setLoading]
  );

  return (
    <LoadingContext.Provider
      value={{ isLoading, isAnyLoading, setLoading, startLoading, stopLoading }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

/**
 * Access the global loading context.
 * Must be used within a <LoadingProvider>.
 */
export function useLoadingContext(): LoadingContextType {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoadingContext must be used within a LoadingProvider");
  }
  return context;
}
