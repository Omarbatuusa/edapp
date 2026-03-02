import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { Curriculum } from '../entities/curriculum.entity';
import { AuditEvent, AuditAction } from '../entities/audit-event.entity';

const PLATFORM_ROLES = ['platform_super_admin', 'brand_admin'];
const TENANT_ROLES = ['tenant_admin', 'main_branch_admin'];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/curricula')
export class AdminCurriculaController {
  constructor(
    @InjectRepository(Curriculum) private curriculumRepo: Repository<Curriculum>,
    @InjectRepository(AuditEvent) private auditRepo: Repository<AuditEvent>,
  ) {}

  private getRole(req: any): string {
    return req.user?.role || req.user?.customClaims?.role || '';
  }

  private canManage(req: any): boolean {
    const role = this.getRole(req);
    return [...PLATFORM_ROLES, ...TENANT_ROLES].some(r => role.includes(r));
  }

  @Get()
  async list(@Req() req: any, @Param('tenantId') tenantId: string) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    return this.curriculumRepo.find({
      where: { tenant_id: tenantId },
      order: { curriculum_name: 'ASC' },
    });
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const item = await this.curriculumRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!item) throw new NotFoundException('Curriculum not found');
    return item;
  }

  @Post()
  async create(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: Partial<Curriculum>) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    if (!body.curriculum_name) throw new BadRequestException('curriculum_name is required');

    const curriculum = this.curriculumRepo.create({
      curriculum_name: body.curriculum_name,
      curriculum_code: body.curriculum_code,
      certification_type_code: body.certification_type_code,
      authority_code: body.authority_code,
      is_national: body.is_national,
      phases_covered: body.phases_covered,
      grades_covered: body.grades_covered,
      subject_ids: body.subject_ids,
      exam_body_code: body.exam_body_code,
      offered_at_branch_ids: body.offered_at_branch_ids,
      tenant_id: tenantId,
    });
    const saved = await this.curriculumRepo.save(curriculum);

    await this.auditRepo.save(this.auditRepo.create({
      actor_user_id: req.user?.uid || req.user?.dbUserId,
      tenant_id: tenantId,
      action: AuditAction.CURRICULUM_CREATE,
      entity_type: 'curriculum',
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
    @Body() body: Partial<Curriculum>,
  ) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const existing = await this.curriculumRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!existing) throw new NotFoundException('Curriculum not found');

    const before = { ...existing };
    Object.assign(existing, body);
    existing.tenant_id = tenantId; // Prevent tenant_id override
    const saved = await this.curriculumRepo.save(existing);

    await this.auditRepo.save(this.auditRepo.create({
      actor_user_id: req.user?.uid || req.user?.dbUserId,
      tenant_id: tenantId,
      action: AuditAction.CURRICULUM_EDIT,
      entity_type: 'curriculum',
      entity_id: saved.id,
      before: before as any,
      after: saved as any,
      ip_address: req.ip,
      user_agent: req.headers?.['user-agent'],
    } as any));

    return saved;
  }

  @Patch(':id/toggle')
  async toggle(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const existing = await this.curriculumRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!existing) throw new NotFoundException('Curriculum not found');
    existing.is_active = !existing.is_active;
    return this.curriculumRepo.save(existing);
  }
}
