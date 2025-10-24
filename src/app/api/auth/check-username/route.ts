import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  if (!username) return NextResponse.json({ message: "username required" }, { status: 400 });

  // Backend provides /api/auth/check-username?username=xxx returns {exists:boolean}
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/auth/check-username?username=${encodeURIComponent(username)}`);
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ message: "Server Unreachable" }, { status: 502 });
  }
}

