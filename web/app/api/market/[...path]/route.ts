import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

// Catch-all proxy to the Java market backend for client-side calls (what-if, filtered
// properties, CSV export). Keeps the internal Java URL server-side and avoids CORS.
async function proxy(request: NextRequest, path: string[]) {
  const search = request.nextUrl.search;
  const target = `${config.marketApiUrl}/api/market/${path.join("/")}${search}`;

  const init: RequestInit = {
    method: request.method,
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  };
  if (request.method === "POST") {
    init.body = await request.text();
  }

  try {
    const res = await fetch(target, init);
    const contentType = res.headers.get("content-type") ?? "";

    // Stream CSV (and any non-JSON) straight through with its headers.
    if (!contentType.includes("application/json")) {
      const body = await res.text();
      return new NextResponse(body, {
        status: res.status,
        headers: {
          "content-type": contentType || "text/plain",
          ...(res.headers.get("content-disposition")
            ? { "content-disposition": res.headers.get("content-disposition")! }
            : {}),
        },
      });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Market service is unreachable" }, { status: 503 });
  }
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(request, path);
}
