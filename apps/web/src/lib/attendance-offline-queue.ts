'use client';

// ============================================================
// ATTENDANCE OFFLINE QUEUE - IndexedDB-backed queue for events
// ============================================================

const DB_NAME = 'edapp_attendance';
const DB_VERSION = 1;
const STORE_NAME = 'pending_events';

export interface PendingAttendanceEvent {
    idempotency_key: string;
    tenant_id: string;
    branch_id: string;
    subject_type: 'LEARNER' | 'STAFF';
    subject_user_id: string;
    event_type: 'CHECK_IN' | 'CHECK_OUT' | 'REGISTER_MARK';
    source: 'KIOSK_SCAN' | 'PWA_GEO' | 'ADMIN_OVERRIDE' | 'TEACHER_REGISTER';
    captured_at_device: string;
    device_id?: string;
    actor_user_id?: string;
    captured_lat?: number;
    captured_lng?: number;
    captured_accuracy_m?: number;
    metadata?: Record<string, any>;
    retries: number;
    qr_token?: string; // For kiosk scans
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
            reject(new Error('IndexedDB not available'));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'idempotency_key' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export const attendanceQueue = {
    async enqueue(event: Omit<PendingAttendanceEvent, 'retries'>): Promise<void> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).put({ ...event, retries: 0 });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async dequeue(idempotency_key: string): Promise<void> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).delete(idempotency_key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async getAll(): Promise<PendingAttendanceEvent[]> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const request = tx.objectStore(STORE_NAME).getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async count(): Promise<number> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const request = tx.objectStore(STORE_NAME).count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async incrementRetry(idempotency_key: string): Promise<void> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const getReq = store.get(idempotency_key);
            getReq.onsuccess = () => {
                if (getReq.result) {
                    store.put({ ...getReq.result, retries: getReq.result.retries + 1 });
                }
            };
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async clear(): Promise<void> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).clear();
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },
};

export function generateIdempotencyKey(): string {
    return crypto.randomUUID();
}
