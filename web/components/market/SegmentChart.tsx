"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/format";
import type { SegmentStats } from "@/lib/market";

export function SegmentChart({ segments }: { segments: SegmentStats[] }) {
  const data = segments.map((s) => ({ name: s.segment, avgPrice: s.avgPrice, count: s.count }));

  return (
    <div
      className="h-72 w-full"
      role="img"
      aria-label="Bar chart of average price by market segment"
    >
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
            formatter={(value) => [formatPrice(Number(value)), "Avg price"]}
            contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
          />
          <Bar dataKey="avgPrice" fill="var(--accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
