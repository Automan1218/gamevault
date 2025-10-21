import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081";

export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  const body = await req.json().catch(() => ({}));
  const action = params.action;
  let endpoint = "";
  if (action === "login") endpoint = "/api/auth/login";
  else if (action === "register") endpoint = "/api/auth/register";
  else return NextResponse.json({ message: "Not Found" }, { status: 404 });

  try {
    const res = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ message: "Server Unreachable" }, { status: 502 });
  }
}




