import { WhatIfTool } from "@/components/market/WhatIfTool";

export default function WhatIfPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">What-If Analysis</h1>
        <p className="text-sm text-muted">
          Adjust property attributes to see how the predicted price changes and how it compares to
          its market segment. Predictions come from the Java backend calling the ML model.
        </p>
      </div>
      <WhatIfTool />
    </div>
  );
}
