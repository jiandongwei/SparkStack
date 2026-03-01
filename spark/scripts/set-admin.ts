#!/usr/bin/env ts-node
import "dotenv/config";
import { getAdmin } from "../lib/firebaseAdmin";

const uid = process.argv[2];
if (!uid) {
  console.error("Usage: npx ts-node scripts/set-admin.ts <UID>");
  process.exit(1);
}

(async () => {
  try {
    const admin = getAdmin();
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log("Assigned admin to", uid);
    // Revoke refresh tokens so the client must reauthenticate and pick up new claims
    await admin.auth().revokeRefreshTokens(uid);
    console.log("Revoked refresh tokens for", uid);
  } catch (err) {
    console.error("Error setting admin claim:", err);
    process.exit(1);
  }
})();
