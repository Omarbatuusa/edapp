import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';
import { RoleAssignment } from '../users/role-assignment.entity';

import { DictPhase } from './entities/dict-phase.entity';
import { DictGrade } from './entities/dict-grade.entity';
import { DictClassGender } from './entities/dict-class-gender.entity';
import { DictSubjectCategory } from './entities/dict-subject-category.entity';
import { DictSubjectType } from './entities/dict-subject-type.entity';
import { DictLanguageLevel } from './entities/dict-language-level.entity';
import { DictLanguageHL } from './entities/dict-language-hl.entity';
import { DictLanguageFAL } from './entities/dict-language-fal.entity';
import { DictSalutation } from './entities/dict-salutation.entity';
import { DictReligion } from './entities/dict-religion.entity';
import { Subject } from './entities/subject.entity';
import { TenantFeature } from './entities/tenant-feature.entity';
import { TenantPhaseLink } from './entities/tenant-phase-link.entity';
import { TenantGradeLink } from './entities/tenant-grade-link.entity';
import { SubjectOffering } from './entities/subject-offering.entity';
import { SubjectStream } from './entities/subject-stream.entity';
import { AdmissionsProcessCard } from './entities/admissions-process-card.entity';
import { AuditEvent } from './entities/audit-event.entity';

import { AdminTenantsController } from './controllers/admin-tenants.controller';
import { AdminDictController } from './controllers/admin-dict.controller';
import { AdminSubjectsController } from './controllers/admin-subjects.controller';
import { AdminFeaturesController } from './controllers/admin-features.controller';
import { AdminPeopleController } from './controllers/admin-people.controller';
import { AdminSchoolDataController } from './controllers/admin-school-data.controller';
import { AdminAdmissionsController } from './controllers/admin-admissions.controller';
import { AdminAuditController } from './controllers/admin-audit.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      User,
      RoleAssignment,
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
    ]),
    AuthModule,
  ],
  controllers: [
    AdminTenantsController,
    AdminDictController,
    AdminSubjectsController,
    AdminFeaturesController,
    AdminPeopleController,
    AdminSchoolDataController,
    AdminAdmissionsController,
    AdminAuditController,
  ],
})
export class AdminPlatformModule {}
