import { ReactNode } from "react";

export default function MarketLayout({ children }: { children: ReactNode }) {
  return <div className="animate-[fadeIn_150ms_ease-out]">{children}</div>;
}
