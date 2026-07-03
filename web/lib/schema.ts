import { z } from "zod";

// Mirrors the Pydantic bounds in the ML API / BFF so client-side validation matches the
// server. Inputs are registered with `valueAsNumber`, so values arrive as numbers (empty
// fields arrive as NaN, which fails the bound checks below). Keeping the schema purely
// numeric (no z.coerce) means input and output types match, so the RHF resolver types line up.
const required = "Enter a valid number";

// At most 2 decimal places. Values arrive as numbers (valueAsNumber); their shortest
// round-trip string reflects what the user typed, so counting digits after the dot is
// reliable for the magnitudes this form accepts.
const twoDecimalsMsg = "Only 2 decimal places is allowed";
const maxTwoDecimals = (v: number) => {
  if (!Number.isFinite(v)) return true; // let the number/bound checks report NaN instead
  const dot = v.toString().indexOf(".");
  return dot === -1 || v.toString().length - dot - 1 <= 2;
};

export const propertyFeaturesSchema = z.object({
  square_footage: z
    .number({ error: required })
    .gt(0, "Must be greater than 0")
    .max(20000, "Max 20,000 sq ft")
    .refine(maxTwoDecimals, twoDecimalsMsg),
  bedrooms: z
    .number({ error: required })
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .max(20, "Max 20"),
  bathrooms: z
    .number({ error: required })
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .max(20, "Max 20"),
  year_built: z
    .number({ error: required })
    .int("Must be a year")
    .min(1800, "Year must be ≥ 1800")
    .max(2026, "Year must be ≤ 2026"),
  lot_size: z
    .number({ error: required })
    .gt(0, "Must be greater than 0")
    .refine(maxTwoDecimals, twoDecimalsMsg),
  distance_to_city_center: z
    .number({ error: required })
    .min(0, "Cannot be negative")
    .refine(maxTwoDecimals, twoDecimalsMsg),
  school_rating: z
    .number({ error: required })
    .min(0, "Min 0")
    .max(10, "Max 10")
    .refine(maxTwoDecimals, twoDecimalsMsg),
});

export type PropertyFormValues = z.infer<typeof propertyFeaturesSchema>;
