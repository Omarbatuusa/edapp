import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import type { SendMessageDto } from './messages.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

// ============================================================
// MESSAGES CONTROLLER - REST API for message management
// All endpoints secured via FirebaseAuthGuard
// tenant_id from TenantsMiddleware, user_id from Firebase JWT
// ============================================================

@Controller('messages')
@UseGuards(FirebaseAuthGuard)
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    // ============================================
    // GET THREAD MESSAGES (paginated)
    // ============================================
    @Get('thread/:thread_id')
    async getMessages(
        @Param('thread_id') thread_id: string,
        @Req() req: any,
        @Query('limit') limit?: string,
        @Query('before') before?: string,
    ) {
        return this.messagesService.getThreadMessages(thread_id, req.user.uid, {
            limit: limit ? parseInt(limit, 10) : undefined,
            before,
        });
    }

    // ============================================
    // SEND MESSAGE
    // ============================================
    @Post()
    async sendMessage(@Body() dto: SendMessageDto, @Req() req: any) {
        // Inject tenant_id and sender_id from auth context
        dto.tenant_id = req.tenant_id;
        dto.sender_id = req.user.uid;
        return this.messagesService.sendMessage(dto);
    }

    // ============================================
    // EDIT MESSAGE
    // ============================================
    @Put(':id')
    async editMessage(
        @Param('id') id: string,
        @Body() body: { content: string },
        @Req() req: any,
    ) {
        return this.messagesService.editMessage(id, req.user.uid, body.content);
    }

    // ============================================
    // DELETE MESSAGE
    // ============================================
    @Delete(':id')
    async deleteMessage(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        await this.messagesService.deleteMessage(id, req.user.uid);
        return { success: true };
    }

    // ============================================
    // MARK AS READ
    // ============================================
    @Post(':id/read')
    async markRead(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        await this.messagesService.markRead(id, req.user.uid);
        return { success: true };
    }

    // ============================================
    // MARK ALL IN THREAD AS READ
    // ============================================
    @Post('thread/:thread_id/read-all')
    async markAllRead(
        @Param('thread_id') thread_id: string,
        @Req() req: any,
    ) {
        await this.messagesService.markAllRead(thread_id, req.user.uid);
        return { success: true };
    }

    // ============================================
    // GET UNREAD COUNT
    // ============================================
    @Get('unread-count')
    async getUnreadCount(@Req() req: any) {
        const count = await this.messagesService.getUnreadCount(req.user.uid, req.tenant_id);
        return { unread_count: count };
    }

    // ============================================
    // ADD REACTION
    // ============================================
    @Post(':id/reactions')
    async addReaction(
        @Param('id') id: string,
        @Body() body: { emoji: string },
        @Req() req: any,
    ) {
        return this.messagesService.addReaction(id, req.user.uid, body.emoji);
    }

    // ============================================
    // REMOVE REACTION
    // ============================================
    @Delete(':id/reactions/:emoji')
    async removeReaction(
        @Param('id') id: string,
        @Param('emoji') emoji: string,
        @Req() req: any,
    ) {
        return this.messagesService.removeReaction(id, req.user.uid, emoji);
    }

    // ============================================
    // UPDATE ACTION STATUS
    // ============================================
    @Put(':id/action')
    async updateActionStatus(
        @Param('id') id: string,
        @Body() body: { status: 'approved' | 'rejected' | 'acknowledged' },
        @Req() req: any,
    ) {
        return this.messagesService.updateActionStatus(id, req.user.uid, body.status);
    }
}
