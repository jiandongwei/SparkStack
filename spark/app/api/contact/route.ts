import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body ?? {};
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Pool } = require("@neondatabase/serverless");
      const conn = process.env.DATABASE_URL_POOL ?? process.env.DATABASE_URL;
      if (!conn) throw new Error("No DATABASE_URL_POOL or DATABASE_URL set for DB connection");
      const pool = new Pool({ connectionString: conn });
      const res = await pool.query(
        `INSERT INTO contacts (name, email, message, created_at) VALUES ($1,$2,$3,now()) RETURNING id`,
        [name, email, message]
      );
      const id = res?.rows?.[0]?.id ?? null;
      return NextResponse.json({ id }, { status: 201 });
    } catch (err2) {
      console.error("/api/contact neon insert failed", err2);
      return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    }
  } catch (err: any) {
    console.error("/api/contact error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
