import { ReactNode } from "react";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/firebaseAdmin";
import AdminNavbar from "@/app/components/AdminNavbar";

async function parseSessionFromCookies() {
  // Try the Cookies API first (some runtimes provide this)
  try {
    const ck = await cookies();
    if (ck && typeof (ck as any).get === "function") {
      const val = (ck as any).get("session")?.value ?? null;
      if (val) return val;
    }
  } catch (e) {
    // ignore and try headers fallback
  }

  // Fallback: try to read cookie header from headers(); be defensive about shape
  try {
    const hdr = headers();
    let header: string | null = null;
    if (hdr) {
      if (typeof (hdr as any).get === "function") header = (hdr as any).get("cookie");
      else if (typeof (hdr as any).cookie === "string") header = (hdr as any).cookie;
      else if (typeof hdr === "string") header = hdr;
    }
    if (!header) return null;
    const pairs = header.split(";").map((c) => c.trim());
    const sessionPair = pairs.find((p) => p.startsWith("session="));
    if (!sessionPair) return null;
    const [, value] = sessionPair.split("=");
    try {
      return decodeURIComponent(value ?? "") || null;
    } catch {
      return value ?? null;
    }
  } catch (e) {
    return null;
  }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await parseSessionFromCookies();
  if (!session) return redirect("/login");

  try {
    const admin = getAdmin();
    const decoded = await admin.auth().verifySessionCookie(session, true);
    // Expect a custom claim `admin: true` on admin users
    if (!decoded || !(decoded as any).admin) return redirect("/");
  } catch (err) {
    return redirect("/login");
  }

  return (
    <div style={{ padding: 16 }}>
      <header style={{ marginBottom: 16 }}>
        <h1>Admin Console</h1>
        <AdminNavbar />
      </header>
      <main>{children}</main>
    </div>
  );
}
