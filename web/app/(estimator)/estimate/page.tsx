"use client";

import { useState } from "react";
import { PropertyForm } from "@/components/estimator/PropertyForm";
import { ResultPanel } from "@/components/estimator/ResultPanel";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { useEstimate } from "@/hooks/useEstimate";
import { useEstimateHistory } from "@/hooks/useEstimateHistory";
import type { EstimateRecord, Prediction, PropertyFeatures } from "@/lib/types";

export default function EstimatePage() {
  const { estimate, loading, error } = useEstimate();
  const { add } = useEstimateHistory();
  const [result, setResult] = useState<{
    prediction: Prediction;
    features: PropertyFeatures;
    modelVersion: string;
  } | null>(null);

  async function handleSubmit(features: PropertyFeatures) {
    const res = await estimate([features]);
    if (res && res.predictions[0]) {
      const prediction = res.predictions[0];
      setResult({ prediction, features, modelVersion: res.model_version });
      const record: EstimateRecord = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        label: `${features.square_footage} sq ft · ${features.bedrooms} bd`,
        features,
        prediction,
      };
      add(record);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Property Value Estimator</h1>
        <p className="text-sm text-muted">
          Enter property details to get an ML-based price estimate. Each estimate is saved to your
          history.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Property details" />
          <CardBody>
            <PropertyForm onSubmit={handleSubmit} loading={loading} />
            {error && (
              <p role="alert" className="mt-3 rounded-lg bg-background px-3 py-2 text-sm text-primary">
                {error}
              </p>
            )}
          </CardBody>
        </Card>

        {result ? (
          <ResultPanel
            prediction={result.prediction}
            features={result.features}
            modelVersion={result.modelVersion}
          />
        ) : (
          <Card className="grid place-items-center">
            <CardBody className="text-center text-sm text-muted">
              Submit the form to see an estimate here.
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
