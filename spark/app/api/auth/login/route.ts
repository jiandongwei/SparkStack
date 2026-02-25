import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth/db";

export async function POST(req: Request) {
  console.log("[auth/login] POST handler invoked", req.url);

  const form = await req.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");

  console.log("[auth/login] form data:", { email, passwordLength: String(password).length });

  const user = await verifyUser(email, password);
  if (!user) {
    console.log("[auth/login] invalid credentials for", email);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  console.log("[auth/login] verified user", user.id);

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  try {
    res.cookies.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    console.log("[auth/login] set session cookie for user", user.id);
  } catch (err) {
    console.error("[auth/login] failed to set cookie", err);
  }

  return res;
}
