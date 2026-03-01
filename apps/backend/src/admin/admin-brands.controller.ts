import {
    Controller, Post, Put, Get, Param, Body, Req,
    UseGuards, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../brands/brand.entity';
import { Branch } from '../branches/branch.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

const BRAND_ROLES = ['platform_admin', 'PLATFORM_SUPER_ADMIN', 'BRAND_ADMIN'];

@Controller('admin/brands')
@UseGuards(FirebaseAuthGuard)
export class AdminBrandsController {
    constructor(
        @InjectRepository(Brand)
        private readonly brandRepo: Repository<Brand>,
        @InjectRepository(Branch)
        private readonly branchRepo: Repository<Branch>,
    ) {}

    private checkRole(req: any) {
        const role = req.user?.role || req.user?.customClaims?.role || '';
        if (!BRAND_ROLES.some(r => role.includes(r) || r.includes(role))) {
            throw new ForbiddenException('Only platform admins can manage brands');
        }
    }

    @Post()
    async create(@Req() req: any, @Body() body: { brand_name: string; brand_code?: string; description?: string }) {
        this.checkRole(req);

        if (!body.brand_name) throw new BadRequestException('brand_name is required');

        const brand_code = (body.brand_code || body.brand_name)
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '_')
            .slice(0, 20);

        const existing = await this.brandRepo.findOne({ where: { brand_code } });
        if (existing) throw new BadRequestException('Brand code already exists. Choose a different name.');

        const brand = this.brandRepo.create({ brand_name: body.brand_name, brand_code });
        return this.brandRepo.save(brand);
    }

    @Get()
    async findAll(@Req() req: any) {
        // All authenticated admins can list brands (for dropdown selectors)
        const brands = await this.brandRepo.find({ order: { brand_name: 'ASC' } });

        // Add connected_branch_count per brand
        const results = await Promise.all(
            brands.map(async (brand) => {
                const count = await this.branchRepo.count({ where: { brand_id: brand.id } });
                return { ...brand, connected_branch_count: count };
            }),
        );

        return results;
    }

    @Put(':id')
    async update(@Req() req: any, @Param('id') id: string, @Body() body: Partial<Brand>) {
        this.checkRole(req);

        const brand = await this.brandRepo.findOne({ where: { id } });
        if (!brand) throw new NotFoundException('Brand not found');

        Object.assign(brand, body);
        return this.brandRepo.save(brand);
    }
}
