import { Controller, Get, Post, Body, Query, Headers, Ip, Req, BadRequestException } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { UserIntent } from './user-policy-acceptance.entity';

@Controller('v1/policies')
export class PoliciesController {
    constructor(private readonly policiesService: PoliciesService) { }

    @Get('public')
    async getPublicPolicies(@Query('tenantId') tenantId: string) {
        return this.policiesService.getActivePolicies(tenantId);
    }

    @Get('check-status')
    async checkStatus(
        @Query('userId') userId: string,
        @Query('tenantId') tenantId: string,
        @Query('intent') intent: string
    ) {
        if (!userId || !tenantId) return { accepted: false };

        const userIntent = intent === 'apply' ? UserIntent.APPLY : UserIntent.APP;
        const accepted = await this.policiesService.checkAcceptance(userId, tenantId, userIntent);

        return { accepted };
    }

    @Post('consent')
    async submitConsent(
        @Body() body: any,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string
    ) {
        const { userId, tenantId, intent, role, consents } = body;

        if (!userId || !tenantId || !consents) {
            throw new BadRequestException('Missing required fields');
        }

        const userIntent = intent === 'apply' ? UserIntent.APPLY : UserIntent.APP;

        return this.policiesService.recordAcceptance({
            userId,
            tenantId,
            intent: userIntent,
            role,
            ipAddress: ip,
            userAgent: userAgent || 'unknown',
            consents
        });
    }
}
