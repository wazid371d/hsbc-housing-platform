import { Card, CardBody } from "@/components/ui/Card";

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardBody className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted">{sub}</p>}
      </CardBody>
    </Card>
  );
}
