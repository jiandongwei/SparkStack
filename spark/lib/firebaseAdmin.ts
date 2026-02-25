import admin from "firebase-admin";

let app: admin.app.App | null = null;

function getServiceAccount() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) return null;

  return {
    projectId,
    clientEmail,
    // Private key in env often has escaped newlines; restore them.
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
}

export function getAdmin() {
  if (app) return admin;

  const serviceAccount = getServiceAccount();
  if (serviceAccount) {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
    return admin;
  }

  // Fallback: try default credentials (e.g., when GOOGLE_APPLICATION_CREDENTIALS is set)
  try {
    app = admin.initializeApp();
    return admin;
  } catch (err) {
    console.warn("firebase-admin not initialized: missing credentials", err);
    return admin; // may still throw when used
  }
}
