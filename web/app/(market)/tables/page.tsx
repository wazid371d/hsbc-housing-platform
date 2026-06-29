import { Card, CardBody } from "@/components/ui/Card";

export default function TablesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Data Tables</h1>
      <Card>
        <CardBody>
          <p className="text-sm text-muted">
            Coming soon — sortable, filterable property tables with CSV / PDF export.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
