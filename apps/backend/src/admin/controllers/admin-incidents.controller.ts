import {
  Controller, Get, Post, Put, Patch, Body, Param, Query,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { Incident, IncidentStatus, IncidentSeverity } from '../entities/incident.entity';

const ALL_STAFF_ROLES = [
  'platform_super_admin', 'brand_admin', 'tenant_admin', 'main_branch_admin', 'branch_admin',
  'principal', 'deputy_principal', 'smt', 'hod', 'grade_head', 'phase_head',
  'class_teacher', 'subject_teacher', 'teacher', 'counsellor', 'nurse', 'security', 'hr_admin', 'it_admin',
  'admissions_officer', 'finance_officer', 'reception', 'transport', 'aftercare', 'caretaker', 'staff',
];
const MANAGE_ROLES = [
  'platform_super_admin', 'tenant_admin', 'main_branch_admin', 'principal', 'deputy_principal', 'smt', 'counsellor', 'security',
];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/incidents')
export class AdminIncidentsController {
  constructor(
    @InjectRepository(Incident) private incidentRepo: Repository<Incident>,
    private dataSource: DataSource,
  ) {}

  private getRole(req: any): string {
    return req.user?.role || req.user?.customClaims?.role || '';
  }

  private canView(req: any): boolean {
    return ALL_STAFF_ROLES.some(r => this.getRole(req).includes(r));
  }

  private canManage(req: any): boolean {
    return MANAGE_ROLES.some(r => this.getRole(req).includes(r));
  }

  /* ───── 1. CREATE ───── */
  @Post()
  async create(
    @Param('tenantId') tenantId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const count = await this.incidentRepo.count({ where: { tenant_id: tenantId } });
    const year = new Date().getFullYear();
    const caseId = `INC-${year}-${String(count + 1).padStart(4, '0')}`;

    const incident = this.incidentRepo.create({
      ...body,
      tenant_id: tenantId,
      case_id: caseId,
    } as any);

    return this.incidentRepo.save(incident);
  }

  /* ───── 2. LIST ───── */
  @Get()
  async list(
    @Param('tenantId') tenantId: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('severity') severity?: string,
    @Query('reporter_type') reporterType?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Req() req?: any,
  ) {
    if (!this.canView(req)) throw new ForbiddenException('Insufficient role');

    const where: any = { tenant_id: tenantId };
    if (status) where.status = status;
    if (category) where.category = category;
    if (severity) where.severity = severity;
    if (reporterType) where.reporter_type = reporterType;

    const [data, total] = await this.incidentRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: parseInt(skip || '0', 10),
      take: parseInt(take || '50', 10),
    });

    return { data, total };
  }

  /* ───── 3. DETAIL ───── */
  @Get(':id')
  async detail(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    if (!this.canView(req)) throw new ForbiddenException('Insufficient role');

    const incident = await this.incidentRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!incident) throw new NotFoundException('Incident not found');

    return incident;
  }

  /* ───── 4. UPDATE ───── */
  @Put(':id')
  async update(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient role');

    const incident = await this.incidentRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!incident) throw new NotFoundException('Incident not found');

    Object.assign(incident, body);
    return this.incidentRepo.save(incident);
  }

  /* ───── 5. ASSIGN ───── */
  @Patch(':id/assign')
  async assign(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: { assigned_staff_ids: string[] },
    @Req() req: any,
  ) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient role');

    const incident = await this.incidentRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!incident) throw new NotFoundException('Incident not found');

    incident.assigned_staff_ids = body.assigned_staff_ids;
    if (incident.status === IncidentStatus.SUBMITTED || incident.status === IncidentStatus.ACKNOWLEDGED) {
      incident.status = IncidentStatus.ASSIGNED;
    }

    return this.incidentRepo.save(incident);
  }

  /* ───── 6. ACKNOWLEDGE ───── */
  @Patch(':id/acknowledge')
  async acknowledge(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    if (!this.canView(req)) throw new ForbiddenException('Insufficient role');

    const incident = await this.incidentRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!incident) throw new NotFoundException('Incident not found');

    incident.sla_acknowledged_at = new Date();
    if (incident.status === IncidentStatus.SUBMITTED) {
      incident.status = IncidentStatus.ACKNOWLEDGED;
    }

    return this.incidentRepo.save(incident);
  }

  /* ───── 7. CLOSE ───── */
  @Patch(':id/close')
  async close(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: { outcome: string },
    @Req() req: any,
  ) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient role');

    const incident = await this.incidentRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!incident) throw new NotFoundException('Incident not found');

    incident.outcome = body.outcome as any;
    incident.status = IncidentStatus.CLOSED;

    return this.incidentRepo.save(incident);
  }

  /* ───── 8. ESCALATE ───── */
  @Patch(':id/escalate')
  async escalate(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    if (!this.canView(req)) throw new ForbiddenException('Insufficient role');

    const incident = await this.incidentRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!incident) throw new NotFoundException('Incident not found');

    incident.status = IncidentStatus.ESCALATED;

    return this.incidentRepo.save(incident);
  }

  /* ───── 9. ADD INVESTIGATION NOTE ───── */
  @Post(':id/notes')
  async addNote(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: { text: string },
    @Req() req: any,
  ) {
    if (!this.canView(req)) throw new ForbiddenException('Insufficient role');

    const incident = await this.incidentRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!incident) throw new NotFoundException('Incident not found');

    const note = {
      author_id: req.user?.uid || req.user?.sub,
      text: body.text,
      timestamp: new Date().toISOString(),
      type: 'investigation',
    };

    incident.investigation_notes = [...(incident.investigation_notes || []), note];

    return this.incidentRepo.save(incident);
  }
}
