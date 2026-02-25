import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Clear session cookie
  const res = NextResponse.json({ ok: true });
  const cookieOpts: any = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };
  if (process.env.COOKIE_DOMAIN) cookieOpts.domain = process.env.COOKIE_DOMAIN;

  // Some runtimes' cookies.delete doesn't accept options; set an expired cookie instead.
  res.cookies.set("session", "", cookieOpts);
  return res;
}
