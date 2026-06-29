import { PropertiesTable } from "@/components/market/PropertiesTable";
import { getProperties } from "@/lib/market";

// Rendered on demand (depends on the live Java backend), not prerendered at build.
export const dynamic = "force-dynamic";

// RSC: properties are fetched on the server for the initial render.
export default async function TablesPage() {
  const properties = await getProperties();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Property Data Tables</h1>
        <p className="text-sm text-muted">
          Sortable, filterable property data with CSV and PDF export.
        </p>
      </div>
      <PropertiesTable data={properties} />
    </div>
  );
}
