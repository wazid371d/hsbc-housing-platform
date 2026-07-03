"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { EstimateRecord } from "@/lib/types";

const STORAGE_KEY = "property-estimates";
const MAX_ENTRIES = 50;
const EMPTY: EstimateRecord[] = [];

// A tiny localStorage-backed store consumed via useSyncExternalStore. Reading through the
// store (instead of setting state inside a mount effect) keeps hydration SSR-safe without
// synchronous setState, and lets every mounted instance stay in sync live.
const listeners = new Set<() => void>();
let cached: EstimateRecord[] = EMPTY;
let cachedRaw: string | null = null;

function read(): EstimateRecord[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return cached; // storage unavailable — keep last known value
  }
  // Only reparse when the underlying string changed, so the snapshot reference stays
  // stable (required by useSyncExternalStore to avoid render loops).
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cached = raw ? (JSON.parse(raw) as EstimateRecord[]) : EMPTY;
    } catch {
      cached = EMPTY; // ignore corrupt storage
    }
  }
  return cached;
}

function write(next: EstimateRecord[]): void {
  cached = next;
  cachedRaw = JSON.stringify(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  } catch {
    // ignore quota/unavailable storage
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

// Stable references for the hydration flag (server: false, client: true).
const subscribeHydration = () => () => {};
const getHydrated = () => true;
const getHydratedServer = () => false;

// Persists estimate history in localStorage. Reads via an external store so the first
// client render reconciles with server output (empty) without a hydration mismatch.
export function useEstimateHistory() {
  const history = useSyncExternalStore(subscribe, read, () => EMPTY);
  const hydrated = useSyncExternalStore(subscribeHydration, getHydrated, getHydratedServer);

  const add = useCallback((record: EstimateRecord) => {
    write([record, ...read()].slice(0, MAX_ENTRIES));
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((r) => r.id !== id));
  }, []);

  const clear = useCallback(() => write(EMPTY), []);

  return { history, add, remove, clear, hydrated };
}
