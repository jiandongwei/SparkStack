import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/firebaseAdmin";

async function getSessionFromRequest(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const m = cookieHeader.match(/(?:^|; )session=([^;]+)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch (err) {
    return m[1];
  }
}

export async function GET(req: Request) {
  const sessionCookie = await getSessionFromRequest(req);
  if (!sessionCookie) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const admin = getAdmin();
  try {
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;

    // Use serverless pool to query chats table (create if missing)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Pool } = require("@neondatabase/serverless");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL_POOL ?? process.env.DATABASE_URL });

    // Schema is managed via migrations (Prisma). Assume `chats` table exists.

    const r = await pool.query("SELECT id,user_id,message,created_at FROM chats WHERE user_id = $1", [uid]);
    await pool.end();
    return NextResponse.json(r.rows[0] ?? { message: null });
  } catch (err: any) {
    console.error("/api/chat GET error", err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 401 });
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  let parsed: any = {};
  try {
    parsed = body ? JSON.parse(body) : {};
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { message } = parsed;
  if (!message) return NextResponse.json({ error: "Missing message" }, { status: 400 });

  const sessionCookie = await getSessionFromRequest(req);
  if (!sessionCookie) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const admin = getAdmin();
  try {
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Pool } = require("@neondatabase/serverless");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL_POOL ?? process.env.DATABASE_URL });

    // Schema is managed via migrations (Prisma). Assume `chats` table exists.

    const up = await pool.query(
      `INSERT INTO chats (user_id,message,created_at)
       VALUES ($1,$2,now())
       ON CONFLICT (user_id) DO UPDATE SET message = EXCLUDED.message, created_at = EXCLUDED.created_at
       RETURNING id,user_id,message,created_at`,
      [uid, message]
    );

    await pool.end();
    return NextResponse.json(up.rows[0]);
  } catch (err: any) {
    console.error("/api/chat POST error", err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 401 });
  }
}
