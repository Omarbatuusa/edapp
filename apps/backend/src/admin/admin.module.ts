import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminDraft } from './admin-draft.entity';
import { AdminDraftsController } from './admin-drafts.controller';
import { AdminPhoneController } from './admin-phone.controller';
import { AdminEmailVerifyController } from './admin-email-verify.controller';
import { AdminBranchesController } from './admin-branches.controller';
import { AdminBrandsController } from './admin-brands.controller';
import { Branch } from '../branches/branch.entity';
import { Brand } from '../brands/brand.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([AdminDraft, Branch, Brand]),
        AuthModule,
    ],
    controllers: [
        AdminDraftsController,
        AdminPhoneController,
        AdminEmailVerifyController,
        AdminBranchesController,
        AdminBrandsController,
    ],
})
export class AdminModule {}
