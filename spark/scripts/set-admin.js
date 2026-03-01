#!/usr/bin/env node
// Load environment; prefer .env.local if present (Next.js uses .env.local)
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  require('dotenv').config();
}
const admin = require('firebase-admin');

function getServiceAccount() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) return null;
  // Strip surrounding quotes if present and restore escaped newlines
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');
  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

function getAdmin() {
  if (admin.apps && admin.apps.length) return admin;
  const serviceAccount = getServiceAccount();
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return admin;
  }
  try {
    admin.initializeApp();
    return admin;
  } catch (err) {
    console.error('firebase-admin not initialized: missing credentials', err);
    return admin;
  }
}

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node scripts/set-admin.js <UID>');
  process.exit(1);
}

(async () => {
  try {
    const adm = getAdmin();
    await adm.auth().setCustomUserClaims(uid, { admin: true });
    console.log('Assigned admin to', uid);
    await adm.auth().revokeRefreshTokens(uid);
    console.log('Revoked refresh tokens for', uid);
    process.exit(0);
  } catch (err) {
    console.error('Error setting admin claim:', err);
    process.exit(1);
  }
})();
