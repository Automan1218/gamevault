import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ message: "email required" }, { status: 400 });

  // Backend provides /api/auth/check-email?email=xxx returns {exists:boolean}
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/auth/check-email?email=${encodeURIComponent(email)}`);
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ message: "Server Unreachable" }, { status: 502 });
  }
}




