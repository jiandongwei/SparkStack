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

type VarState = {
  expr: string;  // original expression (e.g. "a+b")
  value: string; // evaluated value (e.g. "2")
};
type StateMap = Record<string, VarState>;

export async function GET(req: Request) {
  const sessionCookie = await getSessionFromRequest(req);
  if (!sessionCookie)
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const admin = getAdmin();
  try {
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Pool } = require("@neondatabase/serverless");
    const pool = new Pool({
      connectionString:
        process.env.DATABASE_URL_POOL ?? process.env.DATABASE_URL,
    });

    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");

    let r: any;
    if (sessionId) {
      r = await pool.query(
        "SELECT id,user_id,session_id,message,assistant_message,assistant_model,assistant_created_at,assistant_response,state,created_at FROM chats WHERE user_id = $1 AND session_id = $2 ORDER BY created_at ASC",
        [uid, sessionId]
      );
      await pool.end();
      return NextResponse.json(r.rows ?? []);
    }

    r = await pool.query(
      "SELECT id,user_id,session_id,message,assistant_message,assistant_model,assistant_created_at,assistant_response,state,created_at FROM chats WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30",
      [uid]
    );
    await pool.end();
    const rows = (r.rows ?? []).reverse();
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("/api/chat GET error", err);
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 401 }
    );
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
  if (!message)
    return NextResponse.json({ error: "Missing message" }, { status: 400 });

  const sessionCookie = await getSessionFromRequest(req);
  if (!sessionCookie)
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const admin = getAdmin();
  try {
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Pool } = require("@neondatabase/serverless");
    const pool = new Pool({
      connectionString:
        process.env.DATABASE_URL_POOL ?? process.env.DATABASE_URL,
    });

    // --- Determine or reuse session id ---
    let sessionId: string | undefined = parsed.sessionId;
    if (!sessionId) {
      const lastSessionQ: any = await pool.query(
        `SELECT session_id FROM chats WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [uid]
      );
      if (lastSessionQ.rows?.[0]?.session_id) {
        sessionId = lastSessionQ.rows[0].session_id;
      } else {
        sessionId = randomUUID();
      }
    }

    // Insert the user's message as a new row for this session
    const up: any = await pool.query(
      `INSERT INTO chats (user_id,session_id,message,created_at)
       VALUES ($1,$2,$3,now())
       RETURNING id,user_id,session_id,message,created_at`,
      [uid, sessionId, message]
    );

    let resultRow = up.rows[0];

    // Shared state map for this request
    const mergedState: StateMap = {};

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { VertexAI } = require("@google-cloud/vertexai");

      const PROJECT_ID =
        process.env.FIREBASE_ADMIN_PROJECT_ID ||
        process.env.PROJECT_ID ||
        process.env.GOOGLE_CLOUD_PROJECT ||
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
        "spark-stack";
      const LOCATION =
        process.env.GENERATIVE_LOCATION ||
        process.env.GENERATIVE_REGION ||
        "us-central1";
      const TEXT_MODEL =
        process.env.GENERATIVE_TEXT_MODEL || "gemini-2.5-flash-lite";

      const vertex = new VertexAI({ project: PROJECT_ID, location: LOCATION });
      const model = vertex.getGenerativeModel({ model: TEXT_MODEL });

      const HISTORY_TURNS = Number(process.env.CHAT_HISTORY_TURNS ?? 8);

      // --- Fetch history for this session (or last 30 messages) including state ---
      let histQ: any;
      if (sessionId) {
        histQ = await pool.query(
          `SELECT message, assistant_message, created_at, state FROM chats WHERE user_id = $1 AND session_id = $2 ORDER BY created_at ASC`,
          [uid, sessionId]
        );
      } else {
        histQ = await pool.query(
          `SELECT message, assistant_message, created_at, state FROM chats WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`,
          [uid]
        );
        histQ.rows = (histQ.rows ?? []).reverse();
      }

      const histRows = histQ.rows ?? [];
      const turns: string[] = [];
      for (const row of histRows) {
        if (row.message) turns.push(`User: ${String(row.message)}`);
        if (row.assistant_message)
          turns.push(`Assistant: ${String(row.assistant_message)}`);
      }

      // --- Merge previous state from DB ---
      for (const row of histRows) {
        if (!row.state) continue;
        try {
          const raw = typeof row.state === "string" ? JSON.parse(row.state) : row.state;
          if (raw && typeof raw === "object") {
            // Support both old flat format and new expr/value format
            for (const [k, v] of Object.entries(raw)) {
              if (v && typeof v === "object" && "expr" in (v as any) && "value" in (v as any)) {
                mergedState[k] = {
                  expr: String((v as any).expr),
                  value: String((v as any).value),
                };
              } else {
                mergedState[k] = {
                  expr: String(v as any),
                  value: String(v as any),
                };
              }
            }
          }
        } catch {
          // ignore parse errors
        }
      }

      // --- Parse new assignments from current user message ---
      const assignRegex = /([A-Za-z_]\w*)\s*=\s*([^,;\n]+)/g;
      let m: RegExpExecArray | null;
      while ((m = assignRegex.exec(String(message)))) {
        const key = m[1];
        const expr = m[2].trim();
        mergedState[key] = { expr, value: expr };
      }

      // --- Evaluate expressions deterministically ---
      const safeExprRegex = /^[0-9+\-*/().\s]+$/;
      const isNumeric = (s: string) => /^-?\d+(?:\.\d+)?$/.test(s);

      let progress = true;
      for (let iter = 0; iter < 5 && progress; iter++) {
        progress = false;

        for (const [k, obj] of Object.entries(mergedState)) {
          const expr = obj.expr.trim();
          // Substitute variable names with their current values
          let substituted = expr;
          const varNames = Object.keys(mergedState).sort(
            (a, b) => b.length - a.length
          );
          for (const vn of varNames) {
            const vv = mergedState[vn].value;
            substituted = substituted.replace(
              new RegExp(`\\b${vn}\\b`, "g"),
              vv
            );
          }

          if (!safeExprRegex.test(substituted)) {
            // If it's just a literal non-numeric, keep as-is
            if (!isNumeric(substituted)) {
              obj.value = substituted;
            }
            continue;
          }

          try {
            // eslint-disable-next-line no-new-func
            const out = Function(`"use strict";return (${substituted})`)();
            if (typeof out === "number" && Number.isFinite(out)) {
              const newVal = String(out);
              if (obj.value !== newVal) {
                obj.value = newVal;
                progress = true;
              }
            } else if (out != null) {
              const newVal = String(out);
              if (obj.value !== newVal) {
                obj.value = newVal;
                progress = true;
              }
            }
          } catch {
            // ignore evaluation errors, keep current value
          }
        }
      }

      const recent = turns.slice(-HISTORY_TURNS * 2);
      const systemInstruction =
        "You are a helpful assistant. Keep responses concise and friendly. Use prior conversation context when relevant, and treat previous variable assignments as authoritative unless explicitly changed. When giving any computed variable value, ALWAYS output it in the form `variable=value`.";
      const historyText = recent.join("\n");
      const stateText = Object.keys(mergedState).length
        ? `Current variables: ${Object.entries(mergedState)
            .map(([k, v]) => `${k}=${v.value}`)
            .join(", ")}`
        : "";

      // --- Local deterministic answer for "what is x" style questions ---
      const askVarMatch =
        String(message).match(/what(?:'s| is)\s+([A-Za-z_]\w*)\b/i) ||
        String(message).match(/^([A-Za-z_]\w*)\s*\?$/);
      if (askVarMatch) {
        const varName = askVarMatch[1];
        const entry = mergedState[varName];
        if (entry && isNumeric(entry.value)) {
          const assistantTextLocal = `${varName}=${entry.value}`;
          const assistantModelLocal = "local-evaluator";
          const assistantCreatedAtLocal = new Date().toISOString();
          const up2: any = await pool.query(
            `UPDATE chats
             SET assistant_message = $1,
                 assistant_model = $2,
                 assistant_created_at = $3,
                 assistant_response = $4,
                 state = $6
             WHERE id = $5
             RETURNING id,user_id,session_id,message,assistant_message,assistant_model,assistant_created_at,assistant_response,created_at,state`,
            [
              assistantTextLocal,
              assistantModelLocal,
              assistantCreatedAtLocal,
              JSON.stringify({ computed: true }),
              resultRow.id,
              JSON.stringify(mergedState),
            ]
          );
          resultRow = up2.rows[0];
          await pool.end();
          return NextResponse.json(resultRow);
        }
      }

      // --- Call LLM when local evaluator can't fully answer ---
      const prompt = `${systemInstruction}\n\n${stateText}${
        stateText ? "\n\n" : ""
      }Conversation history:\n${historyText}\n\nUser: ${message}\nAssistant:`;

      const result = await model.generateContent(prompt);
      const data = result?.response ?? result;

      const assistantText =
        (data?.candidates?.[0]?.content?.parts &&
          data.candidates[0].content.parts
            .map((p: any) => p.text)
            .join("")) ||
        data?.candidates?.[0]?.content ||
        data?.output ||
        JSON.stringify(data);
      const assistantModel = data?.modelVersion || TEXT_MODEL;
      const assistantCreatedAt = data?.createTime
        ? new Date(data.createTime).toISOString()
        : new Date().toISOString();

      // --- Post-process assistant text: extract any assignments into state ---
      try {
        for (const mm of String(assistantText).matchAll(assignRegex)) {
          const key = mm[1];
          const expr = mm[2].trim();
          mergedState[key] = { expr, value: expr };
        }
        const numericAssignRegex =
          /([A-Za-z_]\w*)\s*=\s*(-?\d+(?:\.\d+)?)/g;
        for (const mm of String(assistantText).matchAll(numericAssignRegex)) {
          const key = mm[1];
          const val = mm[2];
          mergedState[key] = { expr: val, value: val };
        }
      } catch {
        // ignore parse issues
      }

      const up2: any = await pool.query(
        `UPDATE chats
         SET assistant_message = $1,
             assistant_model = $2,
             assistant_created_at = $3,
             assistant_response = $4,
             state = $6
         WHERE id = $5
         RETURNING id,user_id,session_id,message,assistant_message,assistant_model,assistant_created_at,assistant_response,created_at,state`,
        [
          assistantText,
          assistantModel,
          assistantCreatedAt,
          JSON.stringify(data ?? {}),
          resultRow.id,
          JSON.stringify(mergedState),
        ]
      );
      resultRow = up2.rows[0];
    } catch (err) {
      console.warn(
        "Vertex AI call failed; not using Generative Language fallback:",
        err instanceof Error ? err.message : String(err)
      );
      const assistantText =
        "Assistant unavailable: internal error. Please try again later.";
      const assistantModel = "vertex-failed";
      const assistantCreatedAt = new Date().toISOString();
      const up2: any = await pool.query(
        `UPDATE chats
         SET assistant_message = $1,
             assistant_model = $2,
             assistant_created_at = $3,
             assistant_response = $4,
             state = $6
         WHERE id = $5
         RETURNING id,user_id,session_id,message,assistant_message,assistant_model,assistant_created_at,assistant_response,created_at,state`,
        [
          assistantText,
          assistantModel,
          assistantCreatedAt,
          JSON.stringify({ error: String(err) }),
          resultRow.id,
          JSON.stringify(mergedState),
        ]
      );
      resultRow = up2.rows[0];
    }

    await pool.end();
    return NextResponse.json(resultRow);
  } catch (err: any) {
    console.error("/api/chat POST error", err);
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 401 }
    );
  }
}
