import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { EnhancedAuthService } from './enhanced-auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { User } from '../users/user.entity';
import { Tenant } from '../tenants/tenant.entity';
import { HandoffController } from './handoff.controller';
import { HandoffService } from './handoff.service';

@Global()
@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([User, Tenant]),
    ],
    controllers: [AuthController, HandoffController],
    providers: [AuthService, EnhancedAuthService, FirebaseAuthGuard, HandoffService],
    exports: [AuthService, EnhancedAuthService, FirebaseAuthGuard, HandoffService],
})
export class AuthModule { }
