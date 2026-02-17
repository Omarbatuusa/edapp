import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { EnhancedAuthService } from './enhanced-auth.service';
import { EmailAuthService } from './email-auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { EmailAuthController } from './email-auth.controller';
import { User } from '../users/user.entity';
import { Tenant } from '../tenants/tenant.entity';
import { TenantSettings } from '../tenants/tenant-settings.entity';
import { HandoffController } from './handoff.controller';
import { HandoffService } from './handoff.service';

@Global()
@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([User, Tenant, TenantSettings]),
    ],
    controllers: [AuthController, HandoffController, EmailAuthController],
    providers: [AuthService, EnhancedAuthService, EmailAuthService, FirebaseAuthGuard, HandoffService],
    exports: [AuthService, EnhancedAuthService, EmailAuthService, FirebaseAuthGuard, HandoffService, TypeOrmModule],
})
export class AuthModule { }
