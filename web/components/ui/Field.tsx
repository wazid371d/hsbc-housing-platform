import { InputHTMLAttributes, forwardRef } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unit?: string;
  error?: string;
  id: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, unit, error, id, className = "", ...props },
  ref
) {
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {unit && <span className="ml-1 text-xs font-normal text-muted">({unit})</span>}
      </label>
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none transition-colors ${
          error ? "border-error" : "border-border"
        } focus:border-accent ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
});
