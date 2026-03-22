import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminDraft } from './admin-draft.entity';
import { AdminDraftsController } from './admin-drafts.controller';
import { AdminPhoneController } from './admin-phone.controller';
import { AdminEmailVerifyController } from './admin-email-verify.controller';
import { AdminBranchesController } from './admin-branches.controller';
import { AdminBrandsController } from './admin-brands.controller';
import { AdminIllustrationsController } from './admin-illustrations.controller';
import { AdminGeocodeController } from './admin-geocode.controller';
import { IllustrationOverride } from './illustration-override.entity';
import { Branch } from '../branches/branch.entity';
import { Brand } from '../brands/brand.entity';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { Tenant } from '../tenants/tenant.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([AdminDraft, Branch, Brand, Tenant, IllustrationOverride]),
        AuthModule,
        StorageModule,
    ],
    controllers: [
        AdminDraftsController,
        AdminPhoneController,
        AdminEmailVerifyController,
        AdminBranchesController,
        AdminBrandsController,
        AdminIllustrationsController,
        AdminGeocodeController,
    ],
})
export class AdminModule {}
