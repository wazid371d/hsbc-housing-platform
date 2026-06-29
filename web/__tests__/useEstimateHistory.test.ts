import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useEstimateHistory } from "@/hooks/useEstimateHistory";
import type { EstimateRecord } from "@/lib/types";

function record(id: string): EstimateRecord {
  return {
    id,
    createdAt: Date.now(),
    label: `estimate-${id}`,
    features: {
      square_footage: 1550,
      bedrooms: 3,
      bathrooms: 2,
      year_built: 1997,
      lot_size: 6800,
      distance_to_city_center: 4.1,
      school_rating: 7.6,
    },
    prediction: {
      predicted_price: 248000,
      lower_bound: 240000,
      upper_bound: 256000,
      out_of_range: false,
    },
  };
}

describe("useEstimateHistory", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds, removes, and clears records (newest first)", () => {
    const { result } = renderHook(() => useEstimateHistory());

    act(() => result.current.add(record("a")));
    expect(result.current.history).toHaveLength(1);

    act(() => result.current.add(record("b")));
    expect(result.current.history).toHaveLength(2);
    expect(result.current.history[0].id).toBe("b");

    act(() => result.current.remove("a"));
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].id).toBe("b");

    act(() => result.current.clear());
    expect(result.current.history).toHaveLength(0);
  });

  it("persists added records to localStorage", () => {
    const { result } = renderHook(() => useEstimateHistory());
    act(() => result.current.add(record("persist")));

    const raw = window.localStorage.getItem("property-estimates");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string)).toHaveLength(1);
  });
});
