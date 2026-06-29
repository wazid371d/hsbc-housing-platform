import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

// Proxy estimate requests to the Python BFF. Keeps the internal BFF URL server-side
// and avoids browser CORS entirely.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${config.bffUrl}/api/estimate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { detail: "Estimator service is unreachable" },
      { status: 503 }
    );
  }
}
