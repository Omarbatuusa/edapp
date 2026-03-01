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
import { DictTeachingLeadershipStaff } from './entities/dict-teaching-leadership-staff.entity';
import { DictNonTeachingSupportStaff } from './entities/dict-non-teaching-support-staff.entity';
import { DictOptionalAdminRole } from './entities/dict-optional-admin-role.entity';
import { DictCurriculumAuthority } from './entities/dict-curriculum-authority.entity';
import { DictCertificationType } from './entities/dict-certification-type.entity';
import { DictAcademicDocument } from './entities/dict-academic-document.entity';
import { DictReqvLevel } from './entities/dict-reqv-level.entity';
import { DictCitizenshipType } from './entities/dict-citizenship-type.entity';
import { DictMedicalAidProvider } from './entities/dict-medical-aid-provider.entity';
import { DictEmergencyRelationship } from './entities/dict-emergency-relationship.entity';
import { DictMaritalStatus } from './entities/dict-marital-status.entity';
import { DictCertSubjectProvider } from './entities/dict-cert-subject-provider.entity';
import { DictTeachingLevel } from './entities/dict-teaching-level.entity';
import { DictAcademicYearStructure } from './entities/dict-academic-year-structure.entity';
import { DictQualificationPathway } from './entities/dict-qualification-pathway.entity';
import { DictExamBody } from './entities/dict-exam-body.entity';
import { DictCurriculumName } from './entities/dict-curriculum-name.entity';
import { DictMedicalDisability } from './entities/dict-medical-disability.entity';
import { DictSchoolAllergy } from './entities/dict-school-allergy.entity';
import { DictPsychologicalIssue } from './entities/dict-psychological-issue.entity';
import { DictEducationalDisability } from './entities/dict-educational-disability.entity';
import { DictSupportProfile } from './entities/dict-support-profile.entity';
import { DictTherapyType } from './entities/dict-therapy-type.entity';
import { DictBloodType } from './entities/dict-blood-type.entity';
import { DictMonth } from './entities/dict-month.entity';
import { DictProgrammeType } from './entities/dict-programme-type.entity';
import { DictSubjectLanguageLevel } from './entities/dict-subject-language-level.entity';
import { DictAssessmentModel } from './entities/dict-assessment-model.entity';
import { DictSubjectGroup } from './entities/dict-subject-group.entity';
import { DictHomeLanguage } from './entities/dict-home-language.entity';
import { DictParentRight } from './entities/dict-parent-right.entity';
import { DictCompulsorySubject } from './entities/dict-compulsory-subject.entity';
import { DictSubject } from './entities/dict-subject.entity';
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
      DictTeachingLeadershipStaff,
      DictNonTeachingSupportStaff,
      DictOptionalAdminRole,
      DictCurriculumAuthority,
      DictCertificationType,
      DictAcademicDocument,
      DictReqvLevel,
      DictCitizenshipType,
      DictMedicalAidProvider,
      DictEmergencyRelationship,
      DictMaritalStatus,
      DictCertSubjectProvider,
      DictTeachingLevel,
      DictAcademicYearStructure,
      DictQualificationPathway,
      DictExamBody,
      DictCurriculumName,
      DictMedicalDisability,
      DictSchoolAllergy,
      DictPsychologicalIssue,
      DictEducationalDisability,
      DictSupportProfile,
      DictTherapyType,
      DictBloodType,
      DictMonth,
      DictProgrammeType,
      DictSubjectLanguageLevel,
      DictAssessmentModel,
      DictSubjectGroup,
      DictHomeLanguage,
      DictParentRight,
      DictCompulsorySubject,
      DictSubject,
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
