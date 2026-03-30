import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { Tenant } from '../tenants/tenant.entity';
import { TenantDomain } from '../tenants/tenant-domain.entity';
import { User } from '../users/user.entity';
import { RoleAssignment } from '../users/role-assignment.entity';
import { TenantMembership } from '../auth/entities/tenant-membership.entity';
import { LinkedTenantAccess } from '../auth/entities/linked-tenant-access.entity';

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

// New domain entities
import { EnrollmentApplication } from './entities/enrollment-application.entity';
import { LearnerProfile } from './entities/learner-profile.entity';
import { GuardianProfile } from './entities/guardian-profile.entity';
import { StaffProfile } from './entities/staff-profile.entity';
import { Curriculum } from './entities/curriculum.entity';
import { FamilyDoctor } from './entities/family-doctor.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { Family } from './entities/family.entity';
import { EldestLearner } from './entities/eldest-learner.entity';

// New dictionary entities
import { DictGender } from './entities/dict-gender.entity';
import { DictRace } from './entities/dict-race.entity';
import { DictCountry } from './entities/dict-country.entity';
import { DictPermitType } from './entities/dict-permit-type.entity';
import { DictTypicalAge } from './entities/dict-typical-age.entity';
import { DictOfferingRole } from './entities/dict-offering-role.entity';
import { DictSelectionGroup } from './entities/dict-selection-group.entity';
import { DictExtracurricularActivity } from './entities/dict-extracurricular-activity.entity';
import { DictParentType } from './entities/dict-parent-type.entity';
import { DictPaymentOption } from './entities/dict-payment-option.entity';
import { DictEmploymentType } from './entities/dict-employment-type.entity';

import { AdminTenantsController } from './controllers/admin-tenants.controller';
import { AdminDictController } from './controllers/admin-dict.controller';
import { AdminSubjectsController } from './controllers/admin-subjects.controller';
import { AdminFeaturesController } from './controllers/admin-features.controller';
import { AdminPeopleController } from './controllers/admin-people.controller';
import { AdminSchoolDataController } from './controllers/admin-school-data.controller';
import { AdminAdmissionsController } from './controllers/admin-admissions.controller';
import { AdminAuditController } from './controllers/admin-audit.controller';
import { AdminEnrollmentController } from './controllers/admin-enrollment.controller';
import { AdminStaffController } from './controllers/admin-staff.controller';
import { AdminCurriculaController } from './controllers/admin-curricula.controller';
import { AdminGradesClassesController } from './controllers/admin-grades-classes.controller';
import { AdminFamilyDoctorsController } from './controllers/admin-family-doctors.controller';
import { AdminEmergencyContactsController } from './controllers/admin-emergency-contacts.controller';
import { AdminFamiliesController } from './controllers/admin-families.controller';
import { AdminCalendarController } from './controllers/admin-calendar.controller';
import { AcademicCalendarDay } from './entities/academic-calendar-day.entity';
import { ParentChildLink } from '../communication/parent-child-link.entity';
import { SchoolClass } from '../attendance/entities/class.entity';

// Incident + Emergency entities
import { Incident } from './entities/incident.entity';
import { EmergencyAlert } from './entities/emergency-alert.entity';
import { EmergencyAcknowledgement } from './entities/emergency-acknowledgement.entity';
import { EmergencyRollCall } from './entities/emergency-roll-call.entity';
import { EmergencyTask } from './entities/emergency-task.entity';
import { AdminIncidentsController } from './controllers/admin-incidents.controller';
import { AdminEmergenciesController } from './controllers/admin-emergencies.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminBulkImportController } from './controllers/admin-bulk-import.controller';
import { AdminTemplateController } from './controllers/admin-templates.controller';
import { AdminLinkedAccessController, MyLinkedTenantsController } from './controllers/admin-linked-access.controller';
import { BulkImportService } from './services/bulk-import.service';
import { TemplateGeneratorService } from './services/template-generator.service';
import { FormProvisioningService } from './services/form-provisioning.service';
import { ImportAudit } from './entities/import-audit.entity';
import { PasswordHistory } from '../users/password-history.entity';
import { TenantSubscription } from '../tenants/tenant-subscription.entity';
import { TenantPayment } from '../tenants/tenant-payment.entity';
import { AdminSubscriptionsController } from './controllers/admin-subscriptions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      User,
      RoleAssignment,
      PasswordHistory,
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
      EnrollmentApplication,
      LearnerProfile,
      GuardianProfile,
      StaffProfile,
      Curriculum,
      FamilyDoctor,
      EmergencyContact,
      Family,
      EldestLearner,
      DictGender,
      DictRace,
      DictCountry,
      DictPermitType,
      DictTypicalAge,
      DictOfferingRole,
      DictSelectionGroup,
      DictExtracurricularActivity,
      DictParentType,
      DictPaymentOption,
      DictEmploymentType,
      ParentChildLink,
      SchoolClass,
      AcademicCalendarDay,
      Incident,
      EmergencyAlert,
      EmergencyAcknowledgement,
      EmergencyRollCall,
      EmergencyTask,
      ImportAudit,
      TenantDomain,
      TenantMembership,
      LinkedTenantAccess,
      TenantSubscription,
      TenantPayment,
    ]),
    AuthModule,
    StorageModule,
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
    AdminEnrollmentController,
    AdminStaffController,
    AdminCurriculaController,
    AdminGradesClassesController,
    AdminFamilyDoctorsController,
    AdminEmergencyContactsController,
    AdminFamiliesController,
    AdminCalendarController,
    AdminIncidentsController,
    AdminEmergenciesController,
    AdminUsersController,
    AdminBulkImportController,
    AdminTemplateController,
    AdminLinkedAccessController,
    MyLinkedTenantsController,
    AdminSubscriptionsController,
  ],
  providers: [
    BulkImportService,
    TemplateGeneratorService,
    FormProvisioningService,
  ],
  exports: [
    BulkImportService,
    TemplateGeneratorService,
    FormProvisioningService,
  ],
})
export class AdminPlatformModule {}
