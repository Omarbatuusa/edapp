import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSecurityPolicy, SecurityMode } from './tenant-security-policy.entity';
import { BranchSecurityPolicy } from './branch-security-policy.entity';
import { IpAllowlist } from './ip-allowlist.entity';
import { GeoZone } from './geo-zone.entity';

@Injectable()
export class SecurityPolicyService {
    private readonly logger = new Logger(SecurityPolicyService.name);

    constructor(
        @InjectRepository(TenantSecurityPolicy)
        private readonly tenantPolicyRepo: Repository<TenantSecurityPolicy>,
        @InjectRepository(BranchSecurityPolicy)
        private readonly branchPolicyRepo: Repository<BranchSecurityPolicy>,
        @InjectRepository(IpAllowlist)
        private readonly ipAllowlistRepo: Repository<IpAllowlist>,
        @InjectRepository(GeoZone)
        private readonly geoZoneRepo: Repository<GeoZone>,
    ) { }

    async getEffectivePolicy(tenantId: string, branchId?: string) {
        const tenantPolicy = await this.tenantPolicyRepo.findOne({ where: { tenantId } }) || this.createDefaultTenantPolicy(tenantId);
        let branchPolicy: BranchSecurityPolicy | null = null;

        if (branchId) {
            branchPolicy = await this.branchPolicyRepo.findOne({ where: { tenantId, branchId } });
        }

        return {
            geoMode: branchPolicy?.geoMode ?? tenantPolicy.geoMode,
            geoAccuracyThresholdM: branchPolicy?.geoAccuracyThresholdM ?? tenantPolicy.geoAccuracyThresholdM,
            geoMaxAgeSeconds: MAX_AGE_SECONDS_DEFAULT, // From config or tenant policy if field exists (we can add it to branch too if needed)
            ipMode: branchPolicy?.ipMode ?? tenantPolicy.ipMode,
        };
    }

    // Helper to get allowed IPs
    async getIpAllowlist(tenantId: string, branchId?: string): Promise<string[]> {
        const qb = this.ipAllowlistRepo.createQueryBuilder('ip')
            .where('ip.tenantId = :tenantId', { tenantId })
            .andWhere('ip.enabled = true');

        if (branchId) {
            qb.andWhere('(ip.branchId = :branchId OR ip.branchId IS NULL)', { branchId });
        } else {
            qb.andWhere('ip.branchId IS NULL');
        }

        const results = await qb.getMany();
        return results.map(r => r.cidr);
    }

    // Helper to get active zones
    async getActiveZones(tenantId: string, branchId?: string): Promise<GeoZone[]> {
        const qb = this.geoZoneRepo.createQueryBuilder('zone')
            .where('zone.tenantId = :tenantId', { tenantId })
            .andWhere('zone.enabled = true');

        if (branchId) {
            qb.andWhere('(zone.branchId = :branchId OR zone.branchId IS NULL)', { branchId });
        } else {
            qb.andWhere('zone.branchId IS NULL');
        }

        return qb.getMany();
    }

    private createDefaultTenantPolicy(tenantId: string): TenantSecurityPolicy {
        // Return a default policy if none exists (safe fallback)
        const policy = new TenantSecurityPolicy();
        policy.tenantId = tenantId;
        policy.geoMode = SecurityMode.WARN;
        policy.ipMode = SecurityMode.WARN;
        policy.geoAccuracyThresholdM = 80;
        policy.geoMaxAgeSeconds = 120;
        return policy;
    }
}

const MAX_AGE_SECONDS_DEFAULT = 120;
