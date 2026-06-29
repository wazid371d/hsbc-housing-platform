import { Card, CardBody } from "@/components/ui/Card";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Market Analysis Dashboard</h1>
      <Card>
        <CardBody>
          <p className="text-sm text-muted">
            Coming soon — this dashboard will be powered by the Java Spring Boot backend
            (aggregate market statistics, segment filters, charts).
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
