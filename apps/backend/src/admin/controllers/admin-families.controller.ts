import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { Family } from '../entities/family.entity';
import { EldestLearner } from '../entities/eldest-learner.entity';
import { AuditEvent, AuditAction } from '../entities/audit-event.entity';

const PLATFORM_ROLES = ['platform_super_admin', 'brand_admin'];
const TENANT_ROLES = ['tenant_admin', 'main_branch_admin'];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/families')
export class AdminFamiliesController {
  constructor(
    @InjectRepository(Family) private familyRepo: Repository<Family>,
    @InjectRepository(EldestLearner) private eldestLearnerRepo: Repository<EldestLearner>,
    @InjectRepository(AuditEvent) private auditRepo: Repository<AuditEvent>,
  ) {}

  private getRole(req: any): string {
    return req.user?.role || req.user?.customClaims?.role || '';
  }

  private canManage(req: any): boolean {
    const role = this.getRole(req);
    return [...PLATFORM_ROLES, ...TENANT_ROLES].some(r => role.includes(r));
  }

  // ── Family endpoints ──────────────────────────────────────────────

  @Get()
  async list(@Req() req: any, @Param('tenantId') tenantId: string) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    return this.familyRepo.find({
      where: { tenant_id: tenantId },
      order: { family_name: 'ASC' },
    });
  }

  @Get('eldest-learners')
  async listEldestLearners(@Req() req: any, @Param('tenantId') tenantId: string) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    return this.eldestLearnerRepo.find({
      where: { tenant_id: tenantId },
    });
  }

  @Get('eldest-learners/:elId')
  async findOneEldestLearner(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('elId') elId: string,
  ) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const item = await this.eldestLearnerRepo.findOne({ where: { id: elId, tenant_id: tenantId } });
    if (!item) throw new NotFoundException('Eldest learner not found');
    return item;
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const item = await this.familyRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!item) throw new NotFoundException('Family not found');
    return item;
  }

  @Post()
  async create(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: Partial<Family>) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    if (!body.family_name) throw new BadRequestException('family_name is required');

    const family = this.familyRepo.create({
      family_name: body.family_name,
      eldest_learner_id: body.eldest_learner_id,
      family_code: `FAM-${Date.now().toString(36).toUpperCase()}`,
      tenant_id: tenantId,
    });
    const saved = await this.familyRepo.save(family);

    await this.auditRepo.save(this.auditRepo.create({
      actor_user_id: req.user?.uid || req.user?.dbUserId,
      tenant_id: tenantId,
      action: AuditAction.FAMILY_CREATE,
      entity_type: 'family',
      entity_id: saved.id,
      after: saved as any,
      ip_address: req.ip,
      user_agent: req.headers?.['user-agent'],
    } as any));

    return saved;
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: Partial<Family>,
  ) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const existing = await this.familyRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!existing) throw new NotFoundException('Family not found');

    Object.assign(existing, body);
    existing.tenant_id = tenantId; // Prevent tenant_id override
    return this.familyRepo.save(existing);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const existing = await this.familyRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!existing) throw new NotFoundException('Family not found');
    await this.familyRepo.remove(existing);
    return { success: true };
  }

  // ── Eldest Learner sub-routes ─────────────────────────────────────

  @Post('eldest-learners')
  async createEldestLearner(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: Partial<EldestLearner>) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');

    const eldestLearner = this.eldestLearnerRepo.create({
      post_id: body.post_id,
      family_code: body.family_code,
      learner_names: body.learner_names,
      student_number: body.student_number,
      learner_user_id: body.learner_user_id,
      tenant_id: tenantId,
    });
    return this.eldestLearnerRepo.save(eldestLearner);
  }

  @Put('eldest-learners/:elId')
  async updateEldestLearner(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('elId') elId: string,
    @Body() body: Partial<EldestLearner>,
  ) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const existing = await this.eldestLearnerRepo.findOne({ where: { id: elId, tenant_id: tenantId } });
    if (!existing) throw new NotFoundException('Eldest learner not found');

    Object.assign(existing, body);
    existing.tenant_id = tenantId; // Prevent tenant_id override
    return this.eldestLearnerRepo.save(existing);
  }
}
