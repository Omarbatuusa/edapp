import {
  Controller, Get, Post, Put, Patch, Body, Param, Query,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { Tenant, TenantStatus } from '../../tenants/tenant.entity';
import { TenantFeature } from '../entities/tenant-feature.entity';
import { AuditEvent, AuditAction } from '../entities/audit-event.entity';

const PLATFORM_ROLES = ['PLATFORM_SUPER_ADMIN', 'BRAND_ADMIN', 'platform_admin'];
const SECRETARY_ROLES = ['PLATFORM_SECRETARY'];

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
@Controller('v1/admin/tenants')
export class AdminTenantsController {
  constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(TenantFeature) private featureRepo: Repository<TenantFeature>,
    @InjectRepository(AuditEvent) private auditRepo: Repository<AuditEvent>,
  ) {}

  private isPlatform(req: any): boolean {
    const role = getRole(req);
    return PLATFORM_ROLES.some(r => role.includes(r));
  }

  private isSecretary(req: any): boolean {
    const role = getRole(req);
    return SECRETARY_ROLES.some(r => role.includes(r));
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
  async list(@Req() req: any, @Query('search') search?: string, @Query('status') status?: string) {
    const role = getRole(req);
    const canRead = this.isPlatform(req) || this.isSecretary(req);
    if (!canRead) throw new ForbiddenException('Insufficient permissions');

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      const tenants = await this.tenantRepo.find({
        where: [
          { school_code: Like(`%${search}%`) },
          { school_name: Like(`%${search}%`) },
          { tenant_slug: Like(`%${search}%`) },
        ],
      });
      return tenants;
    }
    return this.tenantRepo.find({ where, order: { created_at: 'DESC' } });
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const canRead = this.isPlatform(req) || this.isSecretary(req);
    if (!canRead) throw new ForbiddenException('Insufficient permissions');
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    const features = await this.featureRepo.find({ where: { tenant_id: id } });
    return { ...tenant, features };
  }

  @Post()
  async create(@Req() req: any, @Body() body: Partial<Tenant>) {
    if (!this.isPlatform(req)) throw new ForbiddenException('Insufficient permissions');
    if (!body.school_code || !body.tenant_slug || !body.school_name) {
      throw new BadRequestException('school_code, tenant_slug, and school_name are required');
    }
    const tenant = await this.tenantRepo.save(this.tenantRepo.create({
      ...body,
      status: body.status || TenantStatus.ACTIVE,
      auth_config: body.auth_config || {
        enable_email_password: true,
        enable_email_magic_link: true,
        enable_google_signin: false,
        enable_student_pin: true,
        pin_length: 4,
      },
    } as any));
    // Auto-create default feature flags
    for (const f of DEFAULT_FEATURES) {
      await this.featureRepo.save(this.featureRepo.create({ tenant_id: tenant.id, ...f } as any));
    }
    await this.log(req, AuditAction.TENANT_CREATE, tenant.id, null, tenant);
    return tenant;
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
