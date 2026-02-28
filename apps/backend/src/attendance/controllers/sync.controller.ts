import { Controller, Post, Get, Body, Req, Query } from '@nestjs/common';
import { SyncService } from '../services/sync.service';
import { SyncPushDto, SyncAckDto } from '../dto/record-event.dto';

@Controller('sync')
export class SyncController {
    constructor(private syncService: SyncService) {}

    @Post('push')
    async pushBatch(@Body() dto: SyncPushDto, @Req() req: any) {
        const tenant_id = req.tenant_id;

        // Inject tenant_id into each event if not set
        const events = dto.events.map(e => ({
            ...e,
            tenant_id: e.tenant_id || tenant_id,
        }));

        const results = await this.syncService.pushBatch(events);
        return { status: 'success', ...results };
    }

    @Get('pull')
    async pullPolicies(
        @Req() req: any,
        @Query('branch_id') branch_id: string,
    ) {
        const tenant_id = req.tenant_id;
        if (!tenant_id || !branch_id) {
            return { status: 'error', message: 'tenant_id and branch_id required' };
        }
        const data = await this.syncService.pullPolicies(tenant_id, branch_id);
        return { status: 'success', ...data };
    }

    @Post('ack')
    async ackSync(@Body() dto: SyncAckDto) {
        const result = await this.syncService.ackSync(dto.event_ids);
        return { status: 'success', ...result };
    }
}
