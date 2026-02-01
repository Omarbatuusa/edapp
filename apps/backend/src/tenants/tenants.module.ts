import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './tenant.entity';
import { TenantDomain } from './tenant-domain.entity';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';

import { TenantSettings } from './tenant-settings.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tenant, TenantDomain, TenantSettings])],
    providers: [TenantsService],
    controllers: [TenantsController],
    exports: [TypeOrmModule, TenantsService],
})
export class TenantsModule { }
