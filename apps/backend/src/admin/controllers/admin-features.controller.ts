import {
  Controller, Get, Put, Patch, Body, Param,
  UseGuards, Req, ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { TenantFeature } from '../entities/tenant-feature.entity';
import { AuditEvent, AuditAction } from '../entities/audit-event.entity';
import { Tenant } from '../../tenants/tenant.entity';

const PLATFORM_ROLES = ['platform_super_admin', 'brand_admin'];
const TENANT_ROLES = ['tenant_admin'];

function detectFinanceConflict(features: TenantFeature[]): { conflict: boolean; conflicting_features: string[] } {
  const fm = features.find(f => f.feature_key === 'FINANCE_MODE');
  const sageOne = features.find(f => f.feature_key === 'SAGE_ONE');
  const sagePastel = features.find(f => f.feature_key === 'SAGE_PASTEL');
  const isManual = fm?.config?.mode === 'manual';
  const hasIntegration = sageOne?.is_enabled || sagePastel?.is_enabled;
  const conflict = !!(isManual && hasIntegration);
  const conflicting: string[] = [];
  if (conflict) {
    conflicting.push('FINANCE_MODE');
    if (sageOne?.is_enabled) conflicting.push('SAGE_ONE');
    if (sagePastel?.is_enabled) conflicting.push('SAGE_PASTEL');
  }
  return { conflict, conflicting_features: conflicting };
}

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/features')
export class AdminFeaturesController {
  constructor(
    @InjectRepository(TenantFeature) private featureRepo: Repository<TenantFeature>,
    @InjectRepository(AuditEvent) private auditRepo: Repository<AuditEvent>,
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
  ) {}

  private async checkAccess(req: any, tenantId: string) {
    const role = req.user?.role || req.user?.customClaims?.role || '';
    const isPlatform = PLATFORM_ROLES.some(r => role.includes(r));
    const isTenantAdmin = TENANT_ROLES.some(r => role.includes(r));
    if (!isPlatform && !isTenantAdmin) throw new ForbiddenException('Insufficient permissions');
    if (isTenantAdmin && !isPlatform && req.tenant_id !== tenantId) {
      throw new ForbiddenException('Cannot access another tenant');
    }
  }

  private async log(req: any, tenantId: string, action: AuditAction, featureKey: string, before: any, after: any) {
    await this.auditRepo.save(this.auditRepo.create({
      actor_user_id: req.user?.uid || req.user?.dbUserId,
      tenant_id: tenantId,
      action,
      entity_type: 'tenant_feature',
      entity_id: featureKey,
      before,
      after,
      ip_address: req.ip,
      user_agent: req.headers?.['user-agent'],
    } as any));
  }

  @Get()
  async list(@Req() req: any, @Param('tenantId') tenantId: string) {
    await this.checkAccess(req, tenantId);
    const features = await this.featureRepo.find({ where: { tenant_id: tenantId } });
    return { features, ...detectFinanceConflict(features) };
  }

  @Put()
  async bulkUpdate(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: { features: Array<{ feature_key: string; is_enabled: boolean; config?: any }> }) {
    await this.checkAccess(req, tenantId);
    for (const update of body.features) {
      const existing = await this.featureRepo.findOne({ where: { tenant_id: tenantId, feature_key: update.feature_key } });
      const before = existing ? { is_enabled: existing.is_enabled, config: existing.config } : null;
      if (existing) {
        existing.is_enabled = update.is_enabled;
        if (update.config !== undefined) existing.config = update.config;
        existing.updated_by = req.user?.uid || req.user?.dbUserId;
        await this.featureRepo.save(existing);
      } else {
        await this.featureRepo.save(this.featureRepo.create({ tenant_id: tenantId, ...update } as any));
      }
      const isFinanceRelated = ['FINANCE_MODE', 'SAGE_ONE', 'SAGE_PASTEL'].includes(update.feature_key);
      const action = isFinanceRelated ? AuditAction.FINANCE_MODE_CHANGE : AuditAction.FEATURE_TOGGLE;
      await this.log(req, tenantId, action, update.feature_key, before, update);
    }
    const features = await this.featureRepo.find({ where: { tenant_id: tenantId } });
    return { features, ...detectFinanceConflict(features) };
  }

  @Patch(':featureKey')
  async toggle(@Req() req: any, @Param('tenantId') tenantId: string, @Param('featureKey') featureKey: string, @Body() body: { is_enabled?: boolean; config?: any }) {
    await this.checkAccess(req, tenantId);
    const feature = await this.featureRepo.findOne({ where: { tenant_id: tenantId, feature_key: featureKey } });
    if (!feature) throw new NotFoundException(`Feature ${featureKey} not found for tenant`);
    const before = { is_enabled: feature.is_enabled, config: feature.config };
    if (body.is_enabled !== undefined) feature.is_enabled = body.is_enabled;
    if (body.config !== undefined) feature.config = body.config;
    feature.updated_by = req.user?.uid || req.user?.dbUserId;
    await this.featureRepo.save(feature);
    const isFinanceRelated = ['FINANCE_MODE', 'SAGE_ONE', 'SAGE_PASTEL'].includes(featureKey);
    const action = isFinanceRelated ? AuditAction.FINANCE_MODE_CHANGE : AuditAction.FEATURE_TOGGLE;
    await this.log(req, tenantId, action, featureKey, before, { is_enabled: feature.is_enabled, config: feature.config });
    const features = await this.featureRepo.find({ where: { tenant_id: tenantId } });
    return { feature, ...detectFinanceConflict(features) };
  }
}
