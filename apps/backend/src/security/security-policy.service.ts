import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSecurityPolicy, SecurityMode } from './tenant-security-policy.entity';
import { BranchSecurityPolicy } from './branch-security-policy.entity';
import { Branch } from '../branches/branch.entity';
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
        @InjectRepository(Branch)
        private readonly branchRepo: Repository<Branch>,
        @InjectRepository(IpAllowlist)
        private readonly ipAllowlistRepo: Repository<IpAllowlist>,
        @InjectRepository(GeoZone)
        private readonly geoZoneRepo: Repository<GeoZone>,
    ) { }

    async getEffectivePolicy(tenantId: string, branchId?: string) {
        const tenantPolicy = await this.tenantPolicyRepo.findOne({ where: { tenantId } }) || this.createDefaultTenantPolicy(tenantId);
        let branch: Branch | null = null;
        let branchPolicy: BranchSecurityPolicy | null = null;

        if (branchId) {
            branch = await this.branchRepo.findOne({ where: { id: branchId } });
            // Legacy support if needed, but we prefer Branch entity fields now
            // branchPolicy = await this.branchPolicyRepo.findOne({ where: { tenantId, branchId } });
        }

        if (branch) {
            return {
                geoMode: branch.geo_policy_mode,
                geoAccuracyThresholdM: branch.geo_min_accuracy_m,
                geoMaxAgeSeconds: MAX_AGE_SECONDS_DEFAULT,
                ipMode: branch.ip_policy_mode,
                geoRequiredForStaff: branch.geo_required_for_staff,
                geoRequiredForLearners: branch.geo_required_for_learners,
                // allowIpAutodetect: branch.allow_ip_autodetect, // Not strictly policy but useful
            };
        }

        // Fallback to Tenant Policy
        return {
            geoMode: tenantPolicy.geoMode,
            geoAccuracyThresholdM: tenantPolicy.geoAccuracyThresholdM,
            geoMaxAgeSeconds: MAX_AGE_SECONDS_DEFAULT,
            ipMode: tenantPolicy.ipMode,
            geoRequiredForStaff: true, // Default strict? Or safe?
            geoRequiredForLearners: false,
        };
    }

    // Helper to get allowed IPs
    async getIpAllowlist(tenantId: string, branchId?: string): Promise<string[]> {
        // 1. Tenant IPs
        const qb = this.ipAllowlistRepo.createQueryBuilder('ip')
            .where('ip.tenantId = :tenantId', { tenantId })
            .andWhere('ip.enabled = true');

        const globalResults = await qb.getMany();
        const ips = new Set(globalResults.map(r => r.cidr));

        // 2. Branch IPs (from Branch entity)
        if (branchId) {
            const branch = await this.branchRepo.findOne({ where: { id: branchId } });
            if (branch && branch.allowed_public_ips) {
                branch.allowed_public_ips.forEach(ip => ips.add(ip));
            }
        }

        return Array.from(ips);
    }

    // Helper to get active zones
    async getActiveZones(tenantId: string, branchId?: string): Promise<GeoZone[]> {
        const predefinedZones: GeoZone[] = [];

        // 1. Tenant/Legacy Zones
        const qb = this.geoZoneRepo.createQueryBuilder('zone')
            .where('zone.tenantId = :tenantId', { tenantId })
            .andWhere('zone.enabled = true');

        if (branchId) {
            // If we want to support legacy "Branch-specific GeoZone entities"
            // qb.andWhere('(zone.branchId = :branchId OR zone.branchId IS NULL)', { branchId });
            // But actually, we want Tenant zones + Current Branch Virtual Zone
            qb.andWhere('zone.branchId IS NULL');
        } else {
            qb.andWhere('zone.branchId IS NULL');
        }

        const zones = await qb.getMany();
        predefinedZones.push(...zones);

        // 2. Virtual Branch Zone
        if (branchId) {
            const branch = await this.branchRepo.findOne({ where: { id: branchId } });
            if (branch && branch.lat && branch.lng) {
                // Construct a virtual GeoZone from branch settings
                const branchZone = new GeoZone();
                branchZone.id = `branch-${branch.id}`; // Virtual ID
                branchZone.name = branch.branch_name;
                branchZone.centerLat = branch.lat;
                branchZone.centerLng = branch.lng;
                branchZone.radiusM = branch.geofence_radius_m;
                branchZone.enabled = true;
                branchZone.tenantId = tenantId;
                branchZone.branchId = branchId;
                predefinedZones.push(branchZone);
            }
        }

        return predefinedZones;
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
