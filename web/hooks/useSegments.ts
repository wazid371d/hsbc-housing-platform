"use client";

import { useEffect, useState } from "react";
import type { SegmentDimension, SegmentStats } from "@/lib/market";

// Fetches segment stats for a dimension via the Next route handler (proxy to Java).
// Seeded with server-fetched data so the first render needs no client request.
export function useSegments(dimension: SegmentDimension, initial: SegmentStats[]) {
  const [segments, setSegments] = useState<SegmentStats[]>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstDimension] = useState(dimension);

  useEffect(() => {
    // Skip the fetch for the initial dimension (already have server data).
    if (dimension === firstDimension) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/market/segments?by=${dimension}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load segments"))))
      .then((data: SegmentStats[]) => {
        if (!cancelled) setSegments(data);
      })
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [dimension, firstDimension]);

  return { segments, loading, error };
}
