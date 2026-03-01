import {
  Controller, Get, Post, Put, Patch, Body, Param, Query,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { Subject } from '../entities/subject.entity';

const PLATFORM_ROLES = ['PLATFORM_SUPER_ADMIN', 'BRAND_ADMIN', 'platform_admin'];
const TENANT_ROLES = ['TENANT_ADMIN', 'MAIN_BRANCH_ADMIN'];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/subjects')
export class AdminSubjectsController {
  constructor(
    @InjectRepository(Subject) private subjectRepo: Repository<Subject>,
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
}
