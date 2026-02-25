import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/firebaseAdmin";

const expiresIn = 60 * 60 * 24 * 7 * 1000; // 1 week in ms for createSessionCookie

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: "Missing idToken" }, { status: 400 });

    const admin = getAdmin();
    const auth = admin.auth();

    // create a Firebase session cookie (recommended for server sessions)
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ ok: true });
    res.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });

    return res;
  } catch (err: any) {
    console.error("[auth/firebase-login] error", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
