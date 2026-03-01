import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { EnhancedAuthService } from './enhanced-auth.service';
import { EmailAuthService } from './email-auth.service';
import { LearnerAuthService } from './learner-auth.service';
import { SessionTokenService } from './session-token.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { EmailAuthController } from './email-auth.controller';
import { User } from '../users/user.entity';
import { Tenant } from '../tenants/tenant.entity';
import { TenantSettings } from '../tenants/tenant-settings.entity';
import { RoleAssignment } from '../users/role-assignment.entity';
import { HandoffController } from './handoff.controller';
import { HandoffService } from './handoff.service';
import { AdminLoginController } from './admin-login.controller';

@Global()
@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([User, Tenant, TenantSettings, RoleAssignment]),
    ],
    controllers: [AuthController, HandoffController, EmailAuthController, AdminLoginController],
    providers: [
        AuthService,
        EnhancedAuthService,
        EmailAuthService,
        LearnerAuthService,
        SessionTokenService,
        FirebaseAuthGuard,
        HandoffService,
    ],
    exports: [
        AuthService,
        EnhancedAuthService,
        EmailAuthService,
        LearnerAuthService,
        SessionTokenService,
        FirebaseAuthGuard,
        HandoffService,
        TypeOrmModule,
    ],
})
export class AuthModule { }
