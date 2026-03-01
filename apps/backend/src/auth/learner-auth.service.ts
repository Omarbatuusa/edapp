import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { RoleAssignment, UserRole } from '../users/role-assignment.entity';
import { Tenant, TenantStatus } from '../tenants/tenant.entity';
import { SessionTokenService } from './session-token.service';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

@Injectable()
export class LearnerAuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
        @InjectRepository(RoleAssignment)
        private roleAssignmentRepository: Repository<RoleAssignment>,
        private sessionTokenService: SessionTokenService,
    ) {}

    async validateLearner(
        studentNumber: string,
        pin: string,
        tenantSlug: string,
    ): Promise<{ sessionToken: string; userId: string; role: string; displayName: string }> {
        // 1. Find tenant by slug, reject if inactive
        const tenant = await this.tenantRepository.findOne({
            where: { tenant_slug: tenantSlug },
        });

        if (!tenant || tenant.status !== TenantStatus.ACTIVE) {
            throw new UnauthorizedException('Invalid or inactive school');
        }

        // 2. Find user by student_number with a role_assignments join where role = 'learner' and tenant matches
        const roleAssignment = await this.roleAssignmentRepository.findOne({
            where: {
                role: UserRole.LEARNER,
                tenant_id: tenant.id,
                is_active: true,
            },
            relations: ['user'],
        });

        // We need to find the user by student_number AND verify they have a learner role for this tenant
        const user = await this.userRepository.findOne({
            where: { student_number: studentNumber },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid student number or PIN');
        }

        // Verify this user has a learner role assignment for this tenant
        const assignment = await this.roleAssignmentRepository.findOne({
            where: {
                user_id: user.id,
                tenant_id: tenant.id,
                role: UserRole.LEARNER,
                is_active: true,
            },
        });

        if (!assignment) {
            throw new UnauthorizedException('Invalid student number or PIN');
        }

        // 3. Check locked_until — reject if still locked
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            const remainingMs = new Date(user.locked_until).getTime() - Date.now();
            const remainingMin = Math.ceil(remainingMs / 60000);
            throw new UnauthorizedException(
                `Account locked. Try again in ${remainingMin} minute${remainingMin !== 1 ? 's' : ''}.`,
            );
        }

        // 4. Verify PIN via bcrypt
        if (!user.pin_hash) {
            throw new UnauthorizedException('PIN not set. Please contact your school administrator.');
        }

        const pinValid = await bcrypt.compare(pin, user.pin_hash);

        if (!pinValid) {
            // 5. On fail: increment login_attempts, lock if >= MAX_ATTEMPTS
            const newAttempts = (user.login_attempts || 0) + 1;
            const updates: Partial<User> = { login_attempts: newAttempts };

            if (newAttempts >= MAX_ATTEMPTS) {
                updates.locked_until = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
            }

            await this.userRepository.update(user.id, updates);

            const remaining = MAX_ATTEMPTS - newAttempts;
            if (remaining > 0) {
                throw new UnauthorizedException(
                    `Invalid student number or PIN. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
                );
            } else {
                throw new UnauthorizedException(
                    `Account locked for ${LOCKOUT_MINUTES} minutes due to too many failed attempts.`,
                );
            }
        }

        // 6. On success: reset login_attempts, set last_login_at, return user data
        await this.userRepository.update(user.id, {
            login_attempts: 0,
            locked_until: null,
            last_login_at: new Date(),
        });

        // Generate session JWT
        const sessionToken = this.sessionTokenService.sign({
            sub: user.id,
            role: 'learner',
            tenant: tenantSlug,
        });

        return {
            sessionToken,
            userId: user.id,
            role: 'learner',
            displayName: user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Learner',
        };
    }
}
