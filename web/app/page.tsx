import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";

const apps = [
  {
    href: "/estimate",
    title: "Property Value Estimator",
    backend: "Python · FastAPI",
    description:
      "Enter property details to get an instant ML price estimate. Save a history of estimates and compare properties side by side.",
    features: ["Validated input form", "Tabular + chart results", "History & comparison"],
  },
  {
    href: "/dashboard",
    title: "Property Market Analysis",
    backend: "Java · Spring Boot",
    description:
      "Explore the housing market through an interactive dashboard, segment filters, a what-if tool, and exportable data tables.",
    features: ["Aggregate market stats", "What-if predictions", "CSV / PDF export"],
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Housing Portal</h1>
        <p className="max-w-2xl text-muted">
          A unified portal hosting two applications backed by different technologies, both powered
          by the same housing price prediction model.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        {apps.map((app) => (
          <Link
            key={app.href}
            href={app.href}
            className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold group-hover:text-primary">{app.title}</h2>
                  <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted">
                    {app.backend}
                  </span>
                </div>
                <p className="text-sm text-muted">{app.description}</p>
                <ul className="flex flex-wrap gap-2 pt-1">
                  {app.features.map((f) => (
                    <li
                      key={f}
                      className="rounded-md bg-background px-2 py-1 text-xs text-foreground"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="pt-2 text-sm font-medium text-primary">Open app →</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
