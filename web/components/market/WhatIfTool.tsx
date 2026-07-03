"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { FEATURE_META, FEATURE_NAMES, type PropertyFeatures } from "@/lib/types";
import type { WhatIfResult } from "@/lib/market";
import { formatPrice } from "@/lib/format";

const DEFAULTS: PropertyFeatures = {
  square_footage: 2000,
  bedrooms: 4,
  bathrooms: 2.5,
  year_built: 2005,
  lot_size: 9000,
  distance_to_city_center: 6.5,
  school_rating: 8.5,
};

export function WhatIfTool() {
  const [values, setValues] = useState<PropertyFeatures>(DEFAULTS);
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(name: keyof PropertyFeatures, raw: string) {
    setValues((prev) => ({ ...prev, [name]: raw === "" ? 0 : Number(raw) }));
  }

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/market/whatif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body?.error ?? "What-if analysis failed.");
        setResult(null);
      } else {
        setResult(body as WhatIfResult);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  const diff = result?.differenceFromSegmentAvg ?? 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title="Adjust property attributes" />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURE_NAMES.map((name) => (
              <Field
                key={name}
                id={`wi-${name}`}
                label={FEATURE_META[name].label}
                unit={FEATURE_META[name].unit}
                type="number"
                step={FEATURE_META[name].step}
                value={values[name]}
                onChange={(e) => update(name, e.target.value)}
              />
            ))}
          </div>
          <Button onClick={run} disabled={loading}>
            {loading ? "Analysing…" : "Run what-if"}
          </Button>
          {error && (
            <p role="alert" className="rounded-lg bg-background px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Predicted outcome"
          action={
            result &&
            (result.outOfRange ? (
              <Badge tone="warning">Extrapolated</Badge>
            ) : (
              <Badge tone="success">In range</Badge>
            ))
          }
        />
        <CardBody className="space-y-4">
          {loading ? (
            <div className="grid h-40 place-items-center">
              <Spinner label="Analysing" />
            </div>
          ) : result ? (
            <>
              <div>
                <p className="text-3xl font-semibold text-primary">
                  {formatPrice(result.predictedPrice)}
                </p>
                <p className="text-sm text-muted">
                  Confidence band {formatPrice(result.lowerBound)} – {formatPrice(result.upperBound)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3 text-sm">
                <p className="text-muted">
                  Compared to the <strong>{result.comparedSegment}</strong> segment average of{" "}
                  {formatPrice(result.segmentAvgPrice)}:
                </p>
                <p className={`mt-1 font-semibold ${diff >= 0 ? "text-success" : "text-error"}`}>
                  {diff >= 0 ? "+" : "−"}
                  {formatPrice(Math.abs(diff))} {diff >= 0 ? "above" : "below"} segment average
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">Run the analysis to see a predicted price.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
