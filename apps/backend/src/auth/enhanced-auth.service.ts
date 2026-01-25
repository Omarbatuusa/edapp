import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import { Tenant } from '../tenants/tenant.entity';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcryptjs';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class EnhancedAuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
        private auditService: AuditService,
    ) { }

    /**
     * Verify Firebase token with tenant isolation
     */
    async verifyTokenWithTenant(token: string, tenantSlug: string): Promise<User> {
        try {
            // Verify Firebase token
            const decodedToken = await admin.auth().verifyIdToken(token);

            // Get tenant
            const tenant = await this.tenantRepository.findOne({
                where: { slug: tenantSlug },
            });

            if (!tenant) {
                throw new UnauthorizedException('Invalid tenant');
            }

            // Find user by Firebase UID
            const user = await this.userRepository.findOne({
                where: { firebaseUid: decodedToken.uid },
                relations: ['tenant'],
            });

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            // Enforce tenant isolation (except for platform admins)
            if (user.role !== 'platform_admin' && user.tenantId !== tenant.id) {
                await this.auditService.log({
                    action: 'tenant_isolation_violation',
                    userId: user.id,
                    tenantId: tenant.id,
                    metadata: { attemptedTenant: tenantSlug, userTenant: user.tenant.slug },
                });
                throw new UnauthorizedException('Access denied: Tenant mismatch');
            }

            // Update last login
            user.lastLoginAt = new Date();
            user.loginAttempts = 0; // Reset on successful login
            await this.userRepository.save(user);

            return user;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    /**
     * Create custom Firebase token for learner PIN authentication
     */
    async createCustomToken(userId: string, tenantId: string): Promise<string> {
        const user = await this.userRepository.findOne({
            where: { id: userId, tenantId },
        });

        if (!user || !user.firebaseUid) {
            throw new UnauthorizedException('User not found');
        }

        // Create custom token with additional claims
        const customToken = await admin.auth().createCustomToken(user.firebaseUid, {
            tenantId: tenantId,
            role: user.role,
            studentNumber: user.studentNumber,
        });

        return customToken;
    }

    /**
     * Validate student PIN with progressive lockout
     */
    async validateStudentPin(
        studentNumber: string,
        pin: string,
        tenantSlug: string,
        ipAddress?: string,
    ): Promise<{ success: boolean; customToken?: string; lockedUntil?: Date; attemptsRemaining?: number }> {
        // Get tenant
        const tenant = await this.tenantRepository.findOne({
            where: { slug: tenantSlug },
        });

        if (!tenant) {
            throw new UnauthorizedException('Invalid tenant');
        }

        // Find user by student number and tenant
        const user = await this.userRepository.findOne({
            where: { studentNumber, tenantId: tenant.id, role: UserRole.LEARNER },
        });

        if (!user) {
            // Log failed attempt
            await this.auditService.log({
                action: 'learner_login_failure',
                tenantId: tenant.id,
                metadata: { studentNumber, reason: 'user_not_found' },
                ipAddress,
            });
            throw new UnauthorizedException('Invalid student number or PIN');
        }

        // Check if user is locked out
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const remainingSeconds = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000);
            await this.auditService.log({
                action: 'learner_login_locked',
                userId: user.id,
                tenantId: tenant.id,
                metadata: { studentNumber, remainingSeconds },
                ipAddress,
            });
            return {
                success: false,
                lockedUntil: user.lockedUntil,
            };
        }

        // Verify PIN
        const isPinValid = await bcrypt.compare(pin, user.pinHash);

        if (!isPinValid) {
            // Increment login attempts
            user.loginAttempts += 1;

            // Get rate limit config from tenant
            const maxAttempts = tenant.rateLimitConfig?.loginAttemptsBeforeLockout || 5;
            const lockoutMinutes = tenant.rateLimitConfig?.lockoutDurationMinutes || 15;

            // Progressive lockout
            if (user.loginAttempts >= maxAttempts) {
                user.lockedUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
                await this.userRepository.save(user);

                await this.auditService.log({
                    action: 'learner_account_locked',
                    userId: user.id,
                    tenantId: tenant.id,
                    metadata: { studentNumber, attempts: user.loginAttempts, lockoutMinutes },
                    ipAddress,
                });

                return {
                    success: false,
                    lockedUntil: user.lockedUntil,
                };
            }

            await this.userRepository.save(user);

            await this.auditService.log({
                action: 'learner_login_failure',
                userId: user.id,
                tenantId: tenant.id,
                metadata: { studentNumber, attempts: user.loginAttempts },
                ipAddress,
            });

            return {
                success: false,
                attemptsRemaining: maxAttempts - user.loginAttempts,
            };
        }

        // Successful login
        user.loginAttempts = 0;
        user.lastLoginAt = new Date();
        user.lockedUntil = undefined;
        await this.userRepository.save(user);

        // Create custom token
        const customToken = await this.createCustomToken(user.id, tenant.id);

        await this.auditService.log({
            action: 'learner_login_success',
            userId: user.id,
            tenantId: tenant.id,
            metadata: { studentNumber },
            ipAddress,
        });

        return {
            success: true,
            customToken,
        };
    }

    /**
     * Hash PIN for storage
     */
    async hashPin(pin: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(pin, saltRounds);
    }
}
