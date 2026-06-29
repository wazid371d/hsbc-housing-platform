import { describe, it, expect } from "vitest";

import { propertyFeaturesSchema } from "@/lib/schema";

const valid = {
  square_footage: 1550,
  bedrooms: 3,
  bathrooms: 2,
  year_built: 1997,
  lot_size: 6800,
  distance_to_city_center: 4.1,
  school_rating: 7.6,
};

describe("propertyFeaturesSchema", () => {
  it("accepts a valid property", () => {
    expect(propertyFeaturesSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects negative bedrooms", () => {
    expect(propertyFeaturesSchema.safeParse({ ...valid, bedrooms: -1 }).success).toBe(false);
  });

  it("rejects a school_rating above 10", () => {
    expect(propertyFeaturesSchema.safeParse({ ...valid, school_rating: 11 }).success).toBe(false);
  });
});
