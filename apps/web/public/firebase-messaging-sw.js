// Firebase Messaging Service Worker
// This file must be at /public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase (these values should match your Firebase config)
firebase.initializeApp({
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'New Message';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: payload.notification?.icon || '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        tag: payload.data?.thread_id || 'default',
        data: payload.data,
        actions: getNotificationActions(payload.data?.type),
        vibrate: [200, 100, 200],
        requireInteraction: payload.data?.type === 'urgent',
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Get actions based on notification type
function getNotificationActions(type) {
    switch (type) {
        case 'message':
            return [
                { action: 'reply', title: 'Reply', icon: '/icons/reply.png' },
                { action: 'dismiss', title: 'Dismiss', icon: '/icons/dismiss.png' },
            ];
        case 'announcement':
            return [
                { action: 'acknowledge', title: 'Acknowledge', icon: '/icons/check.png' },
                { action: 'view', title: 'View', icon: '/icons/view.png' },
            ];
        case 'payment':
            return [
                { action: 'pay', title: 'Pay Now', icon: '/icons/payment.png' },
                { action: 'later', title: 'Later', icon: '/icons/later.png' },
            ];
        default:
            return [];
    }
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click:', event.action);

    event.notification.close();

    const data = event.notification.data || {};
    let targetUrl = '/';

    // Determine target URL based on action and data
    if (event.action === 'reply' && data.thread_id) {
        targetUrl = `/chat/thread/${data.thread_id}`;
    } else if (event.action === 'pay' && data.payment_id) {
        targetUrl = `/pay/${data.payment_id}`;
    } else if (event.action === 'view' || event.action === 'acknowledge') {
        targetUrl = data.click_action || '/';
    } else if (data.click_action) {
        targetUrl = data.click_action;
    }

    // Focus existing window or open new one
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    client.postMessage({
                        type: 'NOTIFICATION_CLICK',
                        action: event.action,
                        data: data,
                        targetUrl: targetUrl,
                    });
                    return;
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
    console.log('[firebase-messaging-sw.js] Push subscription changed');

    event.waitUntil(
        self.registration.pushManager.subscribe({ userVisibleOnly: true })
            .then((subscription) => {
                // Send new subscription to server
                return fetch('/api/v1/push/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token: subscription.toJSON(),
                        platform: 'web',
                    }),
                });
            })
    );
});
