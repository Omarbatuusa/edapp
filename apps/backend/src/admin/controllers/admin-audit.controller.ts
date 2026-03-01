import {
  Controller, Get, Param, Query,
  UseGuards, Req, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { AuditEvent } from '../entities/audit-event.entity';

const PLATFORM_ROLES = ['platform_super_admin', 'brand_admin'];
const TENANT_ROLES = ['tenant_admin'];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/audit-events')
export class AdminAuditController {
  constructor(
    @InjectRepository(AuditEvent) private auditRepo: Repository<AuditEvent>,
  ) {}

  private isPlatform(req: any): boolean {
    const role = req.user?.role || req.user?.customClaims?.role || '';
    return PLATFORM_ROLES.some(r => role.includes(r));
  }

  @Get()
  async list(
    @Req() req: any,
    @Query('tenant_id') tenantId?: string,
    @Query('action') action?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    if (!this.isPlatform(req)) throw new ForbiddenException('Insufficient permissions');
    const qb = this.auditRepo.createQueryBuilder('ae').orderBy('ae.created_at', 'DESC');
    if (tenantId) qb.andWhere('ae.tenant_id = :tenantId', { tenantId });
    if (action) qb.andWhere('ae.action = :action', { action });
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, parseInt(limit));
    qb.skip((pageNum - 1) * limitNum).take(limitNum);
    const [events, total] = await qb.getManyAndCount();
    return { events, total, page: pageNum, limit: limitNum };
  }

  @Get('tenants/:tenantId')
  async listForTenant(@Req() req: any, @Param('tenantId') tenantId: string, @Query('page') page = '1', @Query('limit') limit = '50') {
    const role = req.user?.role || req.user?.customClaims?.role || '';
    const isPlatform = this.isPlatform(req);
    const isTenantAdmin = TENANT_ROLES.some(r => role.includes(r));
    if (!isPlatform && !isTenantAdmin) throw new ForbiddenException('Insufficient permissions');
    if (!isPlatform && req.tenant_id !== tenantId) throw new ForbiddenException('Cannot access another tenant');
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, parseInt(limit));
    const [events, total] = await this.auditRepo.findAndCount({
      where: { tenant_id: tenantId },
      order: { created_at: 'DESC' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });
    return { events, total, page: pageNum, limit: limitNum };
  }
}
