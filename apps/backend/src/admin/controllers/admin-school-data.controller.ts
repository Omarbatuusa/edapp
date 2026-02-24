import {
  Controller, Get, Post, Put, Delete, Body, Param,
  UseGuards, Req, ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { TenantPhaseLink } from '../entities/tenant-phase-link.entity';
import { TenantGradeLink } from '../entities/tenant-grade-link.entity';
import { SubjectOffering } from '../entities/subject-offering.entity';
import { SubjectStream } from '../entities/subject-stream.entity';

const PLATFORM_ROLES = ['PLATFORM_SUPER_ADMIN', 'BRAND_ADMIN', 'platform_admin'];
const TENANT_ROLES = ['TENANT_ADMIN', 'MAIN_BRANCH_ADMIN'];

@UseGuards(FirebaseAuthGuard)
@Controller('v1/admin/tenants/:tenantId/school-data')
export class AdminSchoolDataController {
  constructor(
    @InjectRepository(TenantPhaseLink) private phaseRepo: Repository<TenantPhaseLink>,
    @InjectRepository(TenantGradeLink) private gradeRepo: Repository<TenantGradeLink>,
    @InjectRepository(SubjectOffering) private offeringRepo: Repository<SubjectOffering>,
    @InjectRepository(SubjectStream) private streamRepo: Repository<SubjectStream>,
  ) {}

  private checkAccess(req: any, tenantId: string) {
    const role = req.user?.role || req.user?.customClaims?.role || '';
    const isPlatform = PLATFORM_ROLES.some(r => role.includes(r));
    const isTenantAdmin = TENANT_ROLES.some(r => role.includes(r));
    if (!isPlatform && !isTenantAdmin) throw new ForbiddenException('Insufficient permissions');
    if (!isPlatform && req.tenant_id !== tenantId) throw new ForbiddenException('Cannot access another tenant');
  }

  @Get('phases')
  async getPhases(@Req() req: any, @Param('tenantId') tenantId: string) {
    this.checkAccess(req, tenantId);
    return this.phaseRepo.find({ where: { tenant_id: tenantId } });
  }

  @Put('phases')
  async setPhases(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: { phase_codes: string[] }) {
    this.checkAccess(req, tenantId);
    await this.phaseRepo.delete({ tenant_id: tenantId });
    const links = body.phase_codes.map(code => this.phaseRepo.create({ tenant_id: tenantId, phase_code: code } as any));
    return this.phaseRepo.save(links);
  }

  @Get('grades')
  async getGrades(@Req() req: any, @Param('tenantId') tenantId: string) {
    this.checkAccess(req, tenantId);
    return this.gradeRepo.find({ where: { tenant_id: tenantId } });
  }

  @Put('grades')
  async setGrades(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: { grade_codes: string[] }) {
    this.checkAccess(req, tenantId);
    await this.gradeRepo.delete({ tenant_id: tenantId });
    const links = body.grade_codes.map(code => this.gradeRepo.create({ tenant_id: tenantId, grade_code: code } as any));
    return this.gradeRepo.save(links);
  }

  @Get('subject-offerings')
  async getOfferings(@Req() req: any, @Param('tenantId') tenantId: string) {
    this.checkAccess(req, tenantId);
    return this.offeringRepo.find({ where: { tenant_id: tenantId, is_active: true } });
  }

  @Post('subject-offerings')
  async addOffering(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: Partial<SubjectOffering>) {
    this.checkAccess(req, tenantId);
    return this.offeringRepo.save(this.offeringRepo.create({ ...body, tenant_id: tenantId } as any));
  }

  @Delete('subject-offerings/:id')
  async removeOffering(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
    this.checkAccess(req, tenantId);
    const offering = await this.offeringRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!offering) throw new NotFoundException('Offering not found');
    await this.offeringRepo.remove(offering);
    return { success: true };
  }

  @Get('streams')
  async getStreams(@Req() req: any, @Param('tenantId') tenantId: string) {
    this.checkAccess(req, tenantId);
    return this.streamRepo.find({
      where: [{ tenant_id: tenantId }, { tenant_id: null as any }],
      order: { stream_name: 'ASC' },
    });
  }

  @Post('streams')
  async createStream(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: Partial<SubjectStream>) {
    this.checkAccess(req, tenantId);
    return this.streamRepo.save(this.streamRepo.create({ ...body, tenant_id: tenantId } as any));
  }
}
