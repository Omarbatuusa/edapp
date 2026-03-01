import { Controller, Post, Body, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { EnhancedAuthService } from './enhanced-auth.service';
import { LearnerAuthService } from './learner-auth.service';
import { RateLimitGuard, RateLimit } from './rate-limit.guard';
import type { Request } from 'express';

/**
 * Auth Controller
 *
 * Handles authentication endpoints for the EdApp platform.
 * Uses Firebase Auth for token verification and session tokens for learner PIN login.
 */
@Controller('auth')
export class AuthController {
    constructor(
        private authService: EnhancedAuthService,
        private learnerAuthService: LearnerAuthService,
    ) { }

    /**
     * Verify Firebase token and return user info
     */
    @Post('login')
    async login(
        @Body('token') token: string,
        @Body('tenantSlug') tenantSlug: string,
        @Req() req: Request,
    ) {
        if (!token || !tenantSlug) {
            throw new UnauthorizedException('Token and tenant slug are required');
        }

        const result = await this.authService.verifyTokenWithTenant(token, tenantSlug);

        // Return user info using actual User entity properties (snake_case)
        return {
            success: true,
            tenant: {
                id: result.tenant.id,
                slug: result.tenant.tenant_slug,
                name: result.tenant.school_name,
            },
            user: result.user ? {
                id: result.user.id,
                email: result.user.email,
                display_name: result.user.display_name,
                first_name: result.user.first_name,
                last_name: result.user.last_name,
            } : null,
            firebaseUid: result.decodedToken.uid,
        };
    }

    /**
     * Learner PIN login
     *
     * Authenticates learners via student number + PIN.
     * Returns a session JWT (not Firebase) for non-Firebase auth flows.
     */
    @Post('learner/login')
    @UseGuards(RateLimitGuard)
    @RateLimit(5, 15)
    async learnerLogin(
        @Body('studentNumber') studentNumber: string,
        @Body('pin') pin: string,
        @Body('tenantSlug') tenantSlug: string,
    ) {
        if (!studentNumber || !pin || !tenantSlug) {
            throw new UnauthorizedException('Student number, PIN, and tenant slug are required');
        }

        return this.learnerAuthService.validateLearner(studentNumber, pin, tenantSlug);
    }
}
