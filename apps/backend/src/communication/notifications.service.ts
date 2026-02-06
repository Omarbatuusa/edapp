import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Notification, NotificationType, NotificationUrgency } from './notification.entity';

// ============================================================
// NOTIFICATIONS SERVICE - Push notification management
// ============================================================

export interface CreateNotificationDto {
    tenant_id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    body?: string;
    icon_url?: string;
    urgency?: NotificationUrgency;
    action?: {
        type: 'navigate' | 'open_url' | 'deep_link';
        target: string;
        params?: Record<string, any>;
    };
    quick_actions?: {
        id: string;
        label: string;
        action_type: 'navigate' | 'api_call' | 'dismiss';
        action_target?: string;
        style?: 'primary' | 'secondary' | 'danger';
    }[];
    reference_type?: string;
    reference_id?: string;
    expires_at?: Date;
}

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepo: Repository<Notification>,
    ) { }

    // ============================================
    // CREATE NOTIFICATION
    // ============================================

    async create(dto: CreateNotificationDto): Promise<Notification> {
        const notification = this.notificationRepo.create({
            tenant_id: dto.tenant_id,
            user_id: dto.user_id,
            type: dto.type,
            title: dto.title,
            body: dto.body,
            icon_url: dto.icon_url,
            urgency: dto.urgency || NotificationUrgency.NORMAL,
            action: dto.action,
            quick_actions: dto.quick_actions || [],
            reference_type: dto.reference_type,
            reference_id: dto.reference_id,
            expires_at: dto.expires_at,
        });

        return this.notificationRepo.save(notification);
    }

    // ============================================
    // CREATE MESSAGE NOTIFICATION
    // ============================================

    async createMessageNotification(
        tenant_id: string,
        user_id: string,
        thread_id: string,
        sender_name: string,
        message_preview: string
    ): Promise<Notification> {
        return this.create({
            tenant_id,
            user_id,
            type: NotificationType.MESSAGE,
            title: sender_name,
            body: message_preview,
            action: {
                type: 'navigate',
                target: `/chat/thread/${thread_id}`,
            },
            reference_type: 'thread',
            reference_id: thread_id,
        });
    }

    // ============================================
    // GET USER NOTIFICATIONS (paginated)
    // ============================================

    async getUserNotifications(
        tenant_id: string,
        user_id: string,
        options: {
            limit?: number;
            offset?: number;
            unread_only?: boolean;
            type?: NotificationType;
            urgency?: NotificationUrgency;
        } = {}
    ): Promise<{ notifications: Notification[]; total: number }> {
        const limit = options.limit || 20;
        const offset = options.offset || 0;

        const query = this.notificationRepo.createQueryBuilder('notification')
            .where('notification.user_id = :user_id', { user_id })
            .andWhere('notification.tenant_id = :tenant_id', { tenant_id })
            .andWhere('(notification.expires_at IS NULL OR notification.expires_at > NOW())');

        if (options.unread_only) {
            query.andWhere('notification.is_read = false');
        }

        if (options.type) {
            query.andWhere('notification.type = :type', { type: options.type });
        }

        if (options.urgency) {
            query.andWhere('notification.urgency = :urgency', { urgency: options.urgency });
        }

        query.orderBy('notification.created_at', 'DESC')
            .skip(offset)
            .take(limit);

        const [notifications, total] = await query.getManyAndCount();

        return { notifications, total };
    }

    // ============================================
    // GET UNREAD COUNT
    // ============================================

    async getUnreadCount(tenant_id: string, user_id: string): Promise<number> {
        return this.notificationRepo.count({
            where: {
                tenant_id,
                user_id,
                is_read: false,
            },
        });
    }

    // ============================================
    // MARK AS READ
    // ============================================

    async markAsRead(notification_id: string, user_id: string): Promise<Notification> {
        const notification = await this.notificationRepo.findOne({
            where: { id: notification_id, user_id },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        notification.is_read = true;
        notification.read_at = new Date();

        return this.notificationRepo.save(notification);
    }

    // ============================================
    // MARK ALL AS READ
    // ============================================

    async markAllAsRead(tenant_id: string, user_id: string): Promise<void> {
        await this.notificationRepo.update(
            { tenant_id, user_id, is_read: false },
            { is_read: true, read_at: new Date() }
        );
    }

    // ============================================
    // MARK AS ACTIONED
    // ============================================

    async markAsActioned(notification_id: string, user_id: string): Promise<Notification> {
        const notification = await this.notificationRepo.findOne({
            where: { id: notification_id, user_id },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        notification.is_actioned = true;
        notification.actioned_at = new Date();
        notification.is_read = true;
        notification.read_at = notification.read_at || new Date();

        return this.notificationRepo.save(notification);
    }

    // ============================================
    // DELETE OLD NOTIFICATIONS (cleanup job)
    // ============================================

    async deleteOldNotifications(days: number = 30): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const result = await this.notificationRepo.delete({
            is_read: true,
            created_at: LessThan(cutoffDate),
        });

        return result.affected || 0;
    }

    // ============================================
    // SEND PUSH NOTIFICATION (placeholder for FCM)
    // ============================================

    async sendPush(notification: Notification, deviceTokens: string[]): Promise<void> {
        // TODO: Implement Firebase FCM integration
        // For now, just mark as sent
        notification.push_sent = true;
        notification.push_sent_at = new Date();
        await this.notificationRepo.save(notification);
    }
}
