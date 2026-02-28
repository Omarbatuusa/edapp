import { Controller, Post, Get, Patch, Body, Param, Query, Req } from '@nestjs/common';
import { EarlyLeaveService, CreateEarlyLeaveDto } from '../services/early-leave.service';
import { EarlyLeaveStatus } from '../entities/early-leave-request.entity';

@Controller('attendance/early-leave')
export class EarlyLeaveController {
    constructor(private earlyLeaveService: EarlyLeaveService) {}

    @Post()
    async createRequest(@Body() dto: CreateEarlyLeaveDto, @Req() req: any) {
        const tenant_id = req.tenant_id;
        const requested_by = req.user?.id || 'system';
        const request = await this.earlyLeaveService.createRequest(tenant_id, requested_by, dto);
        return { status: 'success', request };
    }

    @Patch(':id/approve')
    async approve(@Param('id') id: string, @Req() req: any) {
        const tenant_id = req.tenant_id;
        const approved_by = req.user?.id;
        const request = await this.earlyLeaveService.approveRequest(tenant_id, id, approved_by);
        return { status: 'success', request };
    }

    @Patch(':id/reject')
    async reject(@Param('id') id: string, @Body() body: { reason: string }, @Req() req: any) {
        const tenant_id = req.tenant_id;
        const rejected_by = req.user?.id;
        const request = await this.earlyLeaveService.rejectRequest(tenant_id, id, rejected_by, body.reason);
        return { status: 'success', request };
    }

    @Patch(':id/complete')
    async complete(@Param('id') id: string, @Body() body: { checkout_event_id: string }, @Req() req: any) {
        const tenant_id = req.tenant_id;
        const request = await this.earlyLeaveService.completePickup(tenant_id, id, body.checkout_event_id);
        return { status: 'success', request };
    }

    @Get()
    async list(
        @Req() req: any,
        @Query('branch_id') branch_id?: string,
        @Query('status') status?: EarlyLeaveStatus,
        @Query('date') date?: string,
    ) {
        const tenant_id = req.tenant_id;
        const requests = await this.earlyLeaveService.listRequests(tenant_id, branch_id, status, date);
        return { requests };
    }
}
