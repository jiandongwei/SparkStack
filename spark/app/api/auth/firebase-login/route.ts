import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/firebaseAdmin";
import prisma from "@/lib/prisma";
import pool from "@/lib/pg";
import { Prisma } from "@prisma/client";

const expiresIn = 60 * 60 * 24 * 7 * 1000; // 1 week in ms for createSessionCookie

export async function POST(req: Request) {
  const body = await req.text();
  let idToken: string | undefined;
  try {
    const parsed = body ? JSON.parse(body) : {};
    idToken = parsed.idToken;
  } catch (err) {
    console.error("[auth/firebase-login] invalid JSON body", err, body);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!idToken) return NextResponse.json({ error: "Missing idToken" }, { status: 400 });

  const admin = getAdmin();
  const auth = admin.auth();

  let decoded: any;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch (err: any) {
    console.error("[auth/firebase-login] verifyIdToken failed", err);
    return NextResponse.json({ error: "Invalid ID token", details: err?.message ?? String(err) }, { status: 401 });
  }

  try {
    // create a Firebase session cookie (recommended for server sessions)
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // upsert user into DB using Prisma (with pg fallback)
    try {
      const uid = decoded.uid;
      const userRecord = await auth.getUser(uid);
      console.log('[auth/firebase-login] upsert start', { uid });
      console.log('[auth/firebase-login] userRecord', {
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
      });

      try {
        const upserted = await prisma.user.upsert({
          where: ({ firebaseId: uid } as unknown) as Prisma.UserWhereUniqueInput,
          update: {
            email: userRecord.email ?? null,
            displayName: userRecord.displayName ?? null,
            photoURL: userRecord.photoURL ?? null,
          },
          create: {
            firebaseId: uid,
            email: userRecord.email ?? null,
            displayName: userRecord.displayName ?? null,
            photoURL: userRecord.photoURL ?? null,
          },
        });
        console.log('[auth/firebase-login] prisma upsert', { id: upserted.id });
      } catch (e) {
        console.warn("[auth/firebase-login] prisma upsert failed, falling back to raw SQL", e);
        try {
          // fallback: insert/update via pg pool. Ensure your DB has a `users` table with a
          // unique `firebase_id` column. Column names below are snake_case.
          const uid = decoded.uid;
          const userRecord = await auth.getUser(uid);
          await pool.query(
            `INSERT INTO users (firebase_id, email, display_name, photo_url) VALUES ($1,$2,$3,$4)
             ON CONFLICT (firebase_id) DO UPDATE SET email = EXCLUDED.email, display_name = EXCLUDED.display_name, photo_url = EXCLUDED.photo_url`,
            [uid, userRecord.email ?? null, userRecord.displayName ?? null, userRecord.photoURL ?? null]
          );
        } catch (err2) {
          console.warn("[auth/firebase-login] pg fallback failed", err2);
        }
      }
    } catch (e) {
      console.warn("[auth/firebase-login] could not upsert user to DB", e);
    }

    const res = NextResponse.json({ ok: true });
    const cookieOpts: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    };
    if (process.env.COOKIE_DOMAIN) cookieOpts.domain = process.env.COOKIE_DOMAIN;

    res.cookies.set("session", sessionCookie, cookieOpts);

    return res;
  } catch (err: any) {
    console.error("[auth/firebase-login] error", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
