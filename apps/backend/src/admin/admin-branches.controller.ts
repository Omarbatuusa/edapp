import {
    Controller, Post, Put, Get, Param, Body, Req,
    UseGuards, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../branches/branch.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

const ALLOWED_ROLES = ['TENANT_ADMIN', 'MAIN_BRANCH_ADMIN', 'BRANCH_ADMIN', 'platform_admin', 'PLATFORM_SUPER_ADMIN'];

@Controller('admin/branches')
@UseGuards(FirebaseAuthGuard)
export class AdminBranchesController {
    constructor(
        @InjectRepository(Branch)
        private readonly branchRepo: Repository<Branch>,
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

        const branch = this.branchRepo.create({ ...body, tenant_id });
        return this.branchRepo.save(branch);
    }

    @Put(':id')
    async update(@Req() req: any, @Param('id') id: string, @Body() body: Partial<Branch>) {
        this.checkRole(req);
        const tenant_id = req.tenant_id;
        const branch = await this.branchRepo.findOne({ where: { id, tenant_id } });
        if (!branch) throw new NotFoundException('Branch not found');

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
