import { StatCard } from "@/components/market/StatCard";
import { SegmentExplorer } from "@/components/market/SegmentExplorer";
import { getMarketSummary, getSegments } from "@/lib/market";
import { formatPrice, formatNumber } from "@/lib/format";

// Rendered on demand (depends on the live Java backend), not prerendered at build.
export const dynamic = "force-dynamic";

// React Server Component: initial market data is fetched on the server.
export default async function DashboardPage() {
  const [summary, segments] = await Promise.all([
    getMarketSummary(),
    getSegments("bedrooms"),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Market Analysis Dashboard</h1>
        <p className="text-sm text-muted">
          Aggregate statistics across {summary.count} properties, served by the Java backend.
        </p>
      </div>

      <section
        aria-label="Market summary"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard label="Properties" value={formatNumber(summary.count)} />
        <StatCard
          label="Average price"
          value={formatPrice(summary.avgPrice)}
          sub={`Median ${formatPrice(summary.medianPrice)}`}
        />
        <StatCard
          label="Price range"
          value={`${formatPrice(summary.minPrice)}`}
          sub={`up to ${formatPrice(summary.maxPrice)}`}
        />
        <StatCard
          label="Avg $/sqft"
          value={`$${formatNumber(Math.round(summary.avgPricePerSqft))}`}
          sub={`${formatNumber(Math.round(summary.avgSquareFootage))} sqft avg`}
        />
      </section>

      <SegmentExplorer initial={segments} />
    </div>
  );
}
