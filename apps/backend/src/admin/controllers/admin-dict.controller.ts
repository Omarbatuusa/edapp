import {
  Controller, Get, Post, Put, Patch, Body, Param,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { AuditEvent, AuditAction } from '../entities/audit-event.entity';
import { DictPhase } from '../entities/dict-phase.entity';
import { DictGrade } from '../entities/dict-grade.entity';
import { DictClassGender } from '../entities/dict-class-gender.entity';
import { DictSubjectCategory } from '../entities/dict-subject-category.entity';
import { DictSubjectType } from '../entities/dict-subject-type.entity';
import { DictLanguageLevel } from '../entities/dict-language-level.entity';
import { DictLanguageHL } from '../entities/dict-language-hl.entity';
import { DictLanguageFAL } from '../entities/dict-language-fal.entity';
import { DictSalutation } from '../entities/dict-salutation.entity';
import { DictReligion } from '../entities/dict-religion.entity';

const PLATFORM_ROLES = ['PLATFORM_SUPER_ADMIN', 'BRAND_ADMIN', 'platform_admin'];

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
};

@UseGuards(FirebaseAuthGuard)
@Controller('v1/admin/dict')
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
    const entry = await repo.save(repo.create(body));
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
