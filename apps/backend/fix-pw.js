#!/usr/bin/env node
/**
 * Standalone Firebase password fix script.
 * Uses the same firebase-service-account.json as the main app.
 *
 * Usage:
 *   node fix-pw.js <firebase_uid> <new_password>
 *   node fix-pw.js JURG8PbasXb8yZEroYpNI3bIQWu2 'Janat@2000'
 */
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const uid = process.argv[2];
const newPassword = process.argv[3];

if (!uid || !newPassword) {
  console.error('Usage: node fix-pw.js <firebase_uid> <new_password>');
  process.exit(1);
}

// Credential resolution: env vars → JSON file → fail
function initFirebase() {
  if (admin.apps.length > 0) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKeyRaw) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKeyRaw.replace(/\\n/g, '\n'),
      }),
    });
    console.log(`Firebase init (env-cert) — project: ${projectId}`);
    return;
  }

  const jsonPath = path.resolve(process.cwd(), 'firebase-service-account.json');
  if (fs.existsSync(jsonPath)) {
    const sa = require(jsonPath);
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    console.log(`Firebase init (json-cert) — project: ${sa.project_id}`);
    return;
  }

  console.error('No Firebase credentials found. Set FIREBASE_* env vars or provide firebase-service-account.json');
  process.exit(1);
}

initFirebase();

admin.auth().updateUser(uid, { password: newPassword })
  .then(() => {
    console.log(`Password updated for UID: ${uid}`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed:', err.message || err);
    process.exit(1);
  });
