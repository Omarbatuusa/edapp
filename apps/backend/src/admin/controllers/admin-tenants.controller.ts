import {
  Controller, Get, Post, Put, Patch, Body, Param, Query,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as firebaseAdmin from 'firebase-admin';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { Tenant, TenantStatus } from '../../tenants/tenant.entity';
import { TenantFeature } from '../entities/tenant-feature.entity';
import { AuditEvent, AuditAction } from '../entities/audit-event.entity';
import { TenantDomain } from '../../tenants/tenant-domain.entity';
import { User, UserStatus } from '../../users/user.entity';
import { RoleAssignment } from '../../users/role-assignment.entity';
import { TenantMembership } from '../../auth/entities/tenant-membership.entity';
import { generateSlug, generateSchoolCode, ensureUniqueSlug, ensureUniqueCode } from '../utils/slug-generator';
import { EmailAuthService } from '../../auth/email-auth.service';
import { PasswordHistory } from '../../users/password-history.entity';

const PLATFORM_ROLES = ['platform_super_admin', 'app_super_admin', 'brand_admin'];
const SECRETARY_ROLES = ['platform_secretary', 'app_secretary'];

function getRole(req: any): string {
  return req.user?.role || req.user?.customClaims?.role || '';
}

const DEFAULT_FEATURES = [
  { feature_key: 'FINANCE_MODE', is_enabled: false, config: { mode: 'disabled' } },
  { feature_key: 'SAGE_ONE', is_enabled: false, config: null },
  { feature_key: 'SAGE_PASTEL', is_enabled: false, config: null },
  { feature_key: 'ADMISSIONS_ONLINE', is_enabled: true, config: null },
  { feature_key: 'SMS_ENABLED', is_enabled: false, config: null },
  { feature_key: 'TRANSPORT_MODULE', is_enabled: false, config: null },
  { feature_key: 'TIMETABLE_MODULE', is_enabled: false, config: null },
];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants')
export class AdminTenantsController {
  constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(TenantFeature) private featureRepo: Repository<TenantFeature>,
    @InjectRepository(AuditEvent) private auditRepo: Repository<AuditEvent>,
    @InjectRepository(TenantDomain) private domainRepo: Repository<TenantDomain>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(RoleAssignment) private roleRepo: Repository<RoleAssignment>,
    @InjectRepository(TenantMembership) private membershipRepo: Repository<TenantMembership>,
    @InjectRepository(PasswordHistory) private passwordHistoryRepo: Repository<PasswordHistory>,
    private emailAuthService: EmailAuthService,
  ) {}

  private isPlatform(req: any): boolean {
    const role = getRole(req);
    return PLATFORM_ROLES.some(r => role.includes(r));
  }

  private isSecretary(req: any): boolean {
    const role = getRole(req);
    return SECRETARY_ROLES.some(r => role.includes(r));
  }

  private canCreate(req: any): boolean {
    return this.isPlatform(req) || this.isSecretary(req);
  }

  private async log(req: any, action: AuditAction, entityId: string, before?: any, after?: any) {
    await this.auditRepo.save(this.auditRepo.create({
      actor_user_id: req.user?.uid || req.user?.dbUserId,
      action,
      entity_type: 'tenant',
      entity_id: entityId,
      before: before || null,
      after: after || null,
      ip_address: req.ip,
      user_agent: req.headers?.['user-agent'],
    } as any));
  }

  @Get()
  async list(@Req() req: any, @Query('search') search?: string, @Query('status') status?: string, @Query('brand_id') brandId?: string) {
    const canRead = this.isPlatform(req) || this.isSecretary(req);
    if (!canRead) throw new ForbiddenException('Insufficient permissions');

    if (search) {
      return this.tenantRepo.find({
        where: [
          { school_code: Like(`%${search}%`) },
          { school_name: Like(`%${search}%`) },
          { tenant_slug: Like(`%${search}%`) },
        ],
        relations: ['brand', 'parent_tenant'],
        order: { created_at: 'DESC' },
      });
    }

    const where: any = {};
    if (status) where.status = status;
    if (brandId) where.brand_id = brandId;
    return this.tenantRepo.find({ where, relations: ['brand', 'parent_tenant'], order: { created_at: 'DESC' } });
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const canRead = this.isPlatform(req) || this.isSecretary(req);
    if (!canRead) throw new ForbiddenException('Insufficient permissions');

    const tenant = await this.tenantRepo.findOne({
      where: { id },
      relations: ['brand', 'parent_tenant'],
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const features = await this.featureRepo.find({ where: { tenant_id: id } });
    const domains = await this.domainRepo.find({ where: { tenant_id: id } as any });

    return { ...tenant, features, domains };
  }

  @Get(':id/children')
  async getChildren(@Req() req: any, @Param('id') id: string) {
    const canRead = this.isPlatform(req) || this.isSecretary(req);
    if (!canRead) throw new ForbiddenException('Insufficient permissions');

    return this.tenantRepo.find({
      where: { parent_tenant_id: id },
      order: { school_name: 'ASC' },
    });
  }

  @Post()
  async create(@Req() req: any, @Body() body: Partial<Tenant> & {
    initial_admin_email?: string;
    initial_admin_name?: string;
  }) {
    if (!this.canCreate(req)) throw new ForbiddenException('Insufficient permissions');
    if (!body.school_name) {
      throw new BadRequestException('school_name is required');
    }

    // Auto-generate slug and school_code if not provided
    let tenant_slug = body.tenant_slug || generateSlug(body.school_name);
    tenant_slug = await ensureUniqueSlug(tenant_slug, this.tenantRepo, 'tenant_slug');

    let school_code = body.school_code || generateSchoolCode(body.school_name);
    school_code = await ensureUniqueCode(school_code, this.tenantRepo, 'school_code');

    const tenant = await this.tenantRepo.save(this.tenantRepo.create({
      school_name: body.school_name,
      tenant_slug,
      school_code,
      legal_name: body.legal_name || null,
      tenant_type: body.tenant_type || 'school',
      status: body.status || TenantStatus.ACTIVE,
      brand_id: body.brand_id || null,
      parent_tenant_id: body.parent_tenant_id || null,
      about: body.about || null,
      emis_number: body.emis_number || null,
      area_label: body.area_label || null,
      contact_email: body.contact_email || null,
      contact_phone: body.contact_phone || null,
      secondary_email: body.secondary_email || null,
      physical_address: body.physical_address || null,
      gallery_file_ids: body.gallery_file_ids || [],
      logo_file_id: body.logo_file_id || null,
      cover_file_id: body.cover_file_id || null,
      auth_config: body.auth_config || {
        enable_email_password: true,
        enable_email_magic_link: true,
        enable_google_signin: false,
        enable_student_pin: true,
        pin_length: 4,
      },
    } as any)) as unknown as Tenant;

    // Auto-create tenant domains
    try {
      await this.domainRepo.save(this.domainRepo.create({
        tenant_id: tenant.id,
        host: `${tenant_slug}.edapp.co.za`,
        type: 'APP',
        is_primary: true,
      } as any));
      await this.domainRepo.save(this.domainRepo.create({
        tenant_id: tenant.id,
        host: `apply-${tenant_slug}.edapp.co.za`,
        type: 'APPLY',
        is_primary: false,
      } as any));
    } catch (_) { /* domains may already exist in dev */ }

    // Auto-create default feature flags
    for (const f of DEFAULT_FEATURES) {
      await this.featureRepo.save(this.featureRepo.create({ tenant_id: tenant.id, ...f } as any));
    }

    await this.log(req, AuditAction.TENANT_CREATE, tenant.id, null, tenant);
    return tenant;
  }

  @Post(':id/invite-admin')
  async inviteAdmin(@Req() req: any, @Param('id') tenantId: string, @Body() body: {
    email: string;
    display_name?: string;
  }) {
    if (!this.canCreate(req)) throw new ForbiddenException('Insufficient permissions');

    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    if (!body.email) throw new BadRequestException('email is required');

    // Find or create user
    const emailLower = body.email.toLowerCase().trim();
    const displayName = body.display_name || body.email.split('@')[0];
    let user: any = await this.userRepo.findOne({ where: { email: emailLower } });
    let isNewUser = false;
    let tempPassword: string | null = null;

    if (!user) {
      isNewUser = true;
      tempPassword = 'Temp' + Math.random().toString(36).slice(2, 6) + '@' + Math.floor(Math.random() * 900 + 100);
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      user = await this.userRepo.save(this.userRepo.create({
        email: emailLower,
        display_name: displayName,
        status: UserStatus.ACTIVE,
        must_change_password: true,
        password_hash: passwordHash,
      } as any)) as any;

      // Create Firebase account
      try {
        await firebaseAdmin.auth().createUser({
          email: emailLower,
          password: tempPassword,
          displayName,
        });
      } catch (e: any) {
        if (e.code !== 'auth/email-already-exists') {
          console.warn('[InviteAdmin] Firebase account creation failed:', e.message);
        }
      }
    }

    const userId = user.id;

    // Create tenant membership
    const existingMembership = await this.membershipRepo.findOne({
      where: { user_id: userId, tenant_id: tenantId } as any,
    });
    if (!existingMembership) {
      await this.membershipRepo.save(this.membershipRepo.create({
        user_id: userId,
        tenant_id: tenantId,
        status: 'invited',
      } as any));
    }

    // Create role assignment
    const existingRole = await this.roleRepo.findOne({
      where: { user_id: userId, tenant_id: tenantId, role: 'tenant_admin' } as any,
    });
    if (!existingRole) {
      await this.roleRepo.save(this.roleRepo.create({
        user_id: userId,
        tenant_id: tenantId,
        role: 'tenant_admin',
        is_active: true,
      } as any));
    }

    await this.log(req, AuditAction.ROLE_ASSIGN, tenantId, null, {
      user_id: userId,
      email: body.email,
      role: 'tenant_admin',
    });

    // Record temp password in history + send welcome email for new users
    if (isNewUser && tempPassword) {
      await this.passwordHistoryRepo.save({
        user_id: userId,
        password_hash: user.password_hash,
        source: 'temp',
      } as Partial<PasswordHistory>);
      await this.emailAuthService.sendWelcomeEmail(emailLower, displayName, tempPassword);
    }

    return {
      status: 'success',
      user_id: userId,
      email: body.email,
      role: 'tenant_admin',
      tenant_id: tenantId,
      ...(tempPassword ? { tempPassword } : {}),
    };
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: Partial<Tenant>) {
    if (!this.isPlatform(req)) throw new ForbiddenException('Insufficient permissions');
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    const before = { ...tenant };
    Object.assign(tenant, body);
    const updated = await this.tenantRepo.save(tenant);
    await this.log(req, AuditAction.TENANT_EDIT, id, before, updated);
    return updated;
  }

  @Patch(':id/disable')
  async disable(@Req() req: any, @Param('id') id: string) {
    if (!this.isPlatform(req)) throw new ForbiddenException('Insufficient permissions');
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    const before = { status: tenant.status };
    tenant.status = TenantStatus.ARCHIVED;
    await this.tenantRepo.save(tenant);
    await this.log(req, AuditAction.TENANT_DISABLE, id, before, { status: TenantStatus.ARCHIVED });
    return { success: true };
  }
}
