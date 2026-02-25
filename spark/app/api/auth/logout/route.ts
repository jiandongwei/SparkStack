import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Clear session cookie
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("session");
  return res;
}
