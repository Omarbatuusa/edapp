import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { HandoffService } from './handoff.service';

@Controller('v1/auth/handoff')
export class HandoffController {
    constructor(private readonly handoffService: HandoffService) { }

    // Called by Broker to create a handoff code after successful auth
    @Post('create')
    async createHandoff(@Body() body: { sessionToken: string; tenantSlug: string; role: string }) {
        if (!body.sessionToken || !body.tenantSlug || !body.role) {
            throw new BadRequestException('Missing required fields');
        }

        const code = this.handoffService.createCode(body.sessionToken, body.tenantSlug, body.role);
        return { code };
    }

    // Called by Tenant to exchange code for session
    @Post('exchange')
    async exchangeHandoff(
        @Body() body: { code: string },
        @Headers('x-tenant-slug') tenantSlug: string // From middleware
    ) {
        if (!body.code) {
            throw new BadRequestException('Missing code');
        }

        if (!tenantSlug) {
            throw new BadRequestException('Missing tenant context');
        }

        const sessionToken = this.handoffService.exchangeCode(body.code, tenantSlug);
        return { sessionToken };
    }
}
