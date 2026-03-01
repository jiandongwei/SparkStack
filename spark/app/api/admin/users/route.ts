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

  try {
    const admin = getAdmin();
    const decoded = await admin.auth().verifySessionCookie(session, true);
    if (!(decoded as any).admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const list = await admin.auth().listUsers(1000);
    const users = list.users.map((u) => ({
      uid: u.uid,
      email: u.email ?? null,
      displayName: u.displayName ?? null,
      admin: (u.customClaims as any)?.admin ?? false,
    }));

    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
