import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { HandoffService } from './handoff.service';

@Controller('auth/handoff')
export class HandoffController {
    constructor(private readonly handoffService: HandoffService) { }

    // Called by Broker to create a handoff code after successful auth
    @Post('create')
    async createHandoff(@Body() body: { sessionToken: string; userId: string; tenantSlug: string; role: string }) {
        if (!body.sessionToken || !body.tenantSlug || !body.role) {
            throw new BadRequestException('Missing required fields');
        }
        // Generate mock userId if missing (for dev compatibility)
        const userId = body.userId || `user-${Date.now()}`;

        const code = this.handoffService.createCode(body.sessionToken, userId, body.tenantSlug, body.role);
        return { code };
    }

    // Called by Tenant to exchange code for session
    @Post('exchange')
    async exchangeHandoff(
        @Body() body: { code: string; tenantSlug?: string },
        @Headers('x-tenant-slug') tenantSlugHeader: string
    ) {
        if (!body.code) {
            throw new BadRequestException('Missing code');
        }

        // Body takes priority over header (nginx may strip custom headers)
        const tenantSlug = body.tenantSlug || tenantSlugHeader;

        if (!tenantSlug) {
            throw new BadRequestException('Missing tenant context');
        }

        const result = this.handoffService.exchangeCode(body.code, tenantSlug);
        return result; // { sessionToken, userId, role }
    }
}
