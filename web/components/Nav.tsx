"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/estimate", label: "Value Estimator", app: "estimator" },
  { href: "/dashboard", label: "Market Analysis", app: "market" },
];

const subLinks: Record<string, { href: string; label: string }[]> = {
  estimator: [
    { href: "/estimate", label: "Estimate" },
    { href: "/history", label: "History" },
    { href: "/compare", label: "Compare" },
  ],
  market: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/whatif", label: "What-If" },
    { href: "/tables", label: "Data Tables" },
  ],
};

function activeApp(pathname: string): "estimator" | "market" | null {
  if (["/estimate", "/history", "/compare"].some((p) => pathname.startsWith(p))) return "estimator";
  if (["/dashboard", "/whatif", "/tables"].some((p) => pathname.startsWith(p))) return "market";
  return null;
}

export function Nav() {
  const pathname = usePathname();
  const current = activeApp(pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <nav aria-label="Primary" className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded bg-primary text-xs font-bold text-primary-foreground">
            H
          </span>
          <span className="hidden sm:inline">Housing Portal</span>
        </Link>
        <ul className="flex items-center gap-1">
          {links.map((l) => {
            const isActive = current === l.app;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-background text-primary font-semibold"
                      : "text-primary hover:text-primary/80"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {current && (
        <div className="border-t border-border bg-background">
          <ul className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-2" aria-label="Section">
            {subLinks[current].map((s) => {
              const isActive = pathname === s.href;
              return (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-md px-3 py-1 text-sm transition-colors ${
                      isActive
                        ? "bg-surface font-medium text-primary shadow-sm"
                        : "text-primary hover:text-primary/80"
                    }`}
                  >
                    {s.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
