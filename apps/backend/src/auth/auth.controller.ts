import { Controller, Post, Body, Req, UnauthorizedException, NotImplementedException } from '@nestjs/common';
import { EnhancedAuthService } from './enhanced-auth.service';
import type { Request } from 'express';

/**
 * Auth Controller
 * 
 * Handles authentication endpoints for the EdApp platform.
 * Uses Firebase Auth for token verification.
 */
@Controller('auth')
export class AuthController {
    constructor(private authService: EnhancedAuthService) { }

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
     * Learner PIN login - Stub Implementation
     * 
     * TODO: Full implementation requires:
     * 1. Adding tenant_id and role to User entity
     * 2. Implementing validateStudentPin in EnhancedAuthService
     */
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

        // Stub: Learner PIN login not fully implemented yet
        // This requires User entity to have tenant_id and role fields
        throw new NotImplementedException(
            'Learner PIN login is not yet available. Please use Firebase authentication.'
        );
    }
}
