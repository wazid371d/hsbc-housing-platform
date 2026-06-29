"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Card className="mx-auto max-w-md">
      <CardBody className="space-y-3 text-center">
        <h1 className="text-lg font-semibold text-primary">Estimator unavailable</h1>
        <p className="text-sm text-muted">{error.message || "Failed to load the estimator."}</p>
        <Button onClick={reset}>Retry</Button>
      </CardBody>
    </Card>
  );
}
