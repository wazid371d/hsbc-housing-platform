"use client";

import { useEffect, useState } from "react";
import type { SegmentDimension, SegmentStats } from "@/lib/market";

// Fetches segment stats for a dimension via the Next route handler (proxy to Java).
// Seeded with server-fetched data so the first render needs no client request.
//
// loading/error are DERIVED from cached results rather than set synchronously in the
// effect (which would trigger cascading renders). Each dimension's result is cached, so
// switching back to a previously loaded dimension is instant and needs no refetch.
export function useSegments(dimension: SegmentDimension, initial: SegmentStats[]) {
  const [firstDimension] = useState(dimension);
  const [cache, setCache] = useState<Partial<Record<SegmentDimension, SegmentStats[]>>>({
    [firstDimension]: initial,
  });
  const [errors, setErrors] = useState<Partial<Record<SegmentDimension, string>>>({});

  useEffect(() => {
    // Already have data (or a recorded failure) for this dimension — nothing to fetch.
    if (cache[dimension] || errors[dimension]) return;

    let cancelled = false;
    fetch(`/api/market/segments?by=${dimension}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load segments"))))
      .then((data: SegmentStats[]) => {
        if (!cancelled) setCache((prev) => ({ ...prev, [dimension]: data }));
      })
      .catch((e: Error) => {
        if (!cancelled) setErrors((prev) => ({ ...prev, [dimension]: e.message }));
      });

    return () => {
      cancelled = true;
    };
  }, [dimension, cache, errors]);

  const segments = cache[dimension] ?? initial;
  const error = errors[dimension] ?? null;
  const loading = !cache[dimension] && !errors[dimension];

  return { segments, loading, error };
}
