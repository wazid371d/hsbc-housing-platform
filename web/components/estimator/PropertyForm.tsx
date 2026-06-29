"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertyFeaturesSchema, type PropertyFormValues } from "@/lib/schema";
import { FEATURE_NAMES, FEATURE_META, type PropertyFeatures } from "@/lib/types";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const DEFAULTS: PropertyFormValues = {
  square_footage: 1550,
  bedrooms: 3,
  bathrooms: 2,
  year_built: 1997,
  lot_size: 6800,
  distance_to_city_center: 4.1,
  school_rating: 7.6,
};

export function PropertyForm({
  onSubmit,
  loading,
}: {
  onSubmit: (values: PropertyFeatures) => void;
  loading: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFeaturesSchema),
    defaultValues: DEFAULTS,
    mode: "onBlur",
  });

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v))} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {FEATURE_NAMES.map((name) => {
          const meta = FEATURE_META[name];
          return (
            <Field
              key={name}
              id={name}
              label={meta.label}
              unit={meta.unit}
              type="number"
              step={meta.step}
              inputMode="decimal"
              error={errors[name]?.message}
              {...register(name, { valueAsNumber: true })}
            />
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Estimating…" : "Estimate price"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => reset(DEFAULTS)} disabled={loading}>
          Reset
        </Button>
      </div>
    </form>
  );
}
