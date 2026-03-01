import {
  Controller, Get, Post, Put, Delete, Patch, Body, Param,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { AdmissionsProcessCard } from '../entities/admissions-process-card.entity';
import { AuditEvent, AuditAction } from '../entities/audit-event.entity';

const PLATFORM_ROLES = ['platform_super_admin', 'brand_admin'];
const CAN_MANAGE = ['platform_super_admin', 'brand_admin', 'tenant_admin', 'admissions_officer'];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/admissions')
export class AdminAdmissionsController {
  constructor(
    @InjectRepository(AdmissionsProcessCard) private cardRepo: Repository<AdmissionsProcessCard>,
    @InjectRepository(AuditEvent) private auditRepo: Repository<AuditEvent>,
  ) {}

  private checkAccess(req: any, tenantId: string) {
    const role = req.user?.role || req.user?.customClaims?.role || '';
    const isPlatform = PLATFORM_ROLES.some(r => role.includes(r));
    const canManage = CAN_MANAGE.some(r => role.includes(r));
    if (!canManage) throw new ForbiddenException('Insufficient permissions');
    if (!isPlatform && req.tenant_id !== tenantId) throw new ForbiddenException('Cannot access another tenant');
  }

  @Get()
  async list(@Req() req: any, @Param('tenantId') tenantId: string) {
    this.checkAccess(req, tenantId);
    return this.cardRepo.find({ where: { tenant_id: tenantId }, order: { sort_order: 'ASC' } });
  }

  @Post()
  async create(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: Partial<AdmissionsProcessCard>) {
    this.checkAccess(req, tenantId);
    if (!body.title) throw new BadRequestException('title is required');
    const maxOrder = await this.cardRepo.count({ where: { tenant_id: tenantId } });
    return this.cardRepo.save(this.cardRepo.create({
      ...body,
      tenant_id: tenantId,
      sort_order: maxOrder,
      created_by: req.user?.uid || req.user?.dbUserId,
    } as any));
  }

  @Put(':cardId')
  async update(@Req() req: any, @Param('tenantId') tenantId: string, @Param('cardId') cardId: string, @Body() body: Partial<AdmissionsProcessCard>) {
    this.checkAccess(req, tenantId);
    const card = await this.cardRepo.findOne({ where: { id: cardId, tenant_id: tenantId } });
    if (!card) throw new NotFoundException('Card not found');
    Object.assign(card, body);
    return this.cardRepo.save(card);
  }

  @Delete(':cardId')
  async remove(@Req() req: any, @Param('tenantId') tenantId: string, @Param('cardId') cardId: string) {
    this.checkAccess(req, tenantId);
    const card = await this.cardRepo.findOne({ where: { id: cardId, tenant_id: tenantId } });
    if (!card) throw new NotFoundException('Card not found');
    await this.cardRepo.remove(card);
    return { success: true };
  }

  @Patch('reorder')
  async reorder(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: { order: Array<{ id: string; sort_order: number }> }) {
    this.checkAccess(req, tenantId);
    for (const item of body.order) {
      await this.cardRepo.update({ id: item.id, tenant_id: tenantId }, { sort_order: item.sort_order });
    }
    return this.cardRepo.find({ where: { tenant_id: tenantId }, order: { sort_order: 'ASC' } });
  }

  @Post('publish')
  async publish(@Req() req: any, @Param('tenantId') tenantId: string) {
    this.checkAccess(req, tenantId);
    const now = new Date();
    await this.cardRepo.update({ tenant_id: tenantId }, { is_published: true, published_at: now });
    await this.auditRepo.save(this.auditRepo.create({
      actor_user_id: req.user?.uid || req.user?.dbUserId,
      tenant_id: tenantId,
      action: AuditAction.ADMISSIONS_PUBLISH,
      entity_type: 'admissions_process',
      entity_id: tenantId,
      after: { published_at: now },
      ip_address: req.ip,
      user_agent: req.headers?.['user-agent'],
    } as any));
    return { success: true, published_at: now };
  }
}
