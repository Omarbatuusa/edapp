import { Controller, Post, Delete, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { PushService } from './push.service';
import { DevicePlatform } from './device-token.entity';

// ============================================================
// PUSH CONTROLLER - Device token registration endpoints
// ============================================================

interface RegisterTokenDto {
    token: string;
    platform?: DevicePlatform;
    device_name?: string;
}

interface UnregisterTokenDto {
    token: string;
}

@Controller('api/v1/push')
export class PushController {
    constructor(private pushService: PushService) { }

    @Post('register')
    @HttpCode(HttpStatus.OK)
    async registerToken(
        @Body() dto: RegisterTokenDto,
        @Headers('x-user-id') userId: string,
        @Headers('x-tenant-id') tenantId: string,
    ) {
        // In production, extract user_id and tenant_id from JWT
        const deviceToken = await this.pushService.registerToken(
            userId,
            tenantId,
            dto.token,
            dto.platform,
            dto.device_name,
        );

        return {
            success: true,
            device_id: deviceToken.id,
        };
    }

    @Delete('unregister')
    @HttpCode(HttpStatus.OK)
    async unregisterToken(@Body() dto: UnregisterTokenDto) {
        await this.pushService.unregisterToken(dto.token);
        return { success: true };
    }

    // Test endpoint (remove in production)
    @Post('test')
    @HttpCode(HttpStatus.OK)
    async testPush(
        @Headers('x-user-id') userId: string,
        @Body() body: { title: string; body: string },
    ) {
        const result = await this.pushService.sendToUser(userId, {
            title: body.title,
            body: body.body,
            data: { type: 'test' },
        });

        return {
            sent: result.success > 0,
            success_count: result.success,
            failure_count: result.failure,
        };
    }
}
