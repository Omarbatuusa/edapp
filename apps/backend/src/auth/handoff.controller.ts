import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HandoffService } from './handoff.service';
import { AuthService } from './auth.service';
import { SessionTokenService } from './session-token.service';
import { User } from '../users/user.entity';
import { RoleAssignment } from '../users/role-assignment.entity';

@Controller('auth/handoff')
export class HandoffController {
    constructor(
        private readonly handoffService: HandoffService,
        private readonly authService: AuthService,
        private readonly sessionTokenService: SessionTokenService,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(RoleAssignment) private readonly roleRepo: Repository<RoleAssignment>,
    ) { }

    // Called by Broker to create a handoff code after successful auth
    @Post('create')
    async createHandoff(
        @Body() body: {
            sessionToken: string;
            userId: string;
            tenantSlug: string;
            role: string;
            rememberDevice?: boolean;
            rememberDuration?: number;
        },
    ) {
        if (!body.sessionToken || !body.tenantSlug || !body.role) {
            throw new BadRequestException('Missing required fields');
        }

        let userId = body.userId || `user-${Date.now()}`;
        let sessionToken = body.sessionToken;

        // If the incoming token is a Firebase ID token, convert to a long-lived session JWT
        try {
            const decoded = await this.authService.verifyToken(body.sessionToken);

            // Resolve Firebase UID → database user
            let dbUser = await this.userRepo.findOne({ where: { firebase_uid: decoded.uid } });
            if (!dbUser && decoded.email) {
                dbUser = await this.userRepo.findOne({ where: { email: decoded.email } });
                if (dbUser && !dbUser.firebase_uid) {
                    await this.userRepo.update(dbUser.id, { firebase_uid: decoded.uid });
                }
            }

            if (dbUser) {
                userId = dbUser.id;

                // Determine role from role_assignments if not explicitly provided
                let role = body.role;
                if (!role || role === 'admin' || role === 'staff') {
                    const assignment = await this.roleRepo.findOne({
                        where: { user_id: dbUser.id, is_active: true },
                        order: { created_at: 'DESC' } as any,
                    });
                    if (assignment) role = assignment.role;
                }

                // Create a long-lived session JWT (24h, or longer for remember-device)
                const expiresIn = body.rememberDevice
                    ? `${body.rememberDuration || 30}d`
                    : '24h';

                sessionToken = this.sessionTokenService.sign(
                    { sub: dbUser.id, role, tenant: body.tenantSlug },
                    expiresIn,
                );
            }
        } catch {
            // Not a Firebase token (e.g. learner session JWT) — pass through as-is
        }

        const code = await this.handoffService.createCode(
            sessionToken,
            userId,
            body.tenantSlug,
            body.role,
            body.rememberDevice,
            body.rememberDuration,
        );
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

        const result = await this.handoffService.exchangeCode(body.code, tenantSlug);
        return result;
    }
}
