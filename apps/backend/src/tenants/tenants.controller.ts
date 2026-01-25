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
}
