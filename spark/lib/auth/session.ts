import { cookies, headers } from "next/headers";

export function setSession(userId: string) {
  const ck = cookies();
  if (typeof (ck as any).set === "function") {
    (ck as any).set("session", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      domain: ".sparkstack.me",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
  }
  // If `cookies().set` isn't available in this runtime (e.g. certain server contexts),
  // setting cookies should be done from a route handler where you have access to the
  // response object (res.cookies.set). We silently no-op here to avoid runtime errors.
}

export function clearSession() {
  const ck = cookies();
  if (typeof (ck as any).delete === "function") {
    (ck as any).delete("session");
  }
}

export function getSession() {
  const ck = cookies();
  if (typeof (ck as any).get === "function") {
    return (ck as any).get("session")?.value ?? null;
  }

  // If the runtime doesn't expose `cookies().get`, we cannot reliably read
  // the session cookie here. Return null so server components treat the
  // request as unauthenticated. For cookie reads in route handlers, use
  // the `request`/`res` objects where available.
  return null;
}
