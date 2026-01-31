import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    @Get('lookup')
    async lookup(@Query('host') host: string) {
        if (!host) return null;
        const tenant = await this.tenantsService.findByHost(host);
        if (!tenant) throw new NotFoundException('Tenant not found');
        return tenant;
    }

    @Get('lookup-by-code')
    async lookupByCode(@Query('code') code: string) {
        if (!code) return null;
        const tenant = await this.tenantsService.findBySchoolCode(code.toUpperCase());
        if (!tenant) throw new NotFoundException('School not found');
        return tenant;
    }

    @Get('lookup-by-slug')
    async lookupBySlug(@Query('slug') slug: string) {
        if (!slug) return null;
        const tenant = await this.tenantsService.findBySlug(slug.toLowerCase());
        if (!tenant) throw new NotFoundException('Tenant not found');
        return tenant;
    }
}
