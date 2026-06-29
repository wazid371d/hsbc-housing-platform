"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { PriceChart } from "@/components/estimator/PriceChart";
import { useEstimateHistory } from "@/hooks/useEstimateHistory";
import { formatPrice } from "@/lib/format";
import { FEATURE_META, FEATURE_NAMES } from "@/lib/types";

// Side-by-side comparison of selected history entries.
export default function ComparePage() {
  const { history, hydrated } = useEstimateHistory();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const chosen = history.filter((r) => selected.has(r.id));

  if (hydrated && history.length === 0) {
    return (
      <Card>
        <CardBody className="text-center text-sm text-muted">
          No estimates to compare yet.{" "}
          <Link href="/estimate" className="text-primary underline">Create some →</Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Compare Properties</h1>
        <p className="text-sm text-muted">Select estimates to analyse them side by side.</p>
      </div>

      <Card>
        <CardHeader title="Select estimates" description={`${chosen.length} selected`} />
        <CardBody className="flex flex-wrap gap-2">
          {history.map((r) => {
            const isOn = selected.has(r.id);
            return (
              <button
                key={r.id}
                onClick={() => toggle(r.id)}
                aria-pressed={isOn}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  isOn ? "border-primary bg-background text-primary" : "border-border text-muted hover:text-foreground"
                }`}
              >
                {r.label} · {formatPrice(r.prediction.predicted_price)}
              </button>
            );
          })}
        </CardBody>
      </Card>

      {chosen.length > 0 && (
        <>
          <Card>
            <CardHeader title="Predicted price comparison" />
            <CardBody>
              <PriceChart
                predictions={chosen.map((r) => r.prediction)}
                labels={chosen.map((r) => r.label)}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Feature comparison" />
            <CardBody className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead className="bg-background text-left text-muted">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">Feature</th>
                    {chosen.map((r) => (
                      <th key={r.id} scope="col" className="px-3 py-2 font-medium">{r.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2 font-medium">Predicted price</td>
                    {chosen.map((r) => (
                      <td key={r.id} className="px-3 py-2 font-semibold text-primary">
                        {formatPrice(r.prediction.predicted_price)}
                      </td>
                    ))}
                  </tr>
                  {FEATURE_NAMES.map((name) => (
                    <tr key={name} className="border-t border-border">
                      <td className="px-3 py-2 text-muted">{FEATURE_META[name].label}</td>
                      {chosen.map((r) => (
                        <td key={r.id} className="px-3 py-2">
                          {r.features[name]}
                          {FEATURE_META[name].unit ? ` ${FEATURE_META[name].unit}` : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
