import {
  Controller, Get, Post, Put, Patch, Body, Param, Query,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';

import { EnrollmentApplication, EnrollmentStatus } from '../entities/enrollment-application.entity';
import { UpdateEnrollmentDraftDto } from '../dto/enrollment.dto';
import { SubmitEnrollmentDto } from '../dto/enrollment.dto';
import { RejectEnrollmentDto } from '../dto/enrollment.dto';
import { LearnerProfile } from '../entities/learner-profile.entity';
import { GuardianProfile } from '../entities/guardian-profile.entity';
import { User } from '../../users/user.entity';
import { RoleAssignment, UserRole } from '../../users/role-assignment.entity';
import { AuditEvent, AuditAction } from '../entities/audit-event.entity';
import { EmergencyContact } from '../entities/emergency-contact.entity';
import { ParentChildLink } from '../../communication/parent-child-link.entity';
import { SchoolClass } from '../../attendance/entities/class.entity';

const PLATFORM_ROLES = ['platform_super_admin', 'brand_admin'];
const TENANT_ROLES = ['tenant_admin', 'main_branch_admin'];
const ENROLLMENT_ROLES = ['platform_super_admin', 'brand_admin', 'tenant_admin', 'main_branch_admin', 'admissions_officer'];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/enrollment')
export class AdminEnrollmentController {
  constructor(
    @InjectRepository(EnrollmentApplication) private enrollmentRepo: Repository<EnrollmentApplication>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(LearnerProfile) private learnerProfileRepo: Repository<LearnerProfile>,
    @InjectRepository(GuardianProfile) private guardianProfileRepo: Repository<GuardianProfile>,
    @InjectRepository(RoleAssignment) private roleAssignmentRepo: Repository<RoleAssignment>,
    @InjectRepository(AuditEvent) private auditRepo: Repository<AuditEvent>,
    @InjectRepository(EmergencyContact) private emergencyContactRepo: Repository<EmergencyContact>,
    @InjectRepository(ParentChildLink) private parentChildLinkRepo: Repository<ParentChildLink>,
    @InjectRepository(SchoolClass) private schoolClassRepo: Repository<SchoolClass>,
    private dataSource: DataSource,
  ) {}

  private getRole(req: any): string {
    return req.user?.role || req.user?.customClaims?.role || '';
  }

  private isPlatform(req: any): boolean {
    const role = this.getRole(req);
    return PLATFORM_ROLES.some(r => role.includes(r));
  }

  private isTenantAdmin(req: any): boolean {
    const role = this.getRole(req);
    return TENANT_ROLES.some(r => role.includes(r));
  }

  private canEnrollmentAction(req: any): boolean {
    const role = this.getRole(req);
    return ENROLLMENT_ROLES.some(r => role.includes(r));
  }

  // ─── POST / — Create draft application ───────────────────────────
  @Post()
  async createDraft(@Param('tenantId') tenantId: string) {
    const application = this.enrollmentRepo.create({
      tenant_id: tenantId,
      status: EnrollmentStatus.DRAFT,
    });
    return this.enrollmentRepo.save(application);
  }

  // ─── PUT /:id — Update draft (step-save) ─────────────────────────
  @Put(':id')
  async updateDraft(
    @Param('id') id: string,
    @Body() body: UpdateEnrollmentDraftDto,
  ) {
    const application = await this.enrollmentRepo.findOne({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== EnrollmentStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT applications can be updated');
    }

    const updatableFields = [
      'placement_data', 'learner_data', 'academic_data', 'subjects_data',
      'aftercare_data', 'medical_data', 'guardians_data', 'emergency_contacts',
      'uploaded_documents', 'current_step', 'document_checklist_ack', 'acceptance_ack',
      'branch_id', 'brand_id', 'main_branch_id',
    ];
    for (const field of updatableFields) {
      if ((body as any)[field] !== undefined) {
        (application as any)[field] = (body as any)[field];
      }
    }

    return this.enrollmentRepo.save(application);
  }

  // ─── GET /:id — Get single application ────────────────────────────
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const application = await this.enrollmentRepo.findOne({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  // ─── POST /:id/submit — Submit application ───────────────────────
  @Post(':id/submit')
  async submit(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: SubmitEnrollmentDto,
  ) {
    const application = await this.enrollmentRepo.findOne({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== EnrollmentStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT applications can be submitted');
    }

    application.status = EnrollmentStatus.SUBMITTED;
    application.submitted_at = new Date();
    if (body.submitted_by_email) application.submitted_by_email = body.submitted_by_email;
    if (body.submitted_by_phone) application.submitted_by_phone = body.submitted_by_phone;

    const saved = await this.enrollmentRepo.save(application);

    await this.auditRepo.save(this.auditRepo.create({
      tenant_id: tenantId,
      action: AuditAction.ENROLLMENT_SUBMIT,
      entity_type: 'enrollment_application',
      entity_id: saved.id,
      after: { status: saved.status },
    }));

    return saved;
  }

  // ─── GET / — List applications (auth required) ────────────────────
  @Get()
  async list(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const canRead = this.isPlatform(req) || this.isTenantAdmin(req);
    if (!canRead) throw new ForbiddenException('Insufficient permissions');

    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const limitNum = Math.max(1, parseInt(limit || '25', 10));

    const where: any = { tenant_id: tenantId };
    if (status) where.status = status;

    const [applications, total] = await this.enrollmentRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });

    return { applications, total, page: pageNum, limit: limitNum };
  }

  // ─── POST /:id/approve — Approve application (transactional) ─────
  @Post(':id/approve')
  async approve(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    if (!this.canEnrollmentAction(req)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const application = await this.enrollmentRepo.findOne({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== EnrollmentStatus.SUBMITTED && application.status !== EnrollmentStatus.UNDER_REVIEW) {
      throw new BadRequestException('Application must be in SUBMITTED or UNDER_REVIEW status');
    }

    const reviewerUserId = req.user?.uid || req.user?.dbUserId || null;

    const result = await this.dataSource.transaction(async (manager) => {
      // 1. Create User for learner
      const learnerData = application.learner_data || {};
      const guardiansData = application.guardians_data || [];
      const academicData = application.academic_data || {};
      const subjectsData = application.subjects_data || {};
      const medicalData = application.medical_data || {};
      const placementData = application.placement_data || {};

      // Compute derived fields
      const fullName = [learnerData.first_name, learnerData.last_name].filter(Boolean).join(' ') || undefined;
      let computedAge: number | null = null;
      if (learnerData.date_of_birth) {
        const dob = new Date(learnerData.date_of_birth);
        const now = new Date();
        computedAge = now.getFullYear() - dob.getFullYear();
        const monthDiff = now.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) computedAge--;
      }
      let permitStatus: string | null = null;
      let permitDaysToExpiry: number | null = null;
      if (learnerData.permit_expiry_date) {
        const expiry = new Date(learnerData.permit_expiry_date);
        const now = new Date();
        permitDaysToExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        permitStatus = permitDaysToExpiry > 0 ? 'valid' : 'expired';
      }

      const learnerEmail = (guardiansData[0]?.email) ||
        `learner_${application.id.substring(0, 8)}@placeholder.local`;

      const learnerUser = manager.create(User, {
        email: learnerEmail,
        first_name: learnerData.first_name || undefined,
        last_name: learnerData.last_name || undefined,
        display_name: fullName,
      } as any);
      const savedLearnerUser = await manager.save(User, learnerUser);

      // 2. Create LearnerProfile
      const learnerProfile = manager.create(LearnerProfile, {
        tenant_id: tenantId,
        user_id: savedLearnerUser.id,
        branch_id: application.branch_id || placementData.branch_id || null,
        enrollment_application_id: application.id,
        date_of_birth: learnerData.date_of_birth || null,
        gender_code: learnerData.gender_code || null,
        religion_code: learnerData.religion_code || null,
        race_code: learnerData.race_code || null,
        citizenship_type_code: learnerData.citizenship_type_code || null,
        id_number: learnerData.id_number || null,
        passport_number: learnerData.passport_number || null,
        permit_number: learnerData.permit_number || null,
        permit_type_code: learnerData.permit_type_code || null,
        address: learnerData.address || null,
        phase_code: placementData.phase_code || academicData.phase_code || null,
        grade_code: placementData.grade_code || academicData.grade_code || null,
        previous_school: academicData.previous_school || null,
        starting_date: academicData.starting_date || null,
        repeated_grades: academicData.repeated_grades || [],
        home_language_code: academicData.home_language_code || null,
        fal_code: academicData.fal_code || null,
        hl_code: academicData.hl_code || null,
        subject_ids: subjectsData.subject_ids || [],
        stream_code: subjectsData.stream_code || null,
        support_profile_code: medicalData.support_profile_code || null,
        educational_disabilities: medicalData.educational_disabilities || [],
        medical: medicalData || null,
        full_name: fullName || null,
        age: computedAge,
        permit_status: permitStatus,
        permit_days_to_expiry: permitDaysToExpiry,
      } as any);
      await manager.save(LearnerProfile, learnerProfile);

      // 3. Create RoleAssignment for learner
      const learnerRole = manager.create(RoleAssignment, {
        user_id: savedLearnerUser.id,
        tenant_id: tenantId,
        role: UserRole.LEARNER,
      });
      await manager.save(RoleAssignment, learnerRole);

      // 4. For each guardian: create User (if not existing), GuardianProfile, RoleAssignment, ParentChildLink
      for (const guardian of guardiansData) {
        let guardianUser: User | null = null;
        if (guardian.email) {
          guardianUser = await manager.findOne(User, { where: { email: guardian.email } });
        }
        if (!guardianUser) {
          guardianUser = manager.create(User, {
            email: guardian.email || `guardian_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@placeholder.local`,
            first_name: guardian.first_name || undefined,
            last_name: guardian.last_name || undefined,
            display_name: [guardian.first_name, guardian.last_name].filter(Boolean).join(' ') || undefined,
            phone_e164: guardian.phone_mobile || undefined,
          } as any);
          guardianUser = await manager.save(User, guardianUser);
        }

        const guardianProfile = manager.create(GuardianProfile, {
          tenant_id: tenantId,
          user_id: guardianUser.id,
          title_code: guardian.title_code || undefined,
          date_of_birth: guardian.date_of_birth || undefined,
          gender_code: guardian.gender_code || undefined,
          religion_code: guardian.religion_code || undefined,
          race_code: guardian.race_code || undefined,
          citizenship_type_code: guardian.citizenship_type_code || undefined,
          id_number: guardian.id_number || undefined,
          passport_number: guardian.passport_number || undefined,
          permit_number: guardian.permit_number || undefined,
          permit_type_code: guardian.permit_type_code || undefined,
          marital_status_code: guardian.marital_status_code || undefined,
          relationship_code: guardian.relationship_code || undefined,
          address: guardian.address || undefined,
          phone_mobile: guardian.phone_mobile ? { number: guardian.phone_mobile } : undefined,
          phone_work: guardian.phone_work ? { number: guardian.phone_work } : undefined,
          phone_home: guardian.phone_home ? { number: guardian.phone_home } : undefined,
          email_primary: guardian.email || undefined,
          email_secondary: guardian.email_secondary || undefined,
          parent_type_code: guardian.parent_type_code || undefined,
          company_name: guardian.company_name || undefined,
          is_fee_payer: guardian.is_fee_payer || false,
          payment_option_code: guardian.payment_option_code || undefined,
          occupation: guardian.occupation || undefined,
          employer: guardian.employer || undefined,
        } as any);
        await manager.save(GuardianProfile, guardianProfile);

        // Create RoleAssignment for parent
        const existingRole = await manager.findOne(RoleAssignment, {
          where: { user_id: guardianUser.id, tenant_id: tenantId, role: UserRole.PARENT },
        });
        if (!existingRole) {
          const parentRole = manager.create(RoleAssignment, {
            user_id: guardianUser.id,
            tenant_id: tenantId,
            role: UserRole.PARENT,
          });
          await manager.save(RoleAssignment, parentRole);
        }

        // Create ParentChildLink
        const parentChildLink = manager.create(ParentChildLink, {
          tenant_id: tenantId,
          parent_user_id: guardianUser.id,
          child_user_id: savedLearnerUser.id,
        });
        await manager.save(ParentChildLink, parentChildLink);
      }

      // 5. For each emergency contact: create EmergencyContact record
      const emergencyContacts = application.emergency_contacts || [];
      for (const ec of emergencyContacts) {
        const contact = manager.create(EmergencyContact, {
          tenant_id: tenantId,
          linked_user_id: savedLearnerUser.id,
          contact_name: ec.contact_name || ec.name || 'Unknown',
          relationship_code: ec.relationship_code || null,
          mobile_number: ec.mobile_number || ec.phone || null,
          alternate_number: ec.alternate_number || null,
          email: ec.email || null,
          priority_level: ec.priority_level || 1,
          authorized_to_pick_up: ec.authorized_to_pick_up || false,
          medical_alert_notes: ec.medical_alert_notes || null,
        });
        await manager.save(EmergencyContact, contact);
      }

      // 6. Update application
      application.status = EnrollmentStatus.APPROVED;
      application.reviewed_by_user_id = reviewerUserId;
      application.created_learner_user_id = savedLearnerUser.id;
      const updatedApplication = await manager.save(EnrollmentApplication, application);

      // 7. Create audit event
      const audit = manager.create(AuditEvent, {
        tenant_id: tenantId,
        actor_user_id: reviewerUserId,
        action: AuditAction.ENROLLMENT_APPROVE,
        entity_type: 'enrollment_application',
        entity_id: updatedApplication.id,
        after: { status: updatedApplication.status, created_learner_user_id: savedLearnerUser.id },
      });
      await manager.save(AuditEvent, audit);

      return updatedApplication;
    });

    return result;
  }

  // ─── POST /:id/reject — Reject application ───────────────────────
  @Post(':id/reject')
  async reject(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: RejectEnrollmentDto,
  ) {
    if (!this.canEnrollmentAction(req)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const application = await this.enrollmentRepo.findOne({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== EnrollmentStatus.SUBMITTED && application.status !== EnrollmentStatus.UNDER_REVIEW) {
      throw new BadRequestException('Application must be in SUBMITTED or UNDER_REVIEW status');
    }

    const reviewerUserId = req.user?.uid || req.user?.dbUserId || null;

    application.status = EnrollmentStatus.REJECTED;
    application.rejection_reason = body.reason;
    application.reviewed_by_user_id = reviewerUserId;

    const saved = await this.enrollmentRepo.save(application);

    await this.auditRepo.save(this.auditRepo.create({
      tenant_id: tenantId,
      actor_user_id: reviewerUserId,
      action: AuditAction.ENROLLMENT_REJECT,
      entity_type: 'enrollment_application',
      entity_id: saved.id,
      after: { status: saved.status, rejection_reason: body.reason },
    }));

    return saved;
  }

  // ─── GET /capacity/:branchId/:gradeCode — Class capacity check ───
  @Get('capacity/:branchId/:gradeCode')
  async classCapacity(
    @Param('branchId') branchId: string,
    @Param('gradeCode') gradeCode: string,
  ) {
    const classes = await this.schoolClassRepo.find({
      where: { branch_id: branchId, grade_id: gradeCode },
    });

    return classes.map(c => ({
      id: c.id,
      class_name: c.section_name,
      grade_code: c.grade_id,
      capacity_max: null,
      capacity_current: c.learner_user_ids?.length || 0,
    }));
  }
}
