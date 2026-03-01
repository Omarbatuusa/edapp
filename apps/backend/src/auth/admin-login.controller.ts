import { Controller, Post, Body, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AuthService } from './auth.service';
import { SessionTokenService } from './session-token.service';
import { User } from '../users/user.entity';
import { RoleAssignment, UserRole } from '../users/role-assignment.entity';

/** Roles allowed to log in via admin.edapp.co.za */
const ADMIN_ROLES: string[] = [
    UserRole.PLATFORM_SUPER_ADMIN,
    UserRole.BRAND_ADMIN,
    UserRole.PLATFORM_SECRETARY,
    UserRole.PLATFORM_SUPPORT,
    UserRole.TENANT_ADMIN,
    UserRole.MAIN_BRANCH_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.ADMISSIONS_OFFICER,
    UserRole.FINANCE_OFFICER,
    UserRole.HR_ADMIN,
    UserRole.IT_ADMIN,
    UserRole.PRINCIPAL,
    UserRole.DEPUTY_PRINCIPAL,
    UserRole.SMT,
    UserRole.HOD,
    UserRole.RECEPTION,
];

/** Priority order — first match wins */
const ROLE_PRIORITY: string[] = [
    UserRole.PLATFORM_SUPER_ADMIN,
    UserRole.BRAND_ADMIN,
    UserRole.PLATFORM_SECRETARY,
    UserRole.PLATFORM_SUPPORT,
    UserRole.TENANT_ADMIN,
    UserRole.MAIN_BRANCH_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.ADMISSIONS_OFFICER,
    UserRole.PRINCIPAL,
    UserRole.DEPUTY_PRINCIPAL,
    UserRole.SMT,
    UserRole.HOD,
    UserRole.FINANCE_OFFICER,
    UserRole.HR_ADMIN,
    UserRole.IT_ADMIN,
    UserRole.RECEPTION,
];

@Controller('auth')
export class AdminLoginController {
    constructor(
        private readonly authService: AuthService,
        private readonly sessionTokenService: SessionTokenService,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(RoleAssignment) private readonly roleRepo: Repository<RoleAssignment>,
    ) { }

    /**
     * Admin login: Firebase ID token → session JWT + role info
     *
     * Called by the admin.edapp.co.za login page after Firebase auth.
     * Resolves the user, finds their highest-priority admin role,
     * and returns a long-lived session JWT.
     */
    @Post('admin-login')
    async adminLogin(
        @Body('token') token: string,
    ) {
        if (!token) {
            throw new UnauthorizedException('Token is required');
        }

        // 1. Verify Firebase ID token
        const decoded = await this.authService.verifyToken(token);

        // 2. Find user by firebase_uid or email
        let user = await this.userRepo.findOne({ where: { firebase_uid: decoded.uid } });
        if (!user && decoded.email) {
            user = await this.userRepo.findOne({ where: { email: decoded.email } });
            if (user && !user.firebase_uid) {
                await this.userRepo.update(user.id, { firebase_uid: decoded.uid });
            }
        }

        if (!user) {
            throw new UnauthorizedException('No account found. Contact your administrator.');
        }

        // 3. Get active admin role assignments
        const assignments = await this.roleRepo.find({
            where: {
                user_id: user.id,
                is_active: true,
                role: In(ADMIN_ROLES as UserRole[]),
            },
            relations: ['tenant'],
            order: { created_at: 'DESC' },
        });

        if (assignments.length === 0) {
            throw new ForbiddenException('No admin role assigned. Contact your administrator.');
        }

        // 4. Pick highest-priority role
        let bestAssignment = assignments[0];
        let bestPriority = ROLE_PRIORITY.length;

        for (const a of assignments) {
            const idx = ROLE_PRIORITY.indexOf(a.role);
            if (idx !== -1 && idx < bestPriority) {
                bestPriority = idx;
                bestAssignment = a;
            }
        }

        const role = bestAssignment.role;
        const tenantSlug = bestAssignment.tenant?.tenant_slug || 'edapp';

        // 5. Create long-lived session JWT (24h)
        const sessionToken = this.sessionTokenService.sign(
            { sub: user.id, role, tenant: tenantSlug },
            '24h',
        );

        // 6. Return session data
        return {
            sessionToken,
            userId: user.id,
            role,
            tenantSlug,
            displayName: user.display_name || user.first_name || decoded.email || '',
            email: user.email || decoded.email || '',
            allRoles: assignments.map(a => ({
                role: a.role,
                tenantSlug: a.tenant?.tenant_slug || null,
                branchId: a.branch_id || null,
            })),
        };
    }
}
