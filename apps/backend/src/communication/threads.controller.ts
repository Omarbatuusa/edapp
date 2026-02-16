import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import type { CreateThreadDto } from './threads.service';
import { ThreadType, TicketStatus, TicketCategory } from './thread.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

// ============================================================
// THREADS CONTROLLER - REST API for thread management
// All endpoints secured via FirebaseAuthGuard
// tenant_id from TenantsMiddleware, user_id from Firebase JWT
// ============================================================

@Controller('api/v1/threads')
@UseGuards(FirebaseAuthGuard)
export class ThreadsController {
    constructor(private readonly threadsService: ThreadsService) { }

    // ============================================
    // GET USER'S THREADS (Inbox)
    // ============================================
    @Get()
    async getThreads(
        @Req() req: any,
        @Query('type') type?: ThreadType,
        @Query('ticket_category') ticket_category?: TicketCategory,
        @Query('student_id') student_id?: string,
        @Query('unread_only') unread_only?: string,
        @Query('search') search?: string,
    ) {
        return this.threadsService.getUserThreads(req.tenant_id, req.user.uid, {
            type,
            ticket_category,
            student_id,
            unread_only: unread_only === 'true',
            search,
        });
    }

    // ============================================
    // GET FEED (Unified, cursor-paginated)
    // ============================================
    @Get('feed')
    async getFeed(
        @Req() req: any,
        @Query('type') type?: ThreadType,
        @Query('student_id') student_id?: string,
        @Query('cursor') cursor?: string,
        @Query('limit') limit?: string,
    ) {
        return this.threadsService.getFeed(req.tenant_id, req.user.uid, {
            type,
            student_id,
            cursor,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }

    // ============================================
    // GET ACTION REQUIRED (Aggregation)
    // ============================================
    @Get('action-required')
    async getActionRequired(@Req() req: any) {
        return this.threadsService.getActionRequired(req.tenant_id, req.user.uid);
    }

    // ============================================
    // SEARCH THREADS
    // ============================================
    @Get('search')
    async searchThreads(
        @Req() req: any,
        @Query('q') q: string,
    ) {
        return this.threadsService.searchThreads(req.tenant_id, req.user.uid, q || '');
    }

    // ============================================
    // ASSIGN TICKET TO STAFF
    // ============================================
    @Post(':id/assign')
    async assignTicket(
        @Param('id') thread_id: string,
        @Body() body: { staff_user_id: string },
        @Req() req: any,
    ) {
        return this.threadsService.assignTicket(thread_id, body.staff_user_id, req.user.uid);
    }

    // ============================================
    // GET SINGLE THREAD
    // ============================================
    @Get(':id')
    async getThread(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.threadsService.getThread(id, req.user.uid, req.tenant_id);
    }

    // ============================================
    // CREATE THREAD
    // ============================================
    @Post()
    async createThread(@Body() dto: CreateThreadDto, @Req() req: any) {
        // Inject tenant_id and created_by from auth context
        dto.tenant_id = req.tenant_id;
        dto.created_by = req.user.uid;
        return this.threadsService.createThread(dto);
    }

    // ============================================
    // GET THREAD MEMBERS
    // ============================================
    @Get(':id/members')
    async getMembers(@Param('id') id: string) {
        return this.threadsService.getThreadMembers(id);
    }

    // ============================================
    // ADD MEMBER
    // ============================================
    @Post(':id/members')
    async addMember(
        @Param('id') thread_id: string,
        @Body() body: { user_id: string; role?: string },
        @Req() req: any,
    ) {
        return this.threadsService.addMember(
            thread_id,
            body.user_id,
            req.user.uid,
            body.role as any,
        );
    }

    // ============================================
    // MARK THREAD AS READ
    // ============================================
    @Post(':id/read')
    async markAsRead(
        @Param('id') thread_id: string,
        @Body() body: { message_id?: string },
        @Req() req: any,
    ) {
        await this.threadsService.markAsRead(thread_id, req.user.uid, body.message_id);
        return { success: true };
    }

    // ============================================
    // UPDATE TICKET STATUS
    // ============================================
    @Patch(':id/status')
    async updateStatus(
        @Param('id') thread_id: string,
        @Body() body: { status: TicketStatus },
        @Req() req: any,
    ) {
        return this.threadsService.updateTicketStatus(thread_id, body.status, req.user.uid);
    }

    // ============================================
    // ACKNOWLEDGE ANNOUNCEMENT
    // ============================================
    @Post(':id/acknowledge')
    async acknowledge(
        @Param('id') thread_id: string,
        @Req() req: any,
    ) {
        return this.threadsService.acknowledgeAnnouncement(thread_id, req.user.uid);
    }

    // ============================================
    // FIND OR CREATE DM
    // ============================================
    @Post('dm')
    async findOrCreateDM(
        @Body() body: { user2_id: string },
        @Req() req: any,
    ) {
        return this.threadsService.findOrCreateDM(req.tenant_id, req.user.uid, body.user2_id);
    }

    // ============================================
    // FIND THREAD BY CONTEXT (Smart Routing)
    // ============================================
    @Post('find-context')
    async findByContext(
        @Body() body: {
            student_id?: string;
            ticket_category?: TicketCategory;
            type?: ThreadType;
        },
        @Req() req: any,
    ) {
        const thread = await this.threadsService.findThreadByContext(req.tenant_id, req.user.uid, {
            student_id: body.student_id,
            ticket_category: body.ticket_category,
            type: body.type,
        });
        return { thread };
    }
}
