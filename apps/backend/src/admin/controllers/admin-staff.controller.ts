import {
  Controller, Get, Post, Put, Patch, Body, Param, Query,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { StaffProfile } from '../entities/staff-profile.entity';
import { User } from '../../users/user.entity';
import { RoleAssignment, UserRole } from '../../users/role-assignment.entity';
import { AuditEvent, AuditAction } from '../entities/audit-event.entity';

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
    private dataSource: DataSource,
  ) {}

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
    @Body() body: any,
  ) {
    this.ensureAccess(req);

    if (!body.email || !body.first_name || !body.last_name) {
      throw new BadRequestException('email, first_name, and last_name are required');
    }

    const result = await this.dataSource.transaction(async (manager) => {
      // 1. Create User
      const user = manager.create(User, {
        email: body.email,
        first_name: body.first_name,
        last_name: body.last_name,
        display_name: `${body.first_name} ${body.last_name}`,
      });
      const savedUser = await manager.save(User, user);

      // 2. Create StaffProfile
      const profile = manager.create(StaffProfile, {
        tenant_id: tenantId,
        user_id: savedUser.id,
        branch_id: body.branch_id || null,
        title_code: body.title_code || null,
        date_of_birth: body.date_of_birth || null,
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

    return result;
  }

  // ──────────────────────────────────────────────────────────
  // PUT /:id — Update staff
  // ──────────────────────────────────────────────────────────

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
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

    return { id: profile.id, is_active: newStatus === 'active' };
  }
}
