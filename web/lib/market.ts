import { config } from "./config";

export interface MarketSummary {
  count: number;
  avgPrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  avgPricePerSqft: number;
  avgSquareFootage: number;
  avgSchoolRating: number;
}

export interface SegmentStats {
  segment: string;
  count: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  avgPricePerSqft: number;
  avgSquareFootage: number;
}

export interface MarketProperty {
  id: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  lotSize: number;
  distanceToCityCenter: number;
  schoolRating: number;
  price: number;
}

export interface WhatIfResult {
  predictedPrice: number;
  lowerBound: number;
  upperBound: number;
  outOfRange: boolean;
  comparedSegment: string;
  segmentAvgPrice: number;
  differenceFromSegmentAvg: number;
}

export type SegmentDimension = "bedrooms" | "price_band" | "school_tier";

// ---- Server-side fetchers (used by React Server Components) ----
// These run on the server, so the internal Java URL never reaches the browser.

export async function getMarketSummary(): Promise<MarketSummary> {
  const res = await fetch(`${config.marketApiUrl}/api/market/stats`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to load market summary");
  return res.json();
}

export async function getSegments(by: SegmentDimension): Promise<SegmentStats[]> {
  const res = await fetch(`${config.marketApiUrl}/api/market/segments?by=${by}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to load segments");
  return res.json();
}

export async function getProperties(): Promise<MarketProperty[]> {
  const res = await fetch(`${config.marketApiUrl}/api/market/properties`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to load properties");
  return res.json();
}
