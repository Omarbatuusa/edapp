import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Tenant, TenantStatus } from '../tenants/tenant.entity';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcryptjs';

/**
 * Enhanced Auth Service - Stub Implementation
 * 
 * TODO: Full implementation requires:
 * 1. Adding tenant_id foreign key to User entity
 * 2. Adding role column or role_assignments relation to User entity
 * 3. Adding tenant ManyToOne relation to User entity
 * 
 * For now, this provides basic Firebase token verification.
 */
@Injectable()
export class EnhancedAuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
    ) { }

    /**
     * Verify Firebase token (simplified - no tenant isolation for now)
     */
    async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
        try {
            return await admin.auth().verifyIdToken(token);
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    /**
     * Find user by Firebase UID
     */
    async findUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { firebase_uid: firebaseUid },
        });
    }

    /**
     * Find tenant by slug
     */
    async findTenantBySlug(slug: string): Promise<Tenant | null> {
        return this.tenantRepository.findOne({
            where: { tenant_slug: slug.toLowerCase(), status: TenantStatus.ACTIVE },
        });
    }

    /**
     * Verify Firebase token with tenant context
     * Returns decoded token and tenant
     */
    async verifyTokenWithTenant(
        token: string,
        tenantSlug: string,
    ): Promise<{ decodedToken: admin.auth.DecodedIdToken; tenant: Tenant; user: User | null }> {
        const decodedToken = await this.verifyToken(token);

        const tenant = await this.findTenantBySlug(tenantSlug);
        if (!tenant) {
            throw new UnauthorizedException('Invalid tenant');
        }

        const user = await this.findUserByFirebaseUid(decodedToken.uid);

        return { decodedToken, tenant, user };
    }

    /**
     * Hash PIN for storage
     */
    async hashPin(pin: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(pin, saltRounds);
    }

    /**
     * Verify PIN against hash
     */
    async verifyPin(pin: string, hash: string): Promise<boolean> {
        return bcrypt.compare(pin, hash);
    }
}
