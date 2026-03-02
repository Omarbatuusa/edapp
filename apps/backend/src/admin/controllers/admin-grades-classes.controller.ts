import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { SchoolClass } from '../../attendance/entities/class.entity';
import { AuditEvent, AuditAction } from '../entities/audit-event.entity';

const PLATFORM_ROLES = ['platform_super_admin', 'brand_admin'];
const TENANT_ROLES = ['tenant_admin', 'main_branch_admin'];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/grades-classes')
export class AdminGradesClassesController {
  constructor(
    @InjectRepository(SchoolClass) private classRepo: Repository<SchoolClass>,
    @InjectRepository(AuditEvent) private auditRepo: Repository<AuditEvent>,
    private dataSource: DataSource,
  ) {}

  private getRole(req: any): string {
    return req.user?.role || req.user?.customClaims?.role || '';
  }

  private canManage(req: any): boolean {
    const role = this.getRole(req);
    return [...PLATFORM_ROLES, ...TENANT_ROLES].some(r => role.includes(r));
  }

  @Get('classes')
  async listClasses(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Query('branch_id') branchId?: string,
    @Query('grade_code') gradeCode?: string,
  ) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const where: any = { tenant_id: tenantId };
    if (branchId) where.branch_id = branchId;
    if (gradeCode) where.grade_id = gradeCode;
    return this.classRepo.find({ where, order: { section_name: 'ASC' } });
  }

  @Post('classes')
  async createClass(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: any) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    if (!body.class_name) throw new BadRequestException('class_name is required');

    const schoolClass = this.classRepo.create({
      section_name: body.class_name,
      grade_id: body.grade_code,
      branch_id: body.branch_id,
      class_teacher_id: body.teacher_user_id || null,
      class_code: `${body.grade_code || 'CLS'}-${Date.now().toString(36).toUpperCase()}`,
      tenant_id: tenantId,
    });
    const saved = await this.classRepo.save(schoolClass);

    await this.auditRepo.save(this.auditRepo.create({
      actor_user_id: req.user?.uid || req.user?.dbUserId,
      tenant_id: tenantId,
      action: AuditAction.CLASS_CREATE,
      entity_type: 'class',
      entity_id: saved.id,
      after: saved as any,
      ip_address: req.ip,
      user_agent: req.headers?.['user-agent'],
    } as any));

    return saved;
  }

  @Put('classes/:id')
  async updateClass(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const existing = await this.classRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!existing) throw new NotFoundException('Class not found');

    const before = { ...existing };
    if (body.class_name !== undefined) existing.section_name = body.class_name;
    if (body.grade_code !== undefined) existing.grade_id = body.grade_code;
    if (body.branch_id !== undefined) existing.branch_id = body.branch_id;
    if (body.teacher_user_id !== undefined) existing.class_teacher_id = body.teacher_user_id;
    const saved = await this.classRepo.save(existing);

    await this.auditRepo.save(this.auditRepo.create({
      actor_user_id: req.user?.uid || req.user?.dbUserId,
      tenant_id: tenantId,
      action: AuditAction.CLASS_EDIT,
      entity_type: 'class',
      entity_id: saved.id,
      before: before as any,
      after: saved as any,
      ip_address: req.ip,
      user_agent: req.headers?.['user-agent'],
    } as any));

    return saved;
  }

  @Patch('classes/:id/toggle')
  async toggleClass(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const existing = await this.classRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!existing) throw new NotFoundException('Class not found');
    existing.is_active = !existing.is_active;
    return this.classRepo.save(existing);
  }
}
