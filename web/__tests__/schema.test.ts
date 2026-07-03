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

  it("rejects more than 2 decimal places with the expected message", () => {
    const res = propertyFeaturesSchema.safeParse({ ...valid, square_footage: 1580.897544 });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toBe("Only 2 decimal places is allowed");
    }
  });

  it("accepts exactly 2 decimal places", () => {
    expect(propertyFeaturesSchema.safeParse({ ...valid, lot_size: 6800.99 }).success).toBe(true);
  });

  it("rejects fractional bathrooms as not a whole number", () => {
    const res = propertyFeaturesSchema.safeParse({ ...valid, bathrooms: 2.78 });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toBe("Must be a whole number");
    }
  });
});
