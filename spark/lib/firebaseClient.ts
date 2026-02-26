// lib/firebaseClient.ts
// IMPORTANT: No "use client" here.
// IMPORTANT: Do NOT initialize Firebase at module load time.

export async function loadFirebase() {
  const { initializeApp, getApps, getApp } = await import("firebase/app");
  const { getAuth, GoogleAuthProvider } = await import("firebase/auth");

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  };

  // Sanity check: ensure public env vars are present in the client runtime.
  const missing = Object.entries(firebaseConfig).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    throw new Error(`Missing Firebase client env vars: ${missing.join(", ")}`);
  }

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const googleAuthProvider = new GoogleAuthProvider();

  return { app, auth, googleAuthProvider };
}
