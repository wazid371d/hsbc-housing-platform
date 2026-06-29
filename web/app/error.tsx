"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real app this would go to an error reporting service.
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[40vh] place-items-center">
      <Card className="max-w-md">
        <CardBody className="space-y-3 text-center">
          <h1 className="text-lg font-semibold text-primary">Something went wrong</h1>
          <p className="text-sm text-muted">
            {error.message || "An unexpected error occurred while loading this page."}
          </p>
          <Button onClick={reset}>Try again</Button>
        </CardBody>
      </Card>
    </div>
  );
}
