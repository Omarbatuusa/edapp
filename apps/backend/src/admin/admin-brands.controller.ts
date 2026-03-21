import {
    Controller, Post, Put, Patch, Get, Delete, Param, Body, Req, Query,
    UseGuards, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand, BrandStatus } from '../brands/brand.entity';
import { Tenant } from '../tenants/tenant.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { StorageService } from '../storage/storage.service';
import { ensureUniqueSlug } from './utils/slug-generator';

const BRAND_ROLES = ['platform_super_admin', 'app_super_admin', 'brand_admin', 'app_secretary', 'platform_secretary'];
const DELETE_ROLES = ['platform_super_admin', 'app_super_admin'];

@Controller('admin/brands')
@UseGuards(FirebaseAuthGuard)
export class AdminBrandsController {
    constructor(
        @InjectRepository(Brand)
        private readonly brandRepo: Repository<Brand>,
        @InjectRepository(Tenant)
        private readonly tenantRepo: Repository<Tenant>,
        private readonly storageService: StorageService,
    ) {}

    private getRole(req: any): string {
        return req.user?.role || req.user?.customClaims?.role || '';
    }

    private checkRole(req: any) {
        const role = this.getRole(req);
        if (!BRAND_ROLES.some(r => role.includes(r) || r.includes(role))) {
            throw new ForbiddenException('Only platform admins and secretaries can manage brands');
        }
    }

    private checkDeleteRole(req: any) {
        const role = this.getRole(req);
        if (!DELETE_ROLES.some(r => role.includes(r))) {
            throw new ForbiddenException('Only super admins can delete brands');
        }
    }

    /**
     * Generate a brand code: 1 uppercase letter (initial) + 3 digits, no hyphen.
     * e.g., "Rainbow City" → R083, "Allied Schools" → A247
     */
    private async generateBrandCode(name: string): Promise<string> {
        const letter = name.replace(/[^a-zA-Z]/g, '').substring(0, 1).toUpperCase() || 'B';
        for (let i = 0; i < 99; i++) {
            const num = String(Math.floor(Math.random() * 900) + 100); // 100–999
            const code = `${letter}${num}`;
            const exists = await this.brandRepo.findOne({ where: { brand_code: code } });
            if (!exists) return code;
        }
        return `${letter}${((Date.now() % 900) + 100)}`;
    }

    private async enrichBrand(brand: Brand) {
        const tenantCount = await this.tenantRepo.count({ where: { brand_id: brand.id } });
        let logoUrl: string | null = null;
        let coverUrl: string | null = null;
        try {
            if (brand.logo_file_id) logoUrl = await this.storageService.generateSignedReadUrl(brand.logo_file_id);
            if (brand.cover_file_id) coverUrl = await this.storageService.generateSignedReadUrl(brand.cover_file_id);
        } catch (_) { /* GCS may not be available in dev */ }
        return { ...brand, connected_school_count: tenantCount, logo_url: logoUrl, cover_url: coverUrl };
    }

    @Post()
    async create(@Req() req: any, @Body() body: {
        brand_name: string;
        brand_code?: string;
        brand_slug?: string;
        description?: string;
        logo_file_id?: string;
        cover_file_id?: string;
    }) {
        this.checkRole(req);
        if (!body.brand_name) throw new BadRequestException('brand_name is required');

        const brand_code = await this.generateBrandCode(body.brand_name);

        let brand_slug = body.brand_name
            .toLowerCase()
            .replace(/[^a-z]/g, '')
            .substring(0, 3)
            .padEnd(3, 'x');
        brand_slug = await ensureUniqueSlug(brand_slug, this.brandRepo, 'brand_slug');

        const brand = this.brandRepo.create({
            brand_name: body.brand_name,
            brand_code,
            brand_slug,
            description: body.description || null,
            logo_file_id: body.logo_file_id || null,
            cover_file_id: body.cover_file_id || null,
            status: BrandStatus.ACTIVE,
        } as any);
        return this.brandRepo.save(brand);
    }

    @Get()
    async findAll(@Query('status') status?: string) {
        const where: any = {};
        if (status && Object.values(BrandStatus).includes(status as BrandStatus)) {
            where.status = status as BrandStatus;
        }
        const brands = await this.brandRepo.find({ where, order: { brand_name: 'ASC' } });
        return Promise.all(brands.map(b => this.enrichBrand(b)));
    }

    @Get(':id')
    async findOne(@Req() req: any, @Param('id') id: string) {
        this.checkRole(req);
        const brand = await this.brandRepo.findOne({ where: { id } });
        if (!brand) throw new NotFoundException('Brand not found');

        const tenants = await this.tenantRepo.find({
            where: { brand_id: id },
            order: { school_name: 'ASC' },
        });

        let logoUrl: string | null = null;
        let coverUrl: string | null = null;
        try {
            if (brand.logo_file_id) logoUrl = await this.storageService.generateSignedReadUrl(brand.logo_file_id);
            if (brand.cover_file_id) coverUrl = await this.storageService.generateSignedReadUrl(brand.cover_file_id);
        } catch (_) {}

        return { ...brand, tenants, logo_url: logoUrl, cover_url: coverUrl };
    }

    @Put(':id')
    async update(@Req() req: any, @Param('id') id: string, @Body() body: Partial<Brand>) {
        this.checkRole(req);
        const brand = await this.brandRepo.findOne({ where: { id } });
        if (!brand) throw new NotFoundException('Brand not found');

        // Never allow overwriting immutable fields via PUT
        const { brand_code, brand_slug, id: _id, created_at, status: _status, ...safeBody } = body as any;
        Object.assign(brand, safeBody);
        return this.brandRepo.save(brand);
    }

    @Patch(':id/archive')
    async archive(@Req() req: any, @Param('id') id: string) {
        this.checkRole(req);
        const brand = await this.brandRepo.findOne({ where: { id } });
        if (!brand) throw new NotFoundException('Brand not found');
        if (brand.status === BrandStatus.ARCHIVED) return brand; // idempotent
        brand.status = BrandStatus.ARCHIVED;
        return this.brandRepo.save(brand);
    }

    @Patch(':id/restore')
    async restore(@Req() req: any, @Param('id') id: string) {
        this.checkRole(req);
        const brand = await this.brandRepo.findOne({ where: { id } });
        if (!brand) throw new NotFoundException('Brand not found');
        brand.status = BrandStatus.ACTIVE;
        return this.brandRepo.save(brand);
    }

    @Delete(':id')
    async remove(@Req() req: any, @Param('id') id: string) {
        this.checkDeleteRole(req);

        const brand = await this.brandRepo.findOne({ where: { id } });
        if (!brand) throw new NotFoundException('Brand not found');

        // Must be archived first
        if (brand.status !== BrandStatus.ARCHIVED) {
            throw new BadRequestException(
                `Archive "${brand.brand_name}" before deleting. Change its status to Archived first.`,
            );
        }

        // Must have no linked schools
        const tenantCount = await this.tenantRepo.count({ where: { brand_id: id } });
        if (tenantCount > 0) {
            throw new BadRequestException(
                `Cannot delete brand "${brand.brand_name}" — it has ${tenantCount} linked school${tenantCount > 1 ? 's' : ''}. Unlink them first.`,
            );
        }

        await this.brandRepo.remove(brand);
        return { deleted: true, id };
    }
}
