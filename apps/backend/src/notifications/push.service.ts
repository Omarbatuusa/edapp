import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as admin from 'firebase-admin';
import { DeviceToken, DevicePlatform } from './device-token.entity';
import { Notification } from '../communication/notification.entity';

// ============================================================
// PUSH NOTIFICATION SERVICE - Firebase Cloud Messaging
// ============================================================

export interface PushPayload {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    data?: Record<string, string>;
    click_action?: string;
    badge_count?: number;
}

export interface SendOptions {
    priority?: 'high' | 'normal';
    ttl?: number; // Time to live in seconds
    collapse_key?: string;
}

@Injectable()
export class PushService implements OnModuleInit {
    private readonly logger = new Logger(PushService.name);
    private isInitialized = false;

    constructor(
        @InjectRepository(DeviceToken)
        private tokenRepo: Repository<DeviceToken>,
    ) { }

    onModuleInit() {
        this.initializeFirebase();
    }

    // Initialize Firebase Admin SDK
    private initializeFirebase() {
        try {
            // Check if already initialized
            if (admin.apps.length > 0) {
                this.isInitialized = true;
                return;
            }

            // Initialize with service account or application default credentials
            const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

            if (serviceAccount) {
                // Parse JSON service account from environment variable
                const credentials = JSON.parse(serviceAccount);
                admin.initializeApp({
                    credential: admin.credential.cert(credentials),
                });
            } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                // Use application default credentials (for GCP environments)
                admin.initializeApp({
                    credential: admin.credential.applicationDefault(),
                });
            } else {
                this.logger.warn('Firebase credentials not configured - push notifications disabled');
                return;
            }

            this.isInitialized = true;
            this.logger.log('Firebase Admin SDK initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize Firebase Admin SDK:', error);
        }
    }

    // ============================================
    // DEVICE TOKEN MANAGEMENT
    // ============================================

    async registerToken(
        user_id: string,
        tenant_id: string,
        token: string,
        platform: DevicePlatform = DevicePlatform.WEB,
        device_name?: string,
    ): Promise<DeviceToken> {
        // Check if token already exists
        const existing = await this.tokenRepo.findOne({
            where: { user_id, token },
        });

        if (existing) {
            // Update existing token
            existing.is_active = true;
            existing.last_used_at = new Date();
            existing.device_name = device_name || existing.device_name;
            return this.tokenRepo.save(existing);
        }

        // Create new token
        const deviceToken = this.tokenRepo.create({
            user_id,
            tenant_id,
            token,
            platform,
            device_name,
            is_active: true,
        });

        return this.tokenRepo.save(deviceToken);
    }

    async unregisterToken(token: string): Promise<void> {
        await this.tokenRepo.update({ token }, { is_active: false });
    }

    async getUserTokens(user_id: string): Promise<string[]> {
        const tokens = await this.tokenRepo.find({
            where: { user_id, is_active: true },
            select: ['token'],
        });
        return tokens.map(t => t.token);
    }

    async getMultipleUserTokens(user_ids: string[]): Promise<Map<string, string[]>> {
        const tokens = await this.tokenRepo.find({
            where: { user_id: In(user_ids), is_active: true },
            select: ['user_id', 'token'],
        });

        const tokenMap = new Map<string, string[]>();
        for (const t of tokens) {
            const existing = tokenMap.get(t.user_id) || [];
            existing.push(t.token);
            tokenMap.set(t.user_id, existing);
        }
        return tokenMap;
    }

    // ============================================
    // SEND NOTIFICATIONS
    // ============================================

    async sendToUser(
        user_id: string,
        payload: PushPayload,
        options?: SendOptions,
    ): Promise<{ success: number; failure: number }> {
        if (!this.isInitialized) {
            this.logger.warn('Firebase not initialized - skipping push');
            return { success: 0, failure: 0 };
        }

        const tokens = await this.getUserTokens(user_id);
        if (tokens.length === 0) {
            return { success: 0, failure: 0 };
        }

        return this.sendToTokens(tokens, payload, options);
    }

    async sendToUsers(
        user_ids: string[],
        payload: PushPayload,
        options?: SendOptions,
    ): Promise<{ success: number; failure: number }> {
        if (!this.isInitialized) {
            this.logger.warn('Firebase not initialized - skipping push');
            return { success: 0, failure: 0 };
        }

        const tokenMap = await this.getMultipleUserTokens(user_ids);
        const allTokens = Array.from(tokenMap.values()).flat();

        if (allTokens.length === 0) {
            return { success: 0, failure: 0 };
        }

        return this.sendToTokens(allTokens, payload, options);
    }

    async sendToTokens(
        tokens: string[],
        payload: PushPayload,
        options?: SendOptions,
    ): Promise<{ success: number; failure: number }> {
        if (!this.isInitialized || tokens.length === 0) {
            return { success: 0, failure: 0 };
        }

        try {
            const message: admin.messaging.MulticastMessage = {
                tokens,
                notification: {
                    title: payload.title,
                    body: payload.body,
                    imageUrl: payload.image,
                },
                data: payload.data,
                webpush: {
                    notification: {
                        icon: payload.icon || '/icons/icon-192.png',
                        badge: '/icons/badge-72.png',
                    },
                    fcmOptions: {
                        link: payload.click_action,
                    },
                },
                android: {
                    priority: options?.priority === 'high' ? 'high' : 'normal',
                    ttl: (options?.ttl || 86400) * 1000, // Convert to milliseconds
                    collapseKey: options?.collapse_key,
                    notification: {
                        icon: 'ic_notification',
                        color: '#3B82F6', // Primary blue
                        clickAction: payload.click_action,
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            badge: payload.badge_count,
                            sound: 'default',
                        },
                    },
                },
            };

            const response = await admin.messaging().sendEachForMulticast(message);

            // Handle failed tokens (remove invalid ones)
            if (response.failureCount > 0) {
                const failedTokens: string[] = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success && resp.error) {
                        const errorCode = resp.error.code;
                        // Remove tokens that are no longer valid
                        if (
                            errorCode === 'messaging/invalid-registration-token' ||
                            errorCode === 'messaging/registration-token-not-registered'
                        ) {
                            failedTokens.push(tokens[idx]);
                        }
                    }
                });

                if (failedTokens.length > 0) {
                    await this.tokenRepo.update(
                        { token: In(failedTokens) },
                        { is_active: false }
                    );
                    this.logger.log(`Deactivated ${failedTokens.length} invalid tokens`);
                }
            }

            this.logger.log(`Push sent: ${response.successCount} success, ${response.failureCount} failed`);
            return { success: response.successCount, failure: response.failureCount };

        } catch (error) {
            this.logger.error('Failed to send push notification:', error);
            return { success: 0, failure: tokens.length };
        }
    }

    // ============================================
    // TOPIC SUBSCRIPTIONS (for announcements)
    // ============================================

    async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
        if (!this.isInitialized || tokens.length === 0) return;

        try {
            await admin.messaging().subscribeToTopic(tokens, topic);
            this.logger.log(`Subscribed ${tokens.length} tokens to topic: ${topic}`);
        } catch (error) {
            this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
        }
    }

    async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
        if (!this.isInitialized || tokens.length === 0) return;

        try {
            await admin.messaging().unsubscribeFromTopic(tokens, topic);
            this.logger.log(`Unsubscribed ${tokens.length} tokens from topic: ${topic}`);
        } catch (error) {
            this.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
        }
    }

    async sendToTopic(
        topic: string,
        payload: PushPayload,
    ): Promise<string | null> {
        if (!this.isInitialized) return null;

        try {
            const message: admin.messaging.Message = {
                topic,
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                data: payload.data,
            };

            const messageId = await admin.messaging().send(message);
            this.logger.log(`Sent to topic ${topic}: ${messageId}`);
            return messageId;
        } catch (error) {
            this.logger.error(`Failed to send to topic ${topic}:`, error);
            return null;
        }
    }
}
