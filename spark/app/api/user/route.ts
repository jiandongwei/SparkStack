import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/firebaseAdmin";

function parseSessionFromCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(";").map((c) => c.trim());
  const sessionPair = pairs.find((p) => p.startsWith("session="));
  if (!sessionPair) return null;
  const [, value] = sessionPair.split("=");
  try {
    return decodeURIComponent(value ?? "") || null;
  } catch {
    return value ?? null;
  }
}

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? null;
  const session = parseSessionFromCookieHeader(cookieHeader);

  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // If firebase-admin is configured, try verifying the session cookie.
  try {
    const admin = getAdmin();
    const decoded = await admin.auth().verifySessionCookie(session, true);
    return NextResponse.json({ userId: decoded.uid });
  } catch (err) {
    // Fallback: return the raw session value as userId (for simple demos)
    return NextResponse.json({ userId: session });
  }
}
