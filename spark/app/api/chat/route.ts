import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/firebaseAdmin";
import { randomUUID } from "crypto";

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

    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");

    let r: any;
    if (sessionId) {
      r = await pool.query(
        "SELECT id,user_id,session_id,message,assistant_message,assistant_model,assistant_created_at,assistant_response,created_at FROM chats WHERE user_id = $1 AND session_id = $2 ORDER BY created_at ASC",
        [uid, sessionId]
      );
      await pool.end();
      return NextResponse.json(r.rows ?? []);
    }

    r = await pool.query(
      "SELECT id,user_id,session_id,message,assistant_message,assistant_model,assistant_created_at,assistant_response,created_at FROM chats WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [uid]
    );
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

    // Determine or create session id
    const sessionId = parsed.sessionId || randomUUID();

    // Insert the user's message as a new row for this session
    const up: any = await pool.query(
      `INSERT INTO chats (user_id,session_id,message,created_at)
       VALUES ($1,$2,$3,now())
       RETURNING id,user_id,session_id,message,created_at`,
      [uid, sessionId, message]
    );

    let resultRow = up.rows[0];

    // Use Vertex AI SDK via service account / ADC (preferred). If it fails, fallback logic below will run.
    try {
      // runtime require so code doesn't fail in environments without this package
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { VertexAI } = require("@google-cloud/vertexai");

      const PROJECT_ID = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "spark-stack";
      const LOCATION = process.env.GENERATIVE_LOCATION || process.env.GENERATIVE_REGION || "us-central1";
      const TEXT_MODEL = process.env.GENERATIVE_TEXT_MODEL || "gemini-2.5-flash-lite";

      const vertex = new VertexAI({ project: PROJECT_ID, location: LOCATION });
      const model = vertex.getGenerativeModel({ model: TEXT_MODEL });

      const prompt = `You are a helpful assistant. Keep responses concise and friendly.\nUser: ${message}`;

      // The SDK supports calling generateContent with a prompt string in many versions
      const result = await model.generateContent(prompt);

      const data = result?.response ?? result;
      // Extract assistant text from candidates -> content -> parts[].text
      const assistantText = (data?.candidates?.[0]?.content?.parts && data.candidates[0].content.parts.map((p: any) => p.text).join("")) || data?.candidates?.[0]?.content || data?.output || JSON.stringify(data);
      const assistantModel = data?.modelVersion || TEXT_MODEL;
      const assistantCreatedAt = data?.createTime ? new Date(data.createTime).toISOString() : new Date().toISOString();

      const up2: any = await pool.query(
        `UPDATE chats SET assistant_message = $1, assistant_model = $2, assistant_created_at = $3, assistant_response = $4 WHERE id = $5 RETURNING id,user_id,session_id,message,assistant_message,assistant_model,assistant_created_at,assistant_response,created_at`,
        [assistantText, assistantModel, assistantCreatedAt, JSON.stringify(data ?? {}), resultRow.id]
      );
      resultRow = up2.rows[0];
    } catch (err) {
      console.warn("Vertex AI call failed; not using Generative Language fallback:", err instanceof Error ? err.message : String(err));
      const assistantText = "Assistant unavailable: internal error. Please try again later.";
      const assistantModel = "vertex-failed";
      const assistantCreatedAt = new Date().toISOString();
      const up2: any = await pool.query(
        `UPDATE chats SET assistant_message = $1, assistant_model = $2, assistant_created_at = $3, assistant_response = $4 WHERE id = $5 RETURNING id,user_id,session_id,message,assistant_message,assistant_model,assistant_created_at,assistant_response,created_at`,
        [assistantText, assistantModel, assistantCreatedAt, JSON.stringify({ error: String(err) }), resultRow.id]
      );
      resultRow = up2.rows[0];
    }

    await pool.end();
    return NextResponse.json(resultRow);
  } catch (err: any) {
    console.error("/api/chat POST error", err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 401 });
  }
}
