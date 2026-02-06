import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationType, NotificationUrgency } from './notification.entity';

// ============================================================
// NOTIFICATIONS CONTROLLER - REST API for notifications
// ============================================================

@Controller('api/v1/notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    // ============================================
    // GET USER NOTIFICATIONS (paginated)
    // ============================================
    @Get()
    async getNotifications(
        @Query('tenant_id') tenant_id: string,
        @Query('user_id') user_id: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
        @Query('unread_only') unread_only?: string,
        @Query('type') type?: NotificationType,
        @Query('urgency') urgency?: NotificationUrgency,
    ) {
        return this.notificationsService.getUserNotifications(tenant_id, user_id, {
            limit: limit ? parseInt(limit, 10) : undefined,
            offset: offset ? parseInt(offset, 10) : undefined,
            unread_only: unread_only === 'true',
            type,
            urgency,
        });
    }

    // ============================================
    // GET UNREAD COUNT
    // ============================================
    @Get('unread-count')
    async getUnreadCount(
        @Query('tenant_id') tenant_id: string,
        @Query('user_id') user_id: string,
    ) {
        const count = await this.notificationsService.getUnreadCount(tenant_id, user_id);
        return { unread_count: count };
    }

    // ============================================
    // MARK AS READ
    // ============================================
    @Patch(':id/read')
    async markAsRead(
        @Param('id') id: string,
        @Body() body: { user_id: string },
    ) {
        return this.notificationsService.markAsRead(id, body.user_id);
    }

    // ============================================
    // MARK ALL AS READ
    // ============================================
    @Post('read-all')
    async markAllAsRead(
        @Body() body: { tenant_id: string; user_id: string },
    ) {
        await this.notificationsService.markAllAsRead(body.tenant_id, body.user_id);
        return { success: true };
    }

    // ============================================
    // MARK AS ACTIONED
    // ============================================
    @Patch(':id/action')
    async markAsActioned(
        @Param('id') id: string,
        @Body() body: { user_id: string },
    ) {
        return this.notificationsService.markAsActioned(id, body.user_id);
    }
}
