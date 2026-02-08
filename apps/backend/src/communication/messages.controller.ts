import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import type { SendMessageDto } from './messages.service';

// ============================================================
// MESSAGES CONTROLLER - REST API for message management
// ============================================================

@Controller('api/v1/messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    // ============================================
    // GET THREAD MESSAGES (paginated)
    // ============================================
    @Get('thread/:thread_id')
    async getMessages(
        @Param('thread_id') thread_id: string,
        @Query('user_id') user_id: string,
        @Query('limit') limit?: string,
        @Query('before') before?: string,
    ) {
        return this.messagesService.getThreadMessages(thread_id, user_id, {
            limit: limit ? parseInt(limit, 10) : undefined,
            before,
        });
    }

    // ============================================
    // SEND MESSAGE
    // ============================================
    @Post()
    async sendMessage(@Body() dto: SendMessageDto) {
        return this.messagesService.sendMessage(dto);
    }

    // ============================================
    // EDIT MESSAGE
    // ============================================
    @Put(':id')
    async editMessage(
        @Param('id') id: string,
        @Body() body: { user_id: string; content: string },
    ) {
        return this.messagesService.editMessage(id, body.user_id, body.content);
    }

    // ============================================
    // DELETE MESSAGE
    // ============================================
    @Delete(':id')
    async deleteMessage(
        @Param('id') id: string,
        @Query('user_id') user_id: string,
    ) {
        await this.messagesService.deleteMessage(id, user_id);
        return { success: true };
    }

    // ============================================
    // MARK AS READ
    // ============================================
    @Post(':id/read')
    async markRead(
        @Param('id') id: string,
        @Body() body: { user_id: string },
    ) {
        await this.messagesService.markRead(id, body.user_id);
        return { success: true };
    }

    // ============================================
    // MARK ALL IN THREAD AS READ
    // ============================================
    @Post('thread/:thread_id/read-all')
    async markAllRead(
        @Param('thread_id') thread_id: string,
        @Body() body: { user_id: string },
    ) {
        await this.messagesService.markAllRead(thread_id, body.user_id);
        return { success: true };
    }

    // ============================================
    // GET UNREAD COUNT
    // ============================================
    @Get('unread-count')
    async getUnreadCount(
        @Query('user_id') user_id: string,
        @Query('tenant_id') tenant_id: string,
    ) {
        const count = await this.messagesService.getUnreadCount(user_id, tenant_id);
        return { unread_count: count };
    }

    // ============================================
    // ADD REACTION
    // ============================================
    @Post(':id/reactions')
    async addReaction(
        @Param('id') id: string,
        @Body() body: { user_id: string; emoji: string },
    ) {
        return this.messagesService.addReaction(id, body.user_id, body.emoji);
    }

    // ============================================
    // REMOVE REACTION
    // ============================================
    @Delete(':id/reactions/:emoji')
    async removeReaction(
        @Param('id') id: string,
        @Param('emoji') emoji: string,
        @Query('user_id') user_id: string,
    ) {
        return this.messagesService.removeReaction(id, user_id, emoji);
    }

    // ============================================
    // UPDATE ACTION STATUS
    // ============================================
    @Put(':id/action')
    async updateActionStatus(
        @Param('id') id: string,
        @Body() body: { user_id: string; status: 'approved' | 'rejected' | 'acknowledged' },
    ) {
        return this.messagesService.updateActionStatus(id, body.user_id, body.status);
    }
}
