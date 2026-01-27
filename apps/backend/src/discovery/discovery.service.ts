import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus } from '../tenants/tenant.entity';
import { TenantDomain, TenantDomainType } from '../tenants/tenant-domain.entity';
import { Branch } from '../branches/branch.entity';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

export interface DiscoveryResult {
    tenant_id: string;
    tenant_slug: string;
    school_code: string;
    school_name: string;
    main_branch: {
        id: string;
        name: string;
        address: string;
        logo_url: string | null;
    } | null;
    domains: {
        app: string;
        apply: string;
    };
}

@Injectable()
export class DiscoveryService {
    constructor(
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
        @InjectRepository(TenantDomain)
        private domainRepository: Repository<TenantDomain>,
        @InjectRepository(Branch)
        private branchRepository: Repository<Branch>,
        private configService: ConfigService,
    ) { }

    /**
     * Find tenant by school code (AAA## format, e.g., LIA01, RAI01)
     * Returns full discovery result with main branch info and domains
     */
    async findBySchoolCode(code: string): Promise<DiscoveryResult | null> {
        // Normalize code: uppercase, trim
        const normalizedCode = code.toUpperCase().trim();

        // Validate format (AAA## - 3 letters + 2 digits)
        if (!/^[A-Z]{3}[0-9]{2}$/.test(normalizedCode)) {
            return null;
        }

        const tenant = await this.tenantRepository.findOne({
            where: { school_code: normalizedCode, status: TenantStatus.ACTIVE },
        });

        if (!tenant) return null;

        // Get main branch for logo and address
        const mainBranch = await this.branchRepository.findOne({
            where: { tenant_id: tenant.id, is_main_branch: true },
        });

        // Get domains
        const domains = await this.domainRepository.find({
            where: { tenant_id: tenant.id },
        });

        const appDomain = domains.find(d => d.type === TenantDomainType.APP);
        const applyDomain = domains.find(d => d.type === TenantDomainType.APPLY);

        return {
            tenant_id: tenant.id,
            tenant_slug: tenant.tenant_slug,
            school_code: tenant.school_code,
            school_name: tenant.school_name,
            main_branch: mainBranch
                ? {
                    id: mainBranch.id,
                    name: mainBranch.branch_name,
                    address: mainBranch.physical_address || '',
                    logo_url: mainBranch.school_logo_url,
                }
                : null,
            domains: {
                app: appDomain?.host || `${tenant.tenant_slug}.edapp.co.za`,
                apply: applyDomain?.host || `apply-${tenant.tenant_slug}.edapp.co.za`,
            },
        };
    }

    /**
     * Legacy method for backward compatibility
     */
    async findByCode(code: string): Promise<DiscoveryResult | null> {
        return this.findBySchoolCode(code);
    }

    /**
     * Find tenant by slug (e.g., lia, rainbow)
     */
    async findBySlug(slug: string): Promise<DiscoveryResult | null> {
        const tenant = await this.tenantRepository.findOne({
            where: { tenant_slug: slug.toLowerCase(), status: TenantStatus.ACTIVE },
        });

        if (!tenant) return null;

        return this.findBySchoolCode(tenant.school_code);
    }

    /**
     * Validate QR token and return tenant
     */
    async validateQRToken(token: string): Promise<DiscoveryResult | null> {
        try {
            const secret = this.configService.get<string>('JWT_SECRET') || 'edapp-qr-secret';
            const decoded: any = jwt.verify(token, secret);

            if (decoded.exp && decoded.exp < Date.now() / 1000) {
                return null;
            }

            return this.findBySchoolCode(decoded.school_code);
        } catch (error) {
            return null;
        }
    }

    /**
     * Generate QR token for a tenant
     */
    async generateQRToken(
        school_code: string,
    ): Promise<{ token: string; expiresAt: Date; qr_url: string }> {
        const result = await this.findBySchoolCode(school_code);

        if (!result) {
            throw new BadRequestException('Tenant not found');
        }

        const secret = this.configService.get<string>('JWT_SECRET') || 'edapp-qr-secret';

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const token = jwt.sign(
            {
                school_code: result.school_code,
                tenant_slug: result.tenant_slug,
                type: 'qr_discovery',
            },
            secret,
            { expiresIn: '30d' },
        );

        return {
            token,
            expiresAt,
            qr_url: `https://app.edapp.co.za/qr?t=${token}`,
        };
    }
}
