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

export async function POST(req: Request, ctx: { params: any }) {
  const { params } = ctx;
  const resolvedParams = params && typeof params.then === "function" ? await params : params;
  const cookieHeader = req.headers.get("cookie") ?? null;
  const session = parseSessionFromCookieHeader(cookieHeader);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const admin = getAdmin();
    const decoded = await admin.auth().verifySessionCookie(session, true);
    if (!(decoded as any).admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const uid = resolvedParams?.uid ?? params?.uid;
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: { params: any }) {
  const { params } = ctx;
  const resolvedParams = params && typeof params.then === "function" ? await params : params;
  const cookieHeader = req.headers.get("cookie") ?? null;
  const session = parseSessionFromCookieHeader(cookieHeader);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const admin = getAdmin();
    const decoded = await admin.auth().verifySessionCookie(session, true);
    if (!(decoded as any).admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const uid = resolvedParams?.uid ?? params?.uid;
    await admin.auth().setCustomUserClaims(uid, {});
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
