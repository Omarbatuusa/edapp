import { Controller, Get, Post, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

// ============================================================
// ANNOUNCEMENTS CONTROLLER - Announcement-specific endpoints
// All endpoints secured via FirebaseAuthGuard
// ============================================================

@Controller('announcements')
@UseGuards(FirebaseAuthGuard)
export class AnnouncementsController {
    constructor(private readonly announcementsService: AnnouncementsService) { }

    // Mark announcement as read
    @Post(':id/read')
    async markRead(@Param('id') id: string, @Req() req: any) {
        return this.announcementsService.markRead(id, req.user.uid);
    }

    // Add reaction
    @Post(':id/react/:emoji')
    async addReaction(
        @Param('id') id: string,
        @Param('emoji') emoji: string,
        @Req() req: any,
    ) {
        return this.announcementsService.addReaction(id, req.user.uid, emoji);
    }

    // Remove reaction
    @Delete(':id/react/:emoji')
    async removeReaction(
        @Param('id') id: string,
        @Param('emoji') emoji: string,
        @Req() req: any,
    ) {
        await this.announcementsService.removeReaction(id, req.user.uid, emoji);
        return { success: true };
    }

    // Get announcement stats (for staff)
    @Get(':id/stats')
    async getStats(@Param('id') id: string) {
        return this.announcementsService.getStats(id);
    }

    // Get all reactions for an announcement
    @Get(':id/reactions')
    async getReactions(@Param('id') id: string) {
        return this.announcementsService.getReactions(id);
    }
}
