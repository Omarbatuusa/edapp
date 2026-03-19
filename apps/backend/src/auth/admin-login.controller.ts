import { Controller, Post, Body, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';
import { AuthService } from './auth.service';
import { SessionTokenService } from './session-token.service';
import { EmailAuthService } from './email-auth.service';
import { User } from '../users/user.entity';
import { RoleAssignment, UserRole } from '../users/role-assignment.entity';
import { TenantMembership } from './entities/tenant-membership.entity';

/** Roles allowed to log in via admin.edapp.co.za */
const ADMIN_ROLES: string[] = [
    UserRole.PLATFORM_SUPER_ADMIN,
    UserRole.APP_SUPER_ADMIN,
    UserRole.BRAND_ADMIN,
    UserRole.PLATFORM_SECRETARY,
    UserRole.APP_SECRETARY,
    UserRole.PLATFORM_SUPPORT,
    UserRole.APP_SUPPORT,
    UserRole.TENANT_ADMIN,
    UserRole.TENANT_BRAND_ADMIN,
    UserRole.MAIN_BRANCH_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.BRANCH_OPERATIONS_ADMIN,
    UserRole.ADMISSIONS_OFFICER,
    UserRole.FINANCE_OFFICER,
    UserRole.HR_ADMIN,
    UserRole.IT_ADMIN,
    UserRole.PRINCIPAL,
    UserRole.DEPUTY_PRINCIPAL,
    UserRole.SMT,
    UserRole.HOD,
    UserRole.RECEPTION,
    UserRole.SCHOOL_OPERATIONS_MANAGER,
    UserRole.SCHOOL_ADMINISTRATOR,
];

/** Priority order — first match wins */
const ROLE_PRIORITY: string[] = [
    UserRole.PLATFORM_SUPER_ADMIN,
    UserRole.APP_SUPER_ADMIN,
    UserRole.BRAND_ADMIN,
    UserRole.PLATFORM_SECRETARY,
    UserRole.APP_SECRETARY,
    UserRole.PLATFORM_SUPPORT,
    UserRole.APP_SUPPORT,
    UserRole.TENANT_ADMIN,
    UserRole.TENANT_BRAND_ADMIN,
    UserRole.MAIN_BRANCH_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.BRANCH_OPERATIONS_ADMIN,
    UserRole.ADMISSIONS_OFFICER,
    UserRole.PRINCIPAL,
    UserRole.DEPUTY_PRINCIPAL,
    UserRole.SCHOOL_OPERATIONS_MANAGER,
    UserRole.SCHOOL_ADMINISTRATOR,
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
        private readonly emailAuthService: EmailAuthService,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(RoleAssignment) private readonly roleRepo: Repository<RoleAssignment>,
        @InjectRepository(TenantMembership) private readonly membershipRepo: Repository<TenantMembership>,
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
        @Body() body: { token: string; rememberDevice?: boolean; rememberDuration?: number },
    ) {
        const { token, rememberDevice, rememberDuration } = body;
        if (!token) {
            throw new UnauthorizedException('Token is required');
        }

        // 1. Verify Firebase ID token
        const decoded = await this.authService.verifyToken(token);

        // 2. Find user by firebase_uid or email
        let user = await this.userRepo.findOne({ where: { firebase_uid: decoded.uid } });
        if (!user && decoded.email) {
            user = await this.userRepo.findOne({ where: { email: ILike(decoded.email) } });
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
        // For platform roles (no tenant_id), fall back to first tenant from other assignments
        let tenantSlug = bestAssignment.tenant?.tenant_slug || null;
        if (!tenantSlug) {
            const fallback = assignments.find(a => a.tenant?.tenant_slug);
            tenantSlug = fallback?.tenant?.tenant_slug || 'allied';
        }

        // 5. Activate INVITED memberships on login (transition to ACTIVE)
        const tenantIds = [...new Set(assignments.filter(a => a.tenant_id).map(a => a.tenant_id))];
        if (tenantIds.length > 0) {
            await this.membershipRepo.update(
                { user_id: user.id, status: 'invited' as any },
                { status: 'active' as any, joined_at: new Date() },
            );
        }

        // Update last_login_at
        await this.userRepo.update(user.id, { last_login_at: new Date() });

        // 6. Create session JWT (24h default, or longer for remember-device)
        const expiresIn = rememberDevice && rememberDuration
            ? `${rememberDuration}d`
            : '24h';
        const sessionToken = this.sessionTokenService.sign(
            { sub: user.id, role, tenant: tenantSlug },
            expiresIn,
        );

        // 6. Deduplicate roles — platform admins manage many tenants,
        //    so show each role only once (keep first/best tenant match)
        const seenRoles = new Set<string>();
        const uniqueRoles = assignments.filter(a => {
            if (seenRoles.has(a.role)) return false;
            seenRoles.add(a.role);
            return true;
        });

        // 7. Return session data
        return {
            sessionToken,
            userId: user.id,
            role,
            tenantSlug,
            displayName: user.display_name || user.first_name || decoded.email || '',
            email: user.email || decoded.email || '',
            allRoles: uniqueRoles.map(a => ({
                role: a.role,
                tenantSlug: a.tenant?.tenant_slug || null,
                branchId: a.branch_id || null,
            })),
        };
    }

    /**
     * Email OTP login: send OTP → verify OTP → session JWT
     * POST /auth/otp-login — Verify OTP and create session
     */
    @Post('otp-login')
    async otpLogin(
        @Body() body: { email: string; otpKey: string; code: string; rememberDevice?: boolean; rememberDuration?: number },
    ) {
        const { email, otpKey, code, rememberDevice, rememberDuration } = body;
        if (!email || !otpKey || !code) {
            throw new BadRequestException('email, otpKey, and code are required');
        }

        // 1. Verify OTP
        const verified = await this.emailAuthService.verifyOTP(otpKey, code, email);
        if (!verified) {
            throw new UnauthorizedException('Invalid or expired code');
        }

        // 2. Find user by email (case-insensitive)
        const user = await this.userRepo.findOne({ where: { email: ILike(email) } });
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
        let tenantSlug = bestAssignment.tenant?.tenant_slug || null;
        if (!tenantSlug) {
            const fallback = assignments.find(a => a.tenant?.tenant_slug);
            tenantSlug = fallback?.tenant?.tenant_slug || 'allied';
        }

        // 5. Activate INVITED memberships
        await this.membershipRepo.update(
            { user_id: user.id, status: 'invited' as any },
            { status: 'active' as any, joined_at: new Date() },
        );

        await this.userRepo.update(user.id, { last_login_at: new Date() });

        // 6. Create session JWT
        const expiresIn = rememberDevice && rememberDuration ? `${rememberDuration}d` : '24h';
        const sessionToken = this.sessionTokenService.sign(
            { sub: user.id, role, tenant: tenantSlug },
            expiresIn,
        );

        const seenRoles = new Set<string>();
        const uniqueRoles = assignments.filter(a => {
            if (seenRoles.has(a.role)) return false;
            seenRoles.add(a.role);
            return true;
        });

        return {
            sessionToken,
            userId: user.id,
            role,
            tenantSlug,
            displayName: user.display_name || user.first_name || email,
            email: user.email || email,
            allRoles: uniqueRoles.map(a => ({
                role: a.role,
                tenantSlug: a.tenant?.tenant_slug || null,
                branchId: a.branch_id || null,
            })),
        };
    }
}
