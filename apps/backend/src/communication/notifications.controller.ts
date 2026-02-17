import { Controller, Get, Post, Body, Param, Query, Patch, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationType, NotificationUrgency } from './notification.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

// ============================================================
// NOTIFICATIONS CONTROLLER - REST API for notifications
// All endpoints secured via FirebaseAuthGuard
// tenant_id from TenantsMiddleware, user_id from Firebase JWT
// ============================================================

@Controller('notifications')
@UseGuards(FirebaseAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    // ============================================
    // GET USER NOTIFICATIONS (paginated)
    // ============================================
    @Get()
    async getNotifications(
        @Req() req: any,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
        @Query('unread_only') unread_only?: string,
        @Query('type') type?: NotificationType,
        @Query('urgency') urgency?: NotificationUrgency,
    ) {
        return this.notificationsService.getUserNotifications(req.tenant_id, req.user.uid, {
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
    async getUnreadCount(@Req() req: any) {
        const count = await this.notificationsService.getUnreadCount(req.tenant_id, req.user.uid);
        return { unread_count: count };
    }

    // ============================================
    // MARK AS READ
    // ============================================
    @Patch(':id/read')
    async markAsRead(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.notificationsService.markAsRead(id, req.user.uid);
    }

    // ============================================
    // MARK ALL AS READ
    // ============================================
    @Post('read-all')
    async markAllAsRead(@Req() req: any) {
        await this.notificationsService.markAllAsRead(req.tenant_id, req.user.uid);
        return { success: true };
    }

    // ============================================
    // MARK AS ACTIONED
    // ============================================
    @Patch(':id/action')
    async markAsActioned(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.notificationsService.markAsActioned(id, req.user.uid);
    }
}
