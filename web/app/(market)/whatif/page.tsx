import { Card, CardBody } from "@/components/ui/Card";

export default function WhatIfPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">What-If Analysis</h1>
      <Card>
        <CardBody>
          <p className="text-sm text-muted">
            Coming soon — adjust property attributes and see how the predicted price changes,
            via the Java backend calling the ML model.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
