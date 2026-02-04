import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

/**
 * Firebase configuration - Production credentials
 * These are safe to expose in client-side code as Firebase security rules protect data
 */
const firebaseConfig = {
    apiKey: "AIzaSyDtkpamhlNkdDwgIKoMSjM5Lq5tDVgOwXw",
    authDomain: "edapp-ee93e.firebaseapp.com",
    projectId: "edapp-ee93e",
    storageBucket: "edapp-ee93e.firebasestorage.app",
    messagingSenderId: "821113476670",
    appId: "1:821113476670:web:e5faf4b87c2b0c1ef5e36f"
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
} catch (error) {
    console.error('Firebase initialization error:', error);
}

export { auth, app };

