import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as firebaseAdmin from 'firebase-admin';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { StaffProfile } from '../entities/staff-profile.entity';
import { CreateStaffDto, UpdateStaffDto } from '../dto/staff.dto';
import { User, UserStatus } from '../../users/user.entity';
import { RoleAssignment, UserRole } from '../../users/role-assignment.entity';
import { AuditEvent, AuditAction } from '../entities/audit-event.entity';
import { EmailAuthService } from '../../auth/email-auth.service';
import { PasswordHistory } from '../../users/password-history.entity';

const PLATFORM_ROLES = ['platform_super_admin', 'brand_admin'];
const TENANT_ROLES = ['tenant_admin', 'main_branch_admin'];
const HR_ROLES = ['platform_super_admin', 'brand_admin', 'tenant_admin', 'main_branch_admin', 'hr_admin'];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/staff')
export class AdminStaffController {
  constructor(
    @InjectRepository(StaffProfile) private staffRepo: Repository<StaffProfile>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(RoleAssignment) private roleRepo: Repository<RoleAssignment>,
    @InjectRepository(AuditEvent) private auditRepo: Repository<AuditEvent>,
    @InjectRepository(PasswordHistory) private passwordHistoryRepo: Repository<PasswordHistory>,
    private dataSource: DataSource,
    private emailAuthService: EmailAuthService,
  ) {}

  /** Generate a readable temporary password */
  private generateTempPassword(): string {
    return 'Temp' + Math.random().toString(36).slice(2, 6) + '@' + Math.floor(Math.random() * 900 + 100);
  }

  /** Create Firebase account for a new user, returns the temp password used */
  private async createFirebaseAccount(email: string, displayName: string, tempPassword: string): Promise<void> {
    try {
      await firebaseAdmin.auth().createUser({
        email,
        password: tempPassword,
        displayName,
      });
    } catch (e: any) {
      if (e.code !== 'auth/email-already-exists') {
        console.warn('[Staff] Firebase account creation failed:', e.message);
      }
    }
  }

  /** Delete a user from Firebase by email */
  private async deleteFirebaseAccount(email: string): Promise<void> {
    try {
      const fbUser = await firebaseAdmin.auth().getUserByEmail(email);
      await firebaseAdmin.auth().deleteUser(fbUser.uid);
      console.log(`[Staff] Firebase account deleted for ${email}`);
    } catch (e: any) {
      if (e.code !== 'auth/user-not-found') {
        console.warn('[Staff] Firebase account deletion failed:', e.message);
      }
    }
  }

  /** Disable/enable a Firebase account by email */
  private async setFirebaseDisabled(email: string, disabled: boolean): Promise<void> {
    try {
      const fbUser = await firebaseAdmin.auth().getUserByEmail(email);
      await firebaseAdmin.auth().updateUser(fbUser.uid, { disabled });
    } catch (e: any) {
      if (e.code !== 'auth/user-not-found') {
        console.warn('[Staff] Firebase disable/enable failed:', e.message);
      }
    }
  }

  // ──────────────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────────────

  private getRole(req: any): string {
    return req.user?.role || req.user?.customClaims?.role || '';
  }

  private canManageStaff(req: any): boolean {
    const role = this.getRole(req);
    return HR_ROLES.some(r => role.includes(r));
  }

  private ensureAccess(req: any) {
    if (!this.canManageStaff(req)) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  private async logAudit(
    req: any,
    tenantId: string,
    action: AuditAction,
    entityId: string,
    before?: any,
    after?: any,
  ) {
    await this.auditRepo.save(this.auditRepo.create({
      actor_user_id: req.user?.uid || req.user?.dbUserId,
      tenant_id: tenantId,
      action,
      entity_type: 'staff_profile',
      entity_id: entityId,
      before: before || null,
      after: after || null,
      ip_address: req.ip,
      user_agent: req.headers?.['user-agent'],
    } as any));
  }

  // ──────────────────────────────────────────────────────────
  // GET / — List staff
  // ──────────────────────────────────────────────────────────

  @Get()
  async list(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Query('search') search?: string,
    @Query('branch_id') branchId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    this.ensureAccess(req);

    const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || '25', 10) || 25));
    const offset = (pageNum - 1) * limitNum;

    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        'sp.*',
        'u.email       AS "user_email"',
        'u.display_name AS "user_display_name"',
        'u.first_name  AS "user_first_name"',
        'u.last_name   AS "user_last_name"',
        'u.status       AS "user_status"',
      ])
      .from('staff_profiles', 'sp')
      .innerJoin('users', 'u', 'u.id = sp.user_id')
      .where('sp.tenant_id = :tenantId', { tenantId });

    if (branchId) {
      qb.andWhere('sp.branch_id = :branchId', { branchId });
    }

    if (search) {
      qb.andWhere(
        '(u.first_name ILIKE :search OR u.last_name ILIKE :search OR u.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await qb.clone().select('COUNT(*)', 'count').getRawOne();

    const staff = await qb
      .orderBy('sp.created_at', 'DESC')
      .offset(offset)
      .limit(limitNum)
      .getRawMany();

    return {
      staff,
      total: parseInt(total.count, 10),
      page: pageNum,
      limit: limitNum,
    };
  }

  // ──────────────────────────────────────────────────────────
  // GET /:id — Get single staff
  // ──────────────────────────────────────────────────────────

  @Get(':id')
  async getOne(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    this.ensureAccess(req);

    const row = await this.dataSource
      .createQueryBuilder()
      .select([
        'sp.*',
        'u.email       AS "user_email"',
        'u.display_name AS "user_display_name"',
        'u.first_name  AS "user_first_name"',
        'u.last_name   AS "user_last_name"',
        'u.status       AS "user_status"',
      ])
      .from('staff_profiles', 'sp')
      .innerJoin('users', 'u', 'u.id = sp.user_id')
      .where('sp.id = :id', { id })
      .andWhere('sp.tenant_id = :tenantId', { tenantId })
      .getRawOne();

    if (!row) throw new NotFoundException('Staff member not found');
    return row;
  }

  // ──────────────────────────────────────────────────────────
  // POST / — Create staff (transactional)
  // ──────────────────────────────────────────────────────────

  @Post()
  async create(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Body() body: CreateStaffDto,
  ) {
    this.ensureAccess(req);

    // Generate temp password for the new staff member
    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const result = await this.dataSource.transaction(async (manager) => {
      // 1. Create User with password hash + must_change_password
      const user = manager.create(User, {
        email: body.email.toLowerCase().trim(),
        first_name: body.first_name,
        last_name: body.last_name,
        display_name: `${body.first_name} ${body.last_name}`,
        password_hash: passwordHash,
        must_change_password: true,
        status: UserStatus.ACTIVE,
      });
      const savedUser = await manager.save(User, user);

      // 2. Compute derived fields
      const staffFullName = `${body.first_name} ${body.last_name}`;
      let staffAge: number | null = null;
      if (body.date_of_birth) {
        const dob = new Date(body.date_of_birth);
        const now = new Date();
        staffAge = now.getFullYear() - dob.getFullYear();
        const md = now.getMonth() - dob.getMonth();
        if (md < 0 || (md === 0 && now.getDate() < dob.getDate())) staffAge--;
      }

      // 3. Create StaffProfile
      const profile = manager.create(StaffProfile, {
        tenant_id: tenantId,
        user_id: savedUser.id,
        branch_id: body.branch_id || null,
        title_code: body.title_code || null,
        date_of_birth: body.date_of_birth || null,
        full_name: staffFullName,
        age: staffAge,
        gender_code: body.gender_code || null,
        citizenship_type_code: body.citizenship_type_code || null,
        id_number: body.id_number || null,
        passport_number: body.passport_number || null,
        address: body.address || null,
        joining_date: body.joining_date || null,
        employment_type_code: body.employment_type_code || null,
        assigned_roles: body.assigned_roles || [],
        sace_number: body.sace_number || null,
        teaching_level_code: body.teaching_level_code || null,
        reqv_level_code: body.reqv_level_code || null,
        phone_mobile: body.phone_mobile || null,
        phone_work: body.phone_work || null,
        medical_disabilities: body.medical_disabilities || [],
        medical_aid_provider_code: body.medical_aid_provider_code || null,
        emergency_contacts: body.emergency_contacts || [],
        documents: body.documents || [],
      } as any);
      const savedProfile = await manager.save(StaffProfile, profile);

      // 3. Create RoleAssignments
      if (Array.isArray(body.assigned_roles)) {
        for (const roleStr of body.assigned_roles) {
          const roleAssignment = manager.create(RoleAssignment, {
            user_id: savedUser.id,
            tenant_id: tenantId,
            branch_id: body.branch_id || null,
            role: roleStr as UserRole,
            is_active: true,
          } as any);
          await manager.save(RoleAssignment, roleAssignment);
        }
      }

      // 4. Audit event
      await manager.save(AuditEvent, manager.create(AuditEvent, {
        actor_user_id: req.user?.uid || req.user?.dbUserId,
        tenant_id: tenantId,
        action: AuditAction.STAFF_CREATE,
        entity_type: 'staff_profile',
        entity_id: savedProfile.id,
        before: null,
        after: { user_id: savedUser.id, email: body.email, assigned_roles: body.assigned_roles },
        ip_address: req.ip,
        user_agent: req.headers?.['user-agent'],
      } as any));

      return {
        ...savedProfile,
        user_email: savedUser.email,
        user_display_name: savedUser.display_name,
        user_first_name: savedUser.first_name,
        user_last_name: savedUser.last_name,
        user_status: savedUser.status,
      };
    });

    // After successful DB transaction, create Firebase account
    const displayName = `${body.first_name} ${body.last_name}`;
    await this.createFirebaseAccount(body.email.toLowerCase().trim(), displayName, tempPassword);

    // Record temp password in history (so it can't be reused)
    await this.passwordHistoryRepo.save({
      user_id: result.user_id,
      password_hash: passwordHash,
      source: 'temp',
    } as Partial<PasswordHistory>);

    // Send welcome email with temp password
    await this.emailAuthService.sendWelcomeEmail(
      body.email.toLowerCase().trim(),
      displayName,
      tempPassword,
    );

    return { ...result, tempPassword };
  }

  // ──────────────────────────────────────────────────────────
  // PUT /:id — Update staff
  // ──────────────────────────────────────────────────────────

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateStaffDto,
  ) {
    this.ensureAccess(req);

    const profile = await this.staffRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!profile) throw new NotFoundException('Staff member not found');

    const before = { ...profile };

    // Update profile fields
    const profileFields = [
      'branch_id', 'title_code', 'date_of_birth', 'gender_code',
      'citizenship_type_code', 'id_number', 'passport_number', 'address',
      'joining_date', 'employment_type_code', 'assigned_roles',
      'sace_number', 'teaching_level_code', 'reqv_level_code',
      'phone_mobile', 'phone_work', 'medical_disabilities',
      'medical_aid_provider_code', 'emergency_contacts', 'documents',
      'race_code', 'religion_code', 'photo_url',
      'medical_aid_number', 'allergies', 'conditions', 'family_doctor_id',
    ];
    for (const field of profileFields) {
      if (body[field] !== undefined) {
        (profile as any)[field] = body[field];
      }
    }
    await this.staffRepo.save(profile);

    // Update linked User fields if provided
    const user = await this.userRepo.findOne({ where: { id: profile.user_id } });
    if (user) {
      let userChanged = false;
      if (body.first_name !== undefined) { user.first_name = body.first_name; userChanged = true; }
      if (body.last_name !== undefined) { user.last_name = body.last_name; userChanged = true; }
      if (body.email !== undefined) { user.email = body.email; userChanged = true; }
      if (body.first_name !== undefined || body.last_name !== undefined) {
        user.display_name = `${user.first_name} ${user.last_name}`;
      }
      if (userChanged) await this.userRepo.save(user);
    }

    // Audit
    await this.logAudit(req, tenantId, AuditAction.STAFF_EDIT, id, before, body);

    return profile;
  }

  // ──────────────────────────────────────────────────────────
  // PATCH /:id/toggle — Toggle active status
  // ──────────────────────────────────────────────────────────

  @Patch(':id/toggle')
  async toggleActive(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    this.ensureAccess(req);

    const profile = await this.staffRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!profile) throw new NotFoundException('Staff member not found');

    const user = await this.userRepo.findOne({ where: { id: profile.user_id } });
    if (!user) throw new NotFoundException('Linked user not found');

    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    user.status = newStatus as any;
    await this.userRepo.save(user);

    // Sync with Firebase — disable/enable the Firebase account
    await this.setFirebaseDisabled(user.email, newStatus === 'disabled');

    await this.logAudit(req, tenantId, AuditAction.STAFF_EDIT, id,
      { status: user.status === 'active' ? 'disabled' : 'active' },
      { status: newStatus },
    );

    return { id: profile.id, is_active: newStatus === 'active' };
  }

  // ──────────────────────────────────────────────────────────
  // DELETE /:id — Delete staff (deactivate + remove from Firebase)
  // ──────────────────────────────────────────────────────────

  @Delete(':id')
  async remove(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    this.ensureAccess(req);

    const profile = await this.staffRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!profile) throw new NotFoundException('Staff member not found');

    const user = await this.userRepo.findOne({ where: { id: profile.user_id } });
    if (!user) throw new NotFoundException('Linked user not found');

    // 1. Deactivate all role assignments for this user in this tenant
    await this.roleRepo.update(
      { user_id: user.id, tenant_id: tenantId } as any,
      { is_active: false },
    );

    // 2. Deactivate user
    user.status = UserStatus.DISABLED;
    await this.userRepo.save(user);

    // 3. Delete from Firebase
    await this.deleteFirebaseAccount(user.email);

    // 4. Audit
    await this.logAudit(req, tenantId, AuditAction.STAFF_EDIT, id, { status: 'active' }, { status: 'deleted', firebase: 'deleted' });

    return { success: true, message: 'Staff member deactivated and Firebase account removed' };
  }
}
