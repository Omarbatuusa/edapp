import { Controller, Post, Body, Req, UnauthorizedException } from '@nestjs/common';
import { EnhancedAuthService } from './enhanced-auth.service';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: EnhancedAuthService) { }

    @Post('login')
    async login(
        @Body('token') token: string,
        @Body('tenantSlug') tenantSlug: string,
        @Req() req: Request,
    ) {
        if (!token || !tenantSlug) {
            throw new UnauthorizedException('Token and tenant slug are required');
        }

        const user = await this.authService.verifyTokenWithTenant(token, tenantSlug);

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                tenantId: user.tenantId,
            },
        };
    }

    @Post('learner/login')
    async learnerLogin(
        @Body('studentNumber') studentNumber: string,
        @Body('pin') pin: string,
        @Body('tenantSlug') tenantSlug: string,
        @Req() req: Request,
    ) {
        if (!studentNumber || !pin || !tenantSlug) {
            throw new UnauthorizedException('Student number, PIN, and tenant slug are required');
        }

        const ipAddress = req.ip || req.socket.remoteAddress;
        const result = await this.authService.validateStudentPin(
            studentNumber,
            pin,
            tenantSlug,
            ipAddress,
        );

        if (!result.success) {
            if (result.lockedUntil) {
                return {
                    success: false,
                    locked: true,
                    lockedUntil: result.lockedUntil,
                    message: 'Account temporarily locked due to too many failed attempts',
                };
            }

            return {
                success: false,
                attemptsRemaining: result.attemptsRemaining,
                message: `Invalid PIN. ${result.attemptsRemaining} attempts remaining.`,
            };
        }

        return {
            success: true,
            customToken: result.customToken,
            message: 'Login successful',
        };
    }
}
