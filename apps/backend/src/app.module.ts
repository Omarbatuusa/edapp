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
import { TenantSettings } from './tenants/tenant-settings.entity';
import { PolicyDocument } from './policies/policy-document.entity';
import { PolicyVersion } from './policies/policy-version.entity';
import { UserPolicyAcceptance } from './policies/user-policy-acceptance.entity';
import { Thread } from './communication/thread.entity';
import { Message } from './communication/message.entity';
import { ThreadMember } from './communication/thread-member.entity';
import { MessageReceipt } from './communication/message-receipt.entity';
import { Notification } from './communication/notification.entity';
import { ParentChildLink } from './communication/parent-child-link.entity';
import { AnnouncementRead } from './communication/announcement-read.entity';
import { AnnouncementReaction } from './communication/announcement-reaction.entity';
import { TicketAction } from './communication/ticket-action.entity';
import { MessageReport } from './communication/message-report.entity';
import { DeviceToken } from './notifications/device-token.entity';
import { ContentTranslation } from './translation/content-translation.entity';
import { UserLanguagePreference } from './translation/user-language-preference.entity';
import { TenantSecurityPolicy } from './security/tenant-security-policy.entity';
import { BranchSecurityPolicy } from './security/branch-security-policy.entity';
import { IpAllowlist } from './security/ip-allowlist.entity';
import { GeoZone } from './security/geo-zone.entity';
import { AdminDraft } from './admin/admin-draft.entity';
import { DictPhase } from './admin/entities/dict-phase.entity';
import { DictGrade } from './admin/entities/dict-grade.entity';
import { DictClassGender } from './admin/entities/dict-class-gender.entity';
import { DictSubjectCategory } from './admin/entities/dict-subject-category.entity';
import { DictSubjectType } from './admin/entities/dict-subject-type.entity';
import { DictLanguageLevel } from './admin/entities/dict-language-level.entity';
import { DictLanguageHL } from './admin/entities/dict-language-hl.entity';
import { DictLanguageFAL } from './admin/entities/dict-language-fal.entity';
import { DictSalutation } from './admin/entities/dict-salutation.entity';
import { DictReligion } from './admin/entities/dict-religion.entity';
import { Subject } from './admin/entities/subject.entity';
import { TenantFeature } from './admin/entities/tenant-feature.entity';
import { TenantPhaseLink } from './admin/entities/tenant-phase-link.entity';
import { TenantGradeLink } from './admin/entities/tenant-grade-link.entity';
import { SubjectOffering } from './admin/entities/subject-offering.entity';
import { SubjectStream } from './admin/entities/subject-stream.entity';
import { AdmissionsProcessCard } from './admin/entities/admissions-process-card.entity';
import { AuditEvent } from './admin/entities/audit-event.entity';

// Modules
import { BrandsModule } from './brands/brands.module';
import { TenantsModule } from './tenants/tenants.module';
import { TenantsMiddleware } from './tenants/tenants.middleware';
import { BranchesModule } from './branches/branches.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DiscoveryModule } from './discovery/discovery.module';
import { AuditModule } from './audit/audit.module';
import { StorageModule } from './storage/storage.module';
import { PoliciesModule } from './policies/policies.module';
import { CommunicationModule } from './communication/communication.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TranslationModule } from './translation/translation.module';
import { SecurityModule } from './security/security.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AdminModule } from './admin/admin.module';
import { AdminPlatformModule } from './admin/admin-platform.module';

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
        entities: [
          Brand,
          Tenant,
          TenantDomain,
          TenantSettings,
          Branch,
          User,
          RoleAssignment,
          PolicyDocument,
          PolicyVersion,
          UserPolicyAcceptance,
          Thread,
          Message,
          ThreadMember,
          MessageReceipt,
          Notification,
          ParentChildLink,
          AnnouncementRead,
          AnnouncementReaction,
          TicketAction,
          MessageReport,
          DeviceToken,
          ContentTranslation,
          UserLanguagePreference,
          TenantSecurityPolicy,
          BranchSecurityPolicy,
          IpAllowlist,
          GeoZone,
          AdminDraft,
          DictPhase,
          DictGrade,
          DictClassGender,
          DictSubjectCategory,
          DictSubjectType,
          DictLanguageLevel,
          DictLanguageHL,
          DictLanguageFAL,
          DictSalutation,
          DictReligion,
          Subject,
          TenantFeature,
          TenantPhaseLink,
          TenantGradeLink,
          SubjectOffering,
          SubjectStream,
          AdmissionsProcessCard,
          AuditEvent,
        ],
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
    StorageModule,
    PoliciesModule,
    CommunicationModule,
    NotificationsModule,
    NotificationsModule,
    TranslationModule,
    SecurityModule,
    AttendanceModule,
    AdminModule,
    AdminPlatformModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes('*');
  }
}
