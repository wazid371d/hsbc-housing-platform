"use client";

import { useCallback, useEffect, useState } from "react";
import type { EstimateRecord } from "@/lib/types";

const STORAGE_KEY = "property-estimates";

// Persists estimate history in localStorage. Guards `window` so it is SSR-safe
// (initial state is empty; real data hydrates in an effect to avoid mismatch).
export function useEstimateHistory() {
  const [history, setHistory] = useState<EstimateRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw) as EstimateRecord[]);
    } catch {
      // ignore corrupt/unavailable storage
    }
    setHydrated(true);
  }, []);

  // Persist on change (only after hydration so we don't clobber stored data).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore quota/unavailable storage
    }
  }, [history, hydrated]);

  const add = useCallback((record: EstimateRecord) => {
    setHistory((prev) => [record, ...prev].slice(0, 50));
  }, []);

  const remove = useCallback((id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const clear = useCallback(() => setHistory([]), []);

  return { history, add, remove, clear, hydrated };
}
