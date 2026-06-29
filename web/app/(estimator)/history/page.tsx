"use client";

import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useEstimateHistory } from "@/hooks/useEstimateHistory";
import { formatPrice } from "@/lib/format";

export default function HistoryPage() {
  const { history, remove, clear, hydrated } = useEstimateHistory();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Estimate History</h1>
          <p className="text-sm text-muted">Your previous estimates, stored in this browser.</p>
        </div>
        {history.length > 0 && (
          <Button variant="secondary" onClick={clear}>
            Clear all
          </Button>
        )}
      </div>

      {!hydrated ? null : history.length === 0 ? (
        <Card>
          <CardBody className="text-center text-sm text-muted">
            No estimates yet. <Link href="/estimate" className="text-primary underline">Create one →</Link>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`${history.length} estimate${history.length === 1 ? "" : "s"}`} />
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {history.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.label}</p>
                    <p className="text-xs text-muted">
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.prediction.out_of_range && <Badge tone="warning">Extrapolated</Badge>}
                    <span className="font-semibold text-primary">
                      {formatPrice(r.prediction.predicted_price)}
                    </span>
                    <Button
                      variant="ghost"
                      onClick={() => remove(r.id)}
                      aria-label={`Remove estimate ${r.label}`}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
