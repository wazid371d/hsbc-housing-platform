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
          <Button variant="secondary" onClick={clear} className="text-primary">
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
                      title="Remove"
                      className="px-2 hover:opacity-80"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5 text-error"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
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
