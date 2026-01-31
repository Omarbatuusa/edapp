import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus } from './tenant.entity';
import { TenantDomain, TenantDomainType } from './tenant-domain.entity';

@Injectable()
export class TenantsService {
    constructor(
        @InjectRepository(Tenant)
        private readonly tenantRepo: Repository<Tenant>,
        @InjectRepository(TenantDomain)
        private readonly domainRepo: Repository<TenantDomain>,
    ) { }

    // ========== LOOKUP METHODS ==========

    /**
     * Find tenant by hostname (e.g., lia.edapp.co.za or apply-lia.edapp.co.za)
     * Returns tenant with portal type (app/apply)
     */
    async findByHost(host: string): Promise<{ tenant: Tenant; portal_type: TenantDomainType } | null> {
        const domain = await this.domainRepo.findOne({
            where: { host },
            relations: ['tenant'],
        });

        if (!domain || !domain.tenant) return null;

        return {
            tenant: domain.tenant,
            portal_type: domain.type,
        };
    }

    /**
     * Find tenant by school code (e.g., LIA01, RAI01)
     */
    async findBySchoolCode(code: string): Promise<Tenant | null> {
        return this.tenantRepo.findOne({
            where: { school_code: code.toUpperCase(), status: TenantStatus.ACTIVE },
        });
    }

    /**
     * Find tenant by slug (e.g., lia, rainbow)
     * Includes main branch for display
     */
    async findBySlug(slug: string): Promise<(Tenant & { main_branch?: { branch_name: string; is_main_branch: boolean } }) | null> {
        const tenant = await this.tenantRepo.findOne({
            where: { tenant_slug: slug.toLowerCase(), status: TenantStatus.ACTIVE },
            relations: ['branches'],
        });

        if (!tenant) return null;

        // Find main branch and attach to response
        const mainBranch = tenant.branches?.find(b => b.is_main_branch);
        return {
            ...tenant,
            main_branch: mainBranch ? {
                branch_name: mainBranch.branch_name,
                is_main_branch: mainBranch.is_main_branch,
            } : undefined,
        };
    }

    /**
     * Get all domains for a tenant
     */
    async getDomains(tenant_id: string): Promise<TenantDomain[]> {
        return this.domainRepo.find({ where: { tenant_id } });
    }

    // ========== CRUD METHODS (Platform Admin only) ==========

    async findAll(): Promise<Tenant[]> {
        return this.tenantRepo.find({ where: { status: TenantStatus.ACTIVE } });
    }

    async findById(id: string): Promise<Tenant | null> {
        return this.tenantRepo.findOne({ where: { id } });
    }

    async create(data: Partial<Tenant>): Promise<Tenant> {
        const tenant = this.tenantRepo.create(data);
        const saved = await this.tenantRepo.save(tenant);

        // Auto-create domains
        await this.domainRepo.save([
            {
                tenant_id: saved.id,
                type: TenantDomainType.APP,
                host: `${saved.tenant_slug}.edapp.co.za`,
                is_primary: true,
            },
            {
                tenant_id: saved.id,
                type: TenantDomainType.APPLY,
                host: `apply-${saved.tenant_slug}.edapp.co.za`,
                is_primary: true,
            },
        ]);

        return saved;
    }

    async update(id: string, data: Partial<Tenant>): Promise<Tenant | null> {
        const tenant = await this.findById(id);
        if (!tenant) return null;
        Object.assign(tenant, data);
        return this.tenantRepo.save(tenant);
    }
}
