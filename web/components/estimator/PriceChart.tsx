"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ErrorBar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/format";
import type { Prediction } from "@/lib/types";

// Visualizes one or more predicted prices with their RMSE confidence band as error bars.
export function PriceChart({
  predictions,
  labels,
}: {
  predictions: Prediction[];
  labels: string[];
}) {
  const data = predictions.map((p, i) => ({
    name: labels[i] ?? `#${i + 1}`,
    price: p.predicted_price,
    // ErrorBar takes [below, above] offsets from the value.
    error: [p.predicted_price - p.lower_bound, p.upper_bound - p.predicted_price],
    outOfRange: p.out_of_range,
  }));

  return (
    <div className="h-64 w-full" role="img" aria-label="Bar chart of predicted prices with confidence bands">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted)" }} />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--muted)" }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            width={48}
          />
          <Tooltip
            formatter={(value) => [formatPrice(Number(value)), "Predicted"]}
            contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
          />
          <Bar dataKey="price" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.outOfRange ? "var(--warning)" : "var(--primary)"} />
            ))}
            <ErrorBar dataKey="error" width={4} strokeWidth={1.5} stroke="var(--foreground)" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
