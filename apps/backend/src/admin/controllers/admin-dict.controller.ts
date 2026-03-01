import {
  Controller, Get, Post, Put, Patch, Body, Param,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { AuditEvent, AuditAction } from '../entities/audit-event.entity';
const PLATFORM_ROLES = ['platform_super_admin', 'brand_admin'];

const DICT_TABLE_MAP: Record<string, string> = {
  phases: 'dict_phases',
  grades: 'dict_grades',
  class_genders: 'dict_class_genders',
  subject_categories: 'dict_subject_categories',
  subject_types: 'dict_subject_types',
  language_levels: 'dict_language_levels',
  languages_hl: 'dict_languages_hl',
  languages_fal: 'dict_languages_fal',
  salutations: 'dict_salutations',
  religions: 'dict_religions',
  teaching_leadership_staff: 'dict_teaching_leadership_staff',
  non_teaching_support_staff: 'dict_non_teaching_support_staff',
  optional_admin_roles: 'dict_optional_admin_roles',
  curriculum_authorities: 'dict_curriculum_authorities',
  certification_types: 'dict_certification_types',
  academic_documents: 'dict_academic_documents',
  reqv_levels: 'dict_reqv_levels',
  citizenship_types: 'dict_citizenship_types',
  medical_aid_providers: 'dict_medical_aid_providers',
  emergency_relationships: 'dict_emergency_relationships',
  marital_statuses: 'dict_marital_statuses',
  cert_subject_providers: 'dict_cert_subject_providers',
  teaching_levels: 'dict_teaching_levels',
  academic_year_structures: 'dict_academic_year_structures',
  qualification_pathways: 'dict_qualification_pathways',
  exam_bodies: 'dict_exam_bodies',
  curriculum_names: 'dict_curriculum_names',
  medical_disabilities: 'dict_medical_disabilities',
  school_allergies: 'dict_school_allergies',
  psychological_issues: 'dict_psychological_issues',
  educational_disabilities: 'dict_educational_disabilities',
  support_profiles: 'dict_support_profiles',
  therapy_types: 'dict_therapy_types',
  blood_types: 'dict_blood_types',
  months: 'dict_months',
  programme_types: 'dict_programme_types',
  subject_language_levels: 'dict_subject_language_levels',
  assessment_models: 'dict_assessment_models',
  subject_groups: 'dict_subject_groups',
  home_languages: 'dict_home_languages',
  parent_rights: 'dict_parent_rights',
  compulsory_subjects: 'dict_compulsory_subjects',
  subjects: 'dict_subjects',
};

@UseGuards(FirebaseAuthGuard)
@Controller('admin/dict')
export class AdminDictController {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(AuditEvent) private auditRepo: Repository<AuditEvent>,
  ) {}

  private isPlatform(req: any): boolean {
    const role = req.user?.role || req.user?.customClaims?.role || '';
    return PLATFORM_ROLES.some(r => role.includes(r));
  }

  private getRepo(dictName: string) {
    const tableName = DICT_TABLE_MAP[dictName];
    if (!tableName) throw new BadRequestException(`Unknown dict: ${dictName}`);
    return this.dataSource.getRepository(tableName);
  }

  private async log(req: any, entityType: string, entityId: string, before?: any, after?: any) {
    await this.auditRepo.save(this.auditRepo.create({
      actor_user_id: req.user?.uid || req.user?.dbUserId,
      action: AuditAction.DICT_EDIT,
      entity_type: entityType,
      entity_id: entityId,
      before: before || null,
      after: after || null,
      ip_address: req.ip,
      user_agent: req.headers?.['user-agent'],
    } as any));
  }

  @Get(':dictName')
  async list(@Req() req: any, @Param('dictName') dictName: string) {
    const repo = this.getRepo(dictName);
    return repo.find({ order: { sort_order: 'ASC', label: 'ASC' } as any });
  }

  @Post(':dictName')
  async create(@Req() req: any, @Param('dictName') dictName: string, @Body() body: any) {
    if (!this.isPlatform(req)) throw new ForbiddenException('Insufficient permissions');
    const repo = this.getRepo(dictName);
    if (!body.code || !body.label) throw new BadRequestException('code and label are required');
    const entry = await repo.save(repo.create(body)) as any;
    await this.log(req, dictName, entry.id, null, entry);
    return entry;
  }

  @Put(':dictName/:id')
  async update(@Req() req: any, @Param('dictName') dictName: string, @Param('id') id: string, @Body() body: any) {
    if (!this.isPlatform(req)) throw new ForbiddenException('Insufficient permissions');
    const repo = this.getRepo(dictName);
    const entry = await repo.findOne({ where: { id } as any });
    if (!entry) throw new NotFoundException('Entry not found');
    const before = { ...entry };
    Object.assign(entry, body);
    const updated = await repo.save(entry);
    await this.log(req, dictName, id, before, updated);
    return updated;
  }

  @Patch(':dictName/:id/toggle')
  async toggle(@Req() req: any, @Param('dictName') dictName: string, @Param('id') id: string) {
    if (!this.isPlatform(req)) throw new ForbiddenException('Insufficient permissions');
    const repo = this.getRepo(dictName);
    const entry = await repo.findOne({ where: { id } as any }) as any;
    if (!entry) throw new NotFoundException('Entry not found');
    const before = { is_active: entry.is_active };
    entry.is_active = !entry.is_active;
    await repo.save(entry);
    await this.log(req, dictName, id, before, { is_active: entry.is_active });
    return { id, is_active: entry.is_active };
  }
}
