'use client';

import { useEffect, useState, useCallback } from 'react';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

// ============================================================
// PUSH NOTIFICATIONS HOOK - Firebase Cloud Messaging client
// ============================================================

interface PushNotification {
    id: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    timestamp: Date;
}

interface UsePushNotificationsResult {
    isSupported: boolean;
    isEnabled: boolean;
    isLoading: boolean;
    error: string | null;
    token: string | null;
    notifications: PushNotification[];
    requestPermission: () => Promise<boolean>;
    unsubscribe: () => Promise<void>;
    clearNotifications: () => void;
}

// Firebase config - should match your Firebase project
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// VAPID key for web push
const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

let firebaseApp: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export function usePushNotifications(): UsePushNotificationsResult {
    const [isSupported, setIsSupported] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<PushNotification[]>([]);

    // Check if push is supported
    useEffect(() => {
        const checkSupport = () => {
            const supported =
                typeof window !== 'undefined' &&
                'Notification' in window &&
                'serviceWorker' in navigator &&
                'PushManager' in window;

            setIsSupported(supported);

            if (supported && Notification.permission === 'granted') {
                setIsEnabled(true);
            }

            setIsLoading(false);
        };

        checkSupport();
    }, []);

    // Initialize Firebase
    useEffect(() => {
        if (!isSupported || !firebaseConfig.apiKey) return;

        try {
            if (getApps().length === 0) {
                firebaseApp = initializeApp(firebaseConfig);
            } else {
                firebaseApp = getApps()[0];
            }

            if (typeof window !== 'undefined') {
                messaging = getMessaging(firebaseApp);

                // Listen for foreground messages
                onMessage(messaging, (payload) => {
                    console.log('[usePushNotifications] Foreground message:', payload);

                    const notification: PushNotification = {
                        id: `notif-${Date.now()}`,
                        title: payload.notification?.title || 'New Notification',
                        body: payload.notification?.body || '',
                        data: payload.data as Record<string, string>,
                        timestamp: new Date(),
                    };

                    setNotifications(prev => [notification, ...prev]);

                    // Show browser notification if document is hidden
                    if (document.hidden && Notification.permission === 'granted') {
                        new Notification(notification.title, {
                            body: notification.body,
                            icon: '/icons/icon-192.png',
                        });
                    }
                });
            }
        } catch (err) {
            console.error('[usePushNotifications] Firebase init error:', err);
            // setError('Failed to initialize notifications'); // Avoid synchronous setState in effect
        }
    }, [isSupported]);

    // Get existing token if permission already granted
    useEffect(() => {
        if (!isSupported || !messaging || Notification.permission !== 'granted') return;

        const getExistingToken = async () => {
            try {
                const currentToken = await getToken(messaging!, { vapidKey });
                if (currentToken) {
                    setToken(currentToken);
                    setIsEnabled(true);
                }
            } catch (err) {
                console.error('[usePushNotifications] Error getting token:', err);
            }
        };

        getExistingToken();
    }, [isSupported]);

    // Request permission and get token
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!isSupported || !messaging) {
            setError('Push notifications not supported');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Request notification permission
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                setError('Notification permission denied');
                setIsLoading(false);
                return false;
            }

            // Register service worker
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            await navigator.serviceWorker.ready;

            // Get FCM token
            const currentToken = await getToken(messaging, {
                vapidKey,
                serviceWorkerRegistration: registration,
            });

            if (currentToken) {
                setToken(currentToken);
                setIsEnabled(true);

                // Send token to backend
                await registerTokenWithBackend(currentToken);

                setIsLoading(false);
                return true;
            } else {
                setError('Failed to get notification token');
                setIsLoading(false);
                return false;
            }
        } catch (err: unknown) {
            console.error('[usePushNotifications] Error:', err);
            setError((err as Error).message || 'Failed to enable notifications');
            setIsLoading(false);
            return false;
        }
    }, [isSupported]);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async (): Promise<void> => {
        if (token) {
            try {
                await unregisterTokenWithBackend(token);
                setToken(null);
                setIsEnabled(false);
            } catch (err) {
                console.error('[usePushNotifications] Error unsubscribing:', err);
            }
        }
    }, [token]);

    // Clear notifications
    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    return {
        isSupported,
        isEnabled,
        isLoading,
        error,
        token,
        notifications,
        requestPermission,
        unsubscribe,
        clearNotifications,
    };
}

// Register token with backend
async function registerTokenWithBackend(token: string): Promise<void> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    try {
        await fetch(`${apiUrl}/api/v1/push/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add auth headers in production
            },
            body: JSON.stringify({
                token,
                platform: 'web',
                device_name: navigator.userAgent.substring(0, 100),
            }),
        });
    } catch (err) {
        console.error('[usePushNotifications] Failed to register token:', err);
    }
}

// Unregister token with backend
async function unregisterTokenWithBackend(token: string): Promise<void> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    try {
        await fetch(`${apiUrl}/api/v1/push/unregister`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });
    } catch (err) {
        console.error('[usePushNotifications] Failed to unregister token:', err);
    }
}

// Listen for notification clicks from service worker
if (typeof window !== 'undefined') {
    navigator.serviceWorker?.addEventListener('message', (event) => {
        if (event.data?.type === 'NOTIFICATION_CLICK') {
            const { targetUrl } = event.data;
            if (targetUrl && targetUrl !== '/') {
                window.location.href = targetUrl;
            }
        }
    });
}
