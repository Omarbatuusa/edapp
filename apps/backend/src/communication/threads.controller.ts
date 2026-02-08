import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import type { CreateThreadDto } from './threads.service';
import { ThreadType, TicketStatus, TicketCategory } from './thread.entity';

// ============================================================
// THREADS CONTROLLER - REST API for thread management
// ============================================================

@Controller('api/v1/threads')
export class ThreadsController {
    constructor(private readonly threadsService: ThreadsService) { }

    // ============================================
    // GET USER'S THREADS (Inbox)
    // ============================================
    @Get()
    async getThreads(
        @Query('tenant_id') tenant_id: string,
        @Query('user_id') user_id: string,
        @Query('type') type?: ThreadType,
        @Query('ticket_category') ticket_category?: TicketCategory,
        @Query('student_id') student_id?: string,
        @Query('unread_only') unread_only?: string,
        @Query('search') search?: string,
    ) {
        return this.threadsService.getUserThreads(tenant_id, user_id, {
            type,
            ticket_category,
            student_id,
            unread_only: unread_only === 'true',
            search,
        });
    }

    // ============================================
    // GET SINGLE THREAD
    // ============================================
    @Get(':id')
    async getThread(
        @Param('id') id: string,
        @Query('tenant_id') tenant_id: string,
        @Query('user_id') user_id: string,
    ) {
        return this.threadsService.getThread(id, user_id, tenant_id);
    }

    // ============================================
    // CREATE THREAD
    // ============================================
    @Post()
    async createThread(@Body() dto: CreateThreadDto) {
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
        @Body() body: { user_id: string; added_by: string; role?: string },
    ) {
        return this.threadsService.addMember(
            thread_id,
            body.user_id,
            body.added_by,
            body.role as any,
        );
    }

    // ============================================
    // MARK THREAD AS READ
    // ============================================
    @Post(':id/read')
    async markAsRead(
        @Param('id') thread_id: string,
        @Body() body: { user_id: string; message_id?: string },
    ) {
        await this.threadsService.markAsRead(thread_id, body.user_id, body.message_id);
        return { success: true };
    }

    // ============================================
    // UPDATE TICKET STATUS
    // ============================================
    @Patch(':id/status')
    async updateStatus(
        @Param('id') thread_id: string,
        @Body() body: { status: TicketStatus; user_id: string },
    ) {
        return this.threadsService.updateTicketStatus(thread_id, body.status, body.user_id);
    }

    // ============================================
    // ACKNOWLEDGE ANNOUNCEMENT
    // ============================================
    @Post(':id/acknowledge')
    async acknowledge(
        @Param('id') thread_id: string,
        @Body() body: { user_id: string },
    ) {
        return this.threadsService.acknowledgeAnnouncement(thread_id, body.user_id);
    }

    // ============================================
    // FIND OR CREATE DM
    // ============================================
    @Post('dm')
    async findOrCreateDM(
        @Body() body: { tenant_id: string; user1_id: string; user2_id: string     // ============================================
    // FIND THREAD BY CONTEXT (Smart Routing)
    // ============================================
    @Post('find-context')
        async findByContext(
            @Body() body: {
                tenant_id: string;
                user_id: string;
                student_id ?: string;
                ticket_category ?: TicketCategory;
                type ?: ThreadType;
            },
    ) {
    const thread = await this.threadsService.findThreadByContext(body.tenant_id, body.user_id, {
        student_id: body.student_id,
        ticket_category: body.ticket_category,
        type: body.type,
    });
    return { thread }; // Returns null if not found, frontend handles redirection to Create
}
},
    ) {
    return this.threadsService.findOrCreateDM(body.tenant_id, body.user1_id, body.user2_id);
}
}
