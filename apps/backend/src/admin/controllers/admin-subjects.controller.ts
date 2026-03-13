import {
  Controller, Get, Post, Put, Patch, Body, Param, Query,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { Subject } from '../entities/subject.entity';
import { SubjectOffering } from '../entities/subject-offering.entity';
import { SubjectStream } from '../entities/subject-stream.entity';

const PLATFORM_ROLES = ['platform_super_admin', 'brand_admin'];
const TENANT_ROLES = ['tenant_admin', 'main_branch_admin'];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/subjects')
export class AdminSubjectsController {
  constructor(
    @InjectRepository(Subject) private subjectRepo: Repository<Subject>,
    @InjectRepository(SubjectOffering) private offeringRepo: Repository<SubjectOffering>,
    @InjectRepository(SubjectStream) private streamRepo: Repository<SubjectStream>,
  ) {}

  private getRole(req: any): string {
    return req.user?.role || req.user?.customClaims?.role || '';
  }

  private isPlatform(req: any): boolean {
    const role = this.getRole(req);
    return PLATFORM_ROLES.some(r => role.includes(r));
  }

  private isTenantAdmin(req: any): boolean {
    const role = this.getRole(req);
    return TENANT_ROLES.some(r => role.includes(r));
  }

  @Get()
  async list(@Req() req: any) {
    const canRead = this.isPlatform(req) || this.isTenantAdmin(req);
    if (!canRead) throw new ForbiddenException('Insufficient permissions');
    // Return platform subjects + tenant-specific subjects for current tenant
    const tenantId = req.tenant_id;
    if (this.isPlatform(req)) {
      return this.subjectRepo.find({ order: { subject_name: 'ASC' } });
    }
    return this.subjectRepo.find({
      where: [
        { is_platform_subject: true },
        { tenant_id: tenantId },
      ],
      order: { subject_name: 'ASC' },
    });
  }

  @Post()
  async create(@Req() req: any, @Body() body: Partial<Subject>) {
    const canCreate = this.isPlatform(req) || this.isTenantAdmin(req);
    if (!canCreate) throw new ForbiddenException('Insufficient permissions');
    if (!body.subject_code || !body.subject_name) {
      throw new BadRequestException('subject_code and subject_name are required');
    }
    const isPlatform = this.isPlatform(req);
    return this.subjectRepo.save(this.subjectRepo.create({
      ...body,
      is_platform_subject: isPlatform ? (body.is_platform_subject ?? true) : false,
      tenant_id: isPlatform ? (body.tenant_id || null) : req.tenant_id,
    } as any));
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: Partial<Subject>) {
    const canEdit = this.isPlatform(req) || this.isTenantAdmin(req);
    if (!canEdit) throw new ForbiddenException('Insufficient permissions');
    const subject = await this.subjectRepo.findOne({ where: { id } });
    if (!subject) throw new NotFoundException('Subject not found');
    if (!this.isPlatform(req) && subject.is_platform_subject) {
      throw new ForbiddenException('Cannot edit platform subjects');
    }
    Object.assign(subject, body);
    return this.subjectRepo.save(subject);
  }

  @Patch(':id/toggle')
  async toggle(@Req() req: any, @Param('id') id: string) {
    const canEdit = this.isPlatform(req) || this.isTenantAdmin(req);
    if (!canEdit) throw new ForbiddenException('Insufficient permissions');
    const subject = await this.subjectRepo.findOne({ where: { id } }) as any;
    if (!subject) throw new NotFoundException('Subject not found');
    subject.is_active = !subject.is_active;
    await this.subjectRepo.save(subject);
    return { id, is_active: subject.is_active };
  }

  // ──────────────────────────────────────────────────────────
  // Subject Offerings (tenant-scoped)
  // ──────────────────────────────────────────────────────────

  @Get('offerings/:tenantId')
  async listOfferings(@Req() req: any, @Param('tenantId') tenantId: string) {
    if (!this.isPlatform(req) && !this.isTenantAdmin(req)) throw new ForbiddenException();
    return this.offeringRepo.find({
      where: { tenant_id: tenantId },
      order: { created_at: 'ASC' },
    });
  }

  @Post('offerings/:tenantId')
  async createOffering(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    if (!this.isPlatform(req) && !this.isTenantAdmin(req)) throw new ForbiddenException();
    if (!body.subject_id) throw new BadRequestException('subject_id is required');

    return this.offeringRepo.save(this.offeringRepo.create({
      tenant_id: tenantId,
      subject_id: body.subject_id,
      branch_id: body.branch_id || null,
      stream_code: body.stream_code || null,
      type_code: body.type_code || null,
      language_level_code: body.language_level_code || null,
    } as any));
  }

  @Put('offerings/:tenantId/:id')
  async updateOffering(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    if (!this.isPlatform(req) && !this.isTenantAdmin(req)) throw new ForbiddenException();
    const offering = await this.offeringRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!offering) throw new NotFoundException('Offering not found');
    Object.assign(offering, body);
    return this.offeringRepo.save(offering);
  }

  @Patch('offerings/:tenantId/:id/toggle')
  async toggleOffering(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
    if (!this.isPlatform(req) && !this.isTenantAdmin(req)) throw new ForbiddenException();
    const offering = await this.offeringRepo.findOne({ where: { id, tenant_id: tenantId } }) as any;
    if (!offering) throw new NotFoundException('Offering not found');
    offering.is_active = !offering.is_active;
    return this.offeringRepo.save(offering);
  }

  // ──────────────────────────────────────────────────────────
  // Subject Streams (tenant-scoped)
  // ──────────────────────────────────────────────────────────

  @Get('streams/:tenantId')
  async listStreams(@Req() req: any, @Param('tenantId') tenantId: string) {
    if (!this.isPlatform(req) && !this.isTenantAdmin(req)) throw new ForbiddenException();
    return this.streamRepo.find({
      where: { tenant_id: tenantId },
      order: { stream_name: 'ASC' },
    });
  }

  @Post('streams/:tenantId')
  async createStream(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    if (!this.isPlatform(req) && !this.isTenantAdmin(req)) throw new ForbiddenException();
    if (!body.stream_code || !body.stream_name) throw new BadRequestException('stream_code and stream_name required');

    return this.streamRepo.save(this.streamRepo.create({
      tenant_id: tenantId,
      stream_code: body.stream_code,
      stream_name: body.stream_name,
      description: body.description || null,
    } as any));
  }

  @Put('streams/:tenantId/:id')
  async updateStream(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    if (!this.isPlatform(req) && !this.isTenantAdmin(req)) throw new ForbiddenException();
    const stream = await this.streamRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!stream) throw new NotFoundException('Stream not found');
    Object.assign(stream, body);
    return this.streamRepo.save(stream);
  }
}
