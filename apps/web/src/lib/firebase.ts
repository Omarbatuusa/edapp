import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

/**
 * Firebase configuration from environment variables
 * These are NEXT_PUBLIC_ prefixed so they're available client-side
 */
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Check if we have valid Firebase configuration
 * This prevents initialization errors during SSR/build when env vars aren't available
 */
const hasValidConfig = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
);

// Initialize Firebase only if we have valid config (client-side or properly configured build)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (hasValidConfig) {
    try {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        auth = getAuth(app);
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
} else if (typeof window !== 'undefined') {
    // Only warn on client-side, not during build
    console.warn('Firebase config missing. Authentication will not work.');
}

export { auth, app };
