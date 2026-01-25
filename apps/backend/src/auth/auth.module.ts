import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { EnhancedAuthService } from './enhanced-auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { User } from '../users/user.entity';
import { Tenant } from '../tenants/tenant.entity';

@Global()
@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([User, Tenant]),
    ],
    controllers: [AuthController],
    providers: [AuthService, EnhancedAuthService, FirebaseAuthGuard],
    exports: [AuthService, EnhancedAuthService, FirebaseAuthGuard],
})
export class AuthModule { }
