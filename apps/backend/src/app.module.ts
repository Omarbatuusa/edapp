import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entities
import { Brand } from './brands/brand.entity';
import { Tenant } from './tenants/tenant.entity';
import { TenantDomain } from './tenants/tenant-domain.entity';
import { Branch } from './branches/branch.entity';
import { User } from './users/user.entity';
import { RoleAssignment } from './users/role-assignment.entity';

// Modules
import { BrandsModule } from './brands/brands.module';
import { TenantsModule } from './tenants/tenants.module';
import { TenantsMiddleware } from './tenants/tenants.middleware';
import { BranchesModule } from './branches/branches.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DiscoveryModule } from './discovery/discovery.module';
import { AuditModule } from './audit/audit.module';

import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get('REDIS_URL'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [Brand, Tenant, TenantDomain, Branch, User, RoleAssignment],
        autoLoadEntities: true,
        synchronize: true, // DEV only, set to false in prod
        logging: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    BrandsModule,
    TenantsModule,
    BranchesModule,
    AuthModule,
    UsersModule,
    DiscoveryModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes('*');
  }
}
