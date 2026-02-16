import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantSecurityPolicy } from './tenant-security-policy.entity';
import { BranchSecurityPolicy } from './branch-security-policy.entity';
import { IpAllowlist } from './ip-allowlist.entity';
import { GeoZone } from './geo-zone.entity';
import { IpExtractionService } from './ip-extraction.service';
import { GeoService } from './geo.service';
import { SecurityPolicyService } from './security-policy.service';

import { AuditModule } from '../audit/audit.module';

import { SecuritySettingsController } from './security-settings.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TenantSecurityPolicy,
            BranchSecurityPolicy,
            IpAllowlist,
            GeoZone,
        ]),
        AuditModule,
    ],
    controllers: [SecuritySettingsController],
    providers: [
        IpExtractionService,
        GeoService,
        SecurityPolicyService,
    ],
    exports: [
        IpExtractionService,
        GeoService,
        SecurityPolicyService,
    ],
})
export class SecurityModule { }
