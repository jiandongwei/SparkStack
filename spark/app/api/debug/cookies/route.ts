import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const ck = cookies();
    const hasGet = typeof (ck as any).get === "function";
    const sessionVal = hasGet ? (ck as any).get("session")?.value ?? null : null;

    const hdrs = headers();
    const cookieHeader = typeof (hdrs as any).get === "function" ? (hdrs as any).get("cookie") ?? null : null;

    console.log("[debug/cookies] cookies.get available:", hasGet);
    console.log("[debug/cookies] sessionVal:", sessionVal);
    console.log("[debug/cookies] cookie header:", cookieHeader);

    return NextResponse.json({ hasGet, sessionVal, cookieHeader });
  } catch (err) {
    console.error("[debug/cookies] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
