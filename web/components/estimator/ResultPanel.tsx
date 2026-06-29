"use client";

import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PriceChart } from "./PriceChart";
import { formatPrice } from "@/lib/format";
import type { Prediction, PropertyFeatures } from "@/lib/types";
import { FEATURE_META, FEATURE_NAMES } from "@/lib/types";

// Shows the prediction result in BOTH tabular and chart form (spec requirement).
export function ResultPanel({
  prediction,
  features,
  modelVersion,
}: {
  prediction: Prediction;
  features: PropertyFeatures;
  modelVersion: string;
}) {
  return (
    <Card>
      <CardHeader
        title="Estimated Price"
        description={`Model ${modelVersion}`}
        action={
          prediction.out_of_range ? (
            <Badge tone="warning">Out of training range</Badge>
          ) : (
            <Badge tone="success">In range</Badge>
          )
        }
      />
      <CardBody className="space-y-5">
        <div>
          <p className="text-3xl font-semibold text-primary">{formatPrice(prediction.predicted_price)}</p>
          <p className="text-sm text-muted">
            Confidence band {formatPrice(prediction.lower_bound)} – {formatPrice(prediction.upper_bound)}
          </p>
          {prediction.out_of_range && (
            <p className="mt-1 text-xs text-warning">
              One or more inputs are outside the data the model was trained on, so this is an
              extrapolation — treat it as lower confidence.
            </p>
          )}
        </div>

        <PriceChart predictions={[prediction]} labels={["This property"]} />

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <caption className="sr-only">Submitted property features</caption>
            <thead className="bg-background text-left text-muted">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">Feature</th>
                <th scope="col" className="px-3 py-2 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_NAMES.map((name) => (
                <tr key={name} className="border-t border-border">
                  <td className="px-3 py-2 text-muted">{FEATURE_META[name].label}</td>
                  <td className="px-3 py-2 font-medium">
                    {features[name]}
                    {FEATURE_META[name].unit ? ` ${FEATURE_META[name].unit}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
