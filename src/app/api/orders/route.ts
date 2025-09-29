import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || undefined;
    const res = await fetch(`${BASE}/api/orders/summary`, { headers: auth ? { Authorization: auth } as any : undefined });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ message: "upstream error" }, { status: 502 });
  }
}


