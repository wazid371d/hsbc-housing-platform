import { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-background text-muted border-border",
  success: "bg-[color-mix(in_srgb,var(--success)_12%,white)] text-success border-[color-mix(in_srgb,var(--success)_30%,white)]",
  warning: "bg-[color-mix(in_srgb,var(--warning)_14%,white)] text-warning border-[color-mix(in_srgb,var(--warning)_30%,white)]",
  danger: "bg-[color-mix(in_srgb,var(--error)_10%,white)] text-error border-[color-mix(in_srgb,var(--error)_30%,white)]",
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
