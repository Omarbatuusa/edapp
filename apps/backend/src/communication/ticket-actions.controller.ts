import { Controller, Get, Post, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { TicketActionsService, CreateTicketActionDto } from './ticket-actions.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

// ============================================================
// TICKET ACTIONS CONTROLLER - Ticket workflow action endpoints
// All endpoints secured via FirebaseAuthGuard
// ============================================================

@Controller('api/v1/ticket-actions')
@UseGuards(FirebaseAuthGuard)
export class TicketActionsController {
    constructor(private readonly ticketActionsService: TicketActionsService) { }

    // Get actions for a specific thread
    @Get('thread/:thread_id')
    async getThreadActions(@Param('thread_id') thread_id: string) {
        return this.ticketActionsService.getThreadActions(thread_id);
    }

    // Get all pending actions for current user
    @Get('pending')
    async getPendingActions(@Req() req: any) {
        return this.ticketActionsService.getPendingActions(req.tenant_id, req.user.uid);
    }

    // Create a ticket action
    @Post()
    async createAction(@Body() dto: CreateTicketActionDto) {
        return this.ticketActionsService.createAction(dto);
    }

    // Complete a ticket action
    @Patch(':id/complete')
    async completeAction(@Param('id') id: string, @Req() req: any) {
        return this.ticketActionsService.completeAction(id, req.user.uid);
    }
}
