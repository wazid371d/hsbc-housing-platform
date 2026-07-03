// Shared domain types for the portal.

export const FEATURE_NAMES = [
  "square_footage",
  "bedrooms",
  "bathrooms",
  "year_built",
  "lot_size",
  "distance_to_city_center",
  "school_rating",
] as const;

export type FeatureName = (typeof FEATURE_NAMES)[number];

export interface PropertyFeatures {
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
}

export interface Prediction {
  predicted_price: number;
  lower_bound: number;
  upper_bound: number;
  out_of_range: boolean;
}

export interface EstimateResponse {
  predictions: Prediction[];
  model_version: string;
}

export interface ModelInfo {
  model_type: string;
  target: string;
  features: string[];
  intercept: number;
  coefficients: Record<string, number>;
  raw_coefficients: Record<string, number>;
  metrics: Record<string, number>;
  n_samples: number;
  trained_at: string;
  model_version: string;
}

// A saved estimate (history entry): inputs + result + metadata.
export interface EstimateRecord {
  id: string;
  createdAt: number;
  label: string;
  features: PropertyFeatures;
  prediction: Prediction;
}

// Human-friendly labels + units for each feature.
export const FEATURE_META: Record<
  FeatureName,
  { label: string; unit?: string; step: number; integer?: boolean }
> = {
  square_footage: { label: "Square Footage", unit: "sq ft", step: 10 },
  bedrooms: { label: "Bedrooms", step: 1, integer: true },
  bathrooms: { label: "Bathrooms", step: 1, integer: true },
  year_built: { label: "Year Built", step: 1, integer: true },
  lot_size: { label: "Lot Size", unit: "sq ft", step: 50 },
  distance_to_city_center: { label: "Distance to City Center", unit: "mi", step: 0.1 },
  school_rating: { label: "School Rating", unit: "/10", step: 0.1 },
};
