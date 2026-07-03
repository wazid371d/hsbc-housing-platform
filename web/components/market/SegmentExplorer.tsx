"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { SegmentChart } from "./SegmentChart";
import { useSegments } from "@/hooks/useSegments";
import { formatPrice, formatNumber } from "@/lib/format";
import type { SegmentDimension, SegmentStats } from "@/lib/market";

const DIMENSIONS: { value: SegmentDimension; label: string }[] = [
  { value: "bedrooms", label: "Bedrooms" },
  { value: "price_band", label: "Price band" },
  { value: "school_tier", label: "School rating tier" },
];

export function SegmentExplorer({ initial }: { initial: SegmentStats[] }) {
  const [dimension, setDimension] = useState<SegmentDimension>("bedrooms");
  const { segments, loading, error } = useSegments(dimension, initial);

  return (
    <Card>
      <CardHeader
        title="Market segments"
        description="Average price and counts by segment"
        action={
          <div className="flex items-center gap-2">
            <label htmlFor="segment-dim" className="text-sm text-muted">
              Segment by
            </label>
            <select
              id="segment-dim"
              value={dimension}
              onChange={(e) => setDimension(e.target.value as SegmentDimension)}
              className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm"
            >
              {DIMENSIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        }
      />
      <CardBody className="space-y-4">
        {error ? (
          <p role="alert" className="text-sm text-error">{error}</p>
        ) : loading ? (
          <div className="grid h-72 place-items-center">
            <Spinner label="Loading segments" />
          </div>
        ) : (
          <>
            <SegmentChart segments={segments} />
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-background text-left text-muted">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">Segment</th>
                    <th scope="col" className="px-3 py-2 font-medium">Count</th>
                    <th scope="col" className="px-3 py-2 font-medium">Avg price</th>
                    <th scope="col" className="px-3 py-2 font-medium">Avg $/sqft</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((s) => (
                    <tr key={s.segment} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{s.segment}</td>
                      <td className="px-3 py-2">{s.count}</td>
                      <td className="px-3 py-2">{formatPrice(s.avgPrice)}</td>
                      <td className="px-3 py-2">${formatNumber(Math.round(s.avgPricePerSqft))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
