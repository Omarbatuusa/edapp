import {
    Controller, Post, Put, Get, Param, Body, Req,
    UseGuards, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../branches/branch.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { PhoneNormalizationService } from './services/phone-normalization.service';

const ALLOWED_ROLES = ['tenant_admin', 'main_branch_admin', 'branch_admin', 'platform_super_admin'];

@Controller('admin/branches')
@UseGuards(FirebaseAuthGuard)
export class AdminBranchesController {
    constructor(
        @InjectRepository(Branch)
        private readonly branchRepo: Repository<Branch>,
        private readonly phoneService: PhoneNormalizationService,
    ) {}

    private checkRole(req: any) {
        const role = req.user?.role || req.user?.customClaims?.role || '';
        if (!ALLOWED_ROLES.some(r => role.includes(r) || r.includes(role))) {
            throw new ForbiddenException('Insufficient permissions');
        }
    }

    @Post()
    async create(@Req() req: any, @Body() body: Partial<Branch> & { is_main_branch?: boolean }) {
        this.checkRole(req);
        const tenant_id = body.tenant_id || req.tenant_id;
        if (!tenant_id) throw new BadRequestException('tenant_id is required');
        if (!body.branch_name) throw new BadRequestException('branch_name is required');
        if (!body.branch_code) throw new BadRequestException('branch_code is required');

        // Enforce single main branch per tenant
        if (body.is_main_branch) {
            const existing = await this.branchRepo.findOne({ where: { tenant_id, is_main_branch: true } });
            if (existing) {
                throw new BadRequestException('A main branch already exists for this tenant. Update it instead.');
            }
        }

        // Normalize phone fields to E.164 before save
        const mobileRaw = (body as any).mobile_e164 || body.mobile_whatsapp;
        if (mobileRaw) {
            const norm = this.phoneService.normalize(mobileRaw, (body as any).mobile_country_iso2 || 'ZA');
            if (norm) {
                (body as any).mobile_e164 = norm.e164;
                (body as any).mobile_country_iso2 = norm.country_iso2;
                (body as any).mobile_dial_code = norm.dial_code;
            }
        }
        const landlineRaw = (body as any).landline_e164 || body.phone_landline;
        if (landlineRaw) {
            const norm = this.phoneService.normalize(landlineRaw, (body as any).landline_country_iso2 || 'ZA');
            if (norm) {
                (body as any).landline_e164 = norm.e164;
                (body as any).landline_country_iso2 = norm.country_iso2;
                (body as any).landline_dial_code = norm.dial_code;
            }
        }

        const branch = this.branchRepo.create({ ...body, tenant_id });
        return this.branchRepo.save(branch);
    }

    @Put(':id')
    async update(@Req() req: any, @Param('id') id: string, @Body() body: Partial<Branch>) {
        this.checkRole(req);
        const tenant_id = req.tenant_id;
        const branch = await this.branchRepo.findOne({ where: { id, tenant_id } });
        if (!branch) throw new NotFoundException('Branch not found');

        // Normalize phone fields on update
        const mobileRaw = (body as any).mobile_e164 || body.mobile_whatsapp;
        if (mobileRaw) {
            const norm = this.phoneService.normalize(mobileRaw, (body as any).mobile_country_iso2 || branch.mobile_country_iso2 || 'ZA');
            if (norm) {
                (body as any).mobile_e164 = norm.e164;
                (body as any).mobile_country_iso2 = norm.country_iso2;
                (body as any).mobile_dial_code = norm.dial_code;
            }
        }
        const landlineRaw = (body as any).landline_e164 || body.phone_landline;
        if (landlineRaw) {
            const norm = this.phoneService.normalize(landlineRaw, (body as any).landline_country_iso2 || branch.landline_country_iso2 || 'ZA');
            if (norm) {
                (body as any).landline_e164 = norm.e164;
                (body as any).landline_country_iso2 = norm.country_iso2;
                (body as any).landline_dial_code = norm.dial_code;
            }
        }

        Object.assign(branch, body);
        return this.branchRepo.save(branch);
    }

    @Get()
    async findAll(@Req() req: any) {
        this.checkRole(req);
        const tenant_id = req.tenant_id;
        return this.branchRepo.find({ where: { tenant_id }, order: { created_at: 'DESC' } });
    }

    @Get(':id')
    async findOne(@Req() req: any, @Param('id') id: string) {
        this.checkRole(req);
        const tenant_id = req.tenant_id;
        const branch = await this.branchRepo.findOne({ where: { id, tenant_id } });
        if (!branch) throw new NotFoundException('Branch not found');
        return branch;
    }

    @Post('bulk')
    async bulkCreate(
        @Req() req: any,
        @Body() body: { branches: Array<Partial<Branch> & { is_main_branch?: boolean }> },
    ) {
        this.checkRole(req);
        const tenant_id = req.tenant_id;
        if (!tenant_id) throw new BadRequestException('tenant_id is required');

        const results: Array<{ index: number; success: boolean; error?: string; branchId?: string }> = [];

        for (let i = 0; i < body.branches.length; i++) {
            const item = body.branches[i];
            try {
                if (!item.branch_name) throw new Error('branch_name is required');
                if (!item.branch_code) throw new Error('branch_code is required');

                const branch = this.branchRepo.create({ ...item, tenant_id });
                const saved = await this.branchRepo.save(branch);
                results.push({ index: i, success: true, branchId: saved.id });
            } catch (err: any) {
                results.push({ index: i, success: false, error: err.message || 'Failed to create branch' });
            }
        }

        return { results };
    }
}
