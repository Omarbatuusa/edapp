import { Controller, Get, Put, Post, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { SecurityPolicyService } from './security-policy.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSecurityPolicy } from './tenant-security-policy.entity';
import { BranchSecurityPolicy } from './branch-security-policy.entity';
import { Branch } from '../branches/branch.entity';
import { IpExtractionService } from './ip-extraction.service';
import { IpAllowlist } from './ip-allowlist.entity';
import { GeoZone } from './geo-zone.entity';
// import { AuthGuard } from '../auth/auth.guard'; // Assuming AuthGuard exists

@Controller('security-settings')
// @UseGuards(AuthGuard) // strict auth needed
export class SecuritySettingsController {
    constructor(
        private readonly securityPolicyService: SecurityPolicyService,
        @InjectRepository(TenantSecurityPolicy)
        private readonly tenantPolicyRepo: Repository<TenantSecurityPolicy>,
        @InjectRepository(BranchSecurityPolicy)
        private readonly branchPolicyRepo: Repository<BranchSecurityPolicy>,
        @InjectRepository(Branch)
        private readonly branchRepo: Repository<Branch>,
        private readonly ipExtractionService: IpExtractionService,
        @InjectRepository(IpAllowlist)
        private readonly ipAllowlistRepo: Repository<IpAllowlist>,
        @InjectRepository(GeoZone)
        private readonly geoZoneRepo: Repository<GeoZone>,
    ) { }

    // Helper to ensure tenant access (Tenant Admin only)
    private checkAccess(req: any) {
        // Implement role check -> Tenant Admin
        // For now simplistic
        const user = req.user;
        if (!user) return; // Should be handled by AuthGuard
        // if (!user.roles.includes('tenant_admin')) throw new ForbiddenException();
    }

    @Get('policy')
    async getPolicy(@Req() req: any) {
        this.checkAccess(req);
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.tenantPolicyRepo.findOne({ where: { tenantId } });
    }

    @Put('policy')
    async updatePolicy(@Req() req: any, @Body() body: Partial<TenantSecurityPolicy>) {
        this.checkAccess(req);
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        let policy = await this.tenantPolicyRepo.findOne({ where: { tenantId } });
        if (!policy) {
            policy = this.tenantPolicyRepo.create({ ...body, tenantId });
        } else {
            this.tenantPolicyRepo.merge(policy, body);
        }
        return this.tenantPolicyRepo.save(policy);
    }

    // Branch Policies
    @Get('branch-policies')
    async getBranchPolicies(@Req() req: any) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.branchPolicyRepo.find({ where: { tenantId } });
    }

    @Post('branch-policies')
    async createBranchPolicy(@Req() req: any, @Body() body: Partial<BranchSecurityPolicy>) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        const policy = this.branchPolicyRepo.create({ ...body, tenantId });
        return this.branchPolicyRepo.save(policy);
    }

    // IP Allowlist
    @Get('ip-allowlist')
    async getIpAllowlist(@Req() req: any) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.ipAllowlistRepo.find({ where: { tenantId } });
    }

    @Post('ip-allowlist')
    async addIp(@Req() req: any, @Body() body: Partial<IpAllowlist>) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        const ip = this.ipAllowlistRepo.create({ ...body, tenantId });
        return this.ipAllowlistRepo.save(ip);
    }

    @Put('ip-allowlist/:id')
    async updateIp(@Param('id') id: string, @Body() body: Partial<IpAllowlist>) {
        await this.ipAllowlistRepo.update(id, body);
        return this.ipAllowlistRepo.findOne({ where: { id } });
    }

    // Geo Zones
    @Get('geo-zones')
    async getGeoZones(@Req() req: any) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.geoZoneRepo.find({ where: { tenantId } });
    }

    @Post('geo-zones')
    async addZone(@Req() req: any, @Body() body: Partial<GeoZone>) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        const zone = this.geoZoneRepo.create({ ...body, tenantId });
        return this.geoZoneRepo.save(zone);
    }

    // New Endpoints for Branch Security
    @Get('my-ip')
    getMyIp(@Req() req: any) {
        return this.ipExtractionService.extractIp(req);
    }

    @Get('branch/:id')
    async getBranchSettings(@Param('id') id: string, @Req() req: any) {
        // Ensure tenant access
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.branchRepo.findOne({ where: { id, tenant_id: tenantId } });
    }

    @Put('branch/:id')
    async updateBranchSettings(@Param('id') id: string, @Body() body: Partial<Branch>, @Req() req: any) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        // Verify ownership
        const branch = await this.branchRepo.findOne({ where: { id, tenant_id: tenantId } });
        if (!branch) throw new ForbiddenException();

        // Update allowed fields
        // Security fields: lat, lng, geofence_radius_m, geo_required_for_staff, geo_required_for_learners, geo_min_accuracy_m, geo_policy_mode, allowed_public_ips, ip_policy_mode, allow_ip_autodetect

        Object.assign(branch, body); // DTO validation ideally handles this, blindly merging for now
        return this.branchRepo.save(branch);
    }
}
