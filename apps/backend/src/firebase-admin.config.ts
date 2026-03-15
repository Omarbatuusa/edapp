/**
 * Shared Firebase Admin SDK initialization.
 *
 * Credential resolution order:
 *   1. Env-var cert: FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 *   2. JSON file cert: firebase-service-account.json in CWD (Docker volume mount)
 *   3. Application Default Credentials — ONLY if USE_GCP_ADC_FOR_FIREBASE=true
 *   4. Fail fast with a clear error
 *
 * Call `initFirebaseAdmin()` anywhere — it is idempotent (no-op after first call).
 */
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

export type FirebaseCredentialSource = 'env-cert' | 'json-cert' | 'adc';

let credentialSource: FirebaseCredentialSource | null = null;

export function getFirebaseCredentialSource(): FirebaseCredentialSource | null {
  return credentialSource;
}

export function initFirebaseAdmin(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // ── 1. Explicit env-var cert ──────────────────────────────────
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKeyRaw) {
    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
    const app = admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
    credentialSource = 'env-cert';
    console.log(
      `Firebase Admin initialized (env-cert) — project: ${projectId}, email: ${clientEmail}`,
    );
    return app;
  }

  // ── 2. JSON service-account file ──────────────────────────────
  const jsonPath = path.resolve(process.cwd(), 'firebase-service-account.json');
  if (fs.existsSync(jsonPath)) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceAccount = require(jsonPath);
      const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      credentialSource = 'json-cert';
      console.log(
        `Firebase Admin initialized (json-cert) — project: ${serviceAccount.project_id}, email: ${serviceAccount.client_email}`,
      );
      return app;
    } catch (err: any) {
      console.error(`Failed to load ${jsonPath}:`, err.message);
      // Fall through to next option
    }
  }

  // ── 3. Application Default Credentials (opt-in only) ─────────
  if (process.env.USE_GCP_ADC_FOR_FIREBASE === 'true') {
    const app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: projectId || undefined,
    });
    credentialSource = 'adc';
    console.log(
      `Firebase Admin initialized (adc) — project: ${projectId || '(auto)'}`,
    );
    return app;
  }

  // ── 4. Fail fast ─────────────────────────────────────────────
  throw new Error(
    'Firebase Admin SDK credentials not configured. Provide one of:\n' +
    '  1. FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY env vars\n' +
    '  2. firebase-service-account.json in the working directory\n' +
    '  3. USE_GCP_ADC_FOR_FIREBASE=true (with Application Default Credentials)\n',
  );
}
