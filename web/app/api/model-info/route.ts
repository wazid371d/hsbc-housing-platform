import { NextResponse } from "next/server";
import { config } from "@/lib/config";

// Proxy the ML model metadata (coefficients + metrics) through the BFF.
export async function GET() {
  try {
    const res = await fetch(`${config.bffUrl}/api/model-info`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "Model info unavailable" }, { status: 503 });
  }
}
