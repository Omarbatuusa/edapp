import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';
import { Tenant } from '../tenants/tenant.entity';
import { RateLimitGuard } from '../auth/rate-limit.guard';

@Module({
    imports: [TypeOrmModule.forFeature([Tenant])],
    controllers: [DiscoveryController],
    providers: [DiscoveryService, RateLimitGuard],
    exports: [DiscoveryService],
})
export class DiscoveryModule { }
