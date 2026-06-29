"use client";

import { useCallback, useState } from "react";
import type { EstimateResponse, PropertyFeatures } from "@/lib/types";

interface State {
  loading: boolean;
  error: string | null;
  data: EstimateResponse | null;
}

// Calls the Next.js route handler (which proxies to the Python BFF) and manages
// the request lifecycle (loading / error / data).
export function useEstimate() {
  const [state, setState] = useState<State>({ loading: false, error: null, data: null });

  const estimate = useCallback(async (items: PropertyFeatures[]) => {
    setState({ loading: true, error: null, data: null });
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const body = await res.json();
      if (!res.ok) {
        const detail =
          typeof body?.detail === "string"
            ? body.detail
            : "The estimate could not be completed.";
        setState({ loading: false, error: detail, data: null });
        return null;
      }
      setState({ loading: false, error: null, data: body as EstimateResponse });
      return body as EstimateResponse;
    } catch {
      setState({ loading: false, error: "Network error — please try again.", data: null });
      return null;
    }
  }, []);

  const reset = useCallback(() => setState({ loading: false, error: null, data: null }), []);

  return { ...state, estimate, reset };
}
