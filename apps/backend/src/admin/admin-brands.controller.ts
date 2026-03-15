import {
    Controller, Post, Put, Get, Param, Body, Req,
    UseGuards, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../brands/brand.entity';
import { Tenant } from '../tenants/tenant.entity';
import { Branch } from '../branches/branch.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { StorageService } from '../storage/storage.service';
import { generateSlug, ensureUniqueSlug } from './utils/slug-generator';

const BRAND_ROLES = ['platform_super_admin', 'app_super_admin', 'brand_admin', 'app_secretary', 'platform_secretary'];

@Controller('admin/brands')
@UseGuards(FirebaseAuthGuard)
export class AdminBrandsController {
    constructor(
        @InjectRepository(Brand)
        private readonly brandRepo: Repository<Brand>,
        @InjectRepository(Branch)
        private readonly branchRepo: Repository<Branch>,
        @InjectRepository(Tenant)
        private readonly tenantRepo: Repository<Tenant>,
        private readonly storageService: StorageService,
    ) {}

    private checkRole(req: any) {
        const role = req.user?.role || req.user?.customClaims?.role || '';
        if (!BRAND_ROLES.some(r => role.includes(r) || r.includes(role))) {
            throw new ForbiddenException('Only platform admins and secretaries can manage brands');
        }
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

        const brand_code = (body.brand_code || body.brand_name)
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '_')
            .slice(0, 20);

        const existing = await this.brandRepo.findOne({ where: { brand_code } });
        if (existing) throw new BadRequestException('Brand code already exists. Choose a different name.');

        // Auto-generate brand_slug if not provided
        let brand_slug = body.brand_slug || generateSlug(body.brand_name);
        brand_slug = await ensureUniqueSlug(brand_slug, this.brandRepo, 'brand_slug');

        const brand = this.brandRepo.create({
            brand_name: body.brand_name,
            brand_code,
            brand_slug,
            description: body.description || null,
            logo_file_id: body.logo_file_id || null,
            cover_file_id: body.cover_file_id || null,
        } as any);
        return this.brandRepo.save(brand);
    }

    @Get()
    async findAll(@Req() req: any) {
        const brands = await this.brandRepo.find({ order: { brand_name: 'ASC' } });

        const results = await Promise.all(
            brands.map(async (brand) => {
                const tenantCount = await this.tenantRepo.count({ where: { brand_id: brand.id } });

                // Generate signed URLs for logo/cover if present
                let logoUrl: string | null = null;
                let coverUrl: string | null = null;
                try {
                    if (brand.logo_file_id) {
                        logoUrl = await this.storageService.generateSignedReadUrl(brand.logo_file_id);
                    }
                    if (brand.cover_file_id) {
                        coverUrl = await this.storageService.generateSignedReadUrl(brand.cover_file_id);
                    }
                } catch (_) { /* GCS may not be available in dev */ }

                return {
                    ...brand,
                    connected_tenant_count: tenantCount,
                    logo_url: logoUrl,
                    cover_url: coverUrl,
                };
            }),
        );

        return results;
    }

    @Get(':id')
    async findOne(@Req() req: any, @Param('id') id: string) {
        this.checkRole(req);

        const brand = await this.brandRepo.findOne({ where: { id } });
        if (!brand) throw new NotFoundException('Brand not found');

        // Get linked tenants
        const tenants = await this.tenantRepo.find({
            where: { brand_id: id },
            order: { school_name: 'ASC' },
        });

        let logoUrl: string | null = null;
        let coverUrl: string | null = null;
        try {
            if (brand.logo_file_id) {
                logoUrl = await this.storageService.generateSignedReadUrl(brand.logo_file_id);
            }
            if (brand.cover_file_id) {
                coverUrl = await this.storageService.generateSignedReadUrl(brand.cover_file_id);
            }
        } catch (_) {}

        return {
            ...brand,
            tenants,
            logo_url: logoUrl,
            cover_url: coverUrl,
        };
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
