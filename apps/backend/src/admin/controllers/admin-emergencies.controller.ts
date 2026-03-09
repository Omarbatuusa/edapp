import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { EmergencyAlert, EmergencyAlertStatus } from '../entities/emergency-alert.entity';
import { EmergencyAcknowledgement } from '../entities/emergency-acknowledgement.entity';
import { EmergencyRollCall } from '../entities/emergency-roll-call.entity';
import { EmergencyTask } from '../entities/emergency-task.entity';

const BROADCAST_ROLES = ['platform_super_admin', 'tenant_admin', 'main_branch_admin', 'principal', 'deputy_principal', 'smt'];
const STAFF_ROLES = ['platform_super_admin', 'brand_admin', 'tenant_admin', 'main_branch_admin', 'branch_admin',
  'principal', 'deputy_principal', 'smt', 'hod', 'grade_head', 'phase_head',
  'class_teacher', 'subject_teacher', 'teacher', 'counsellor', 'nurse', 'security', 'hr_admin',
  'admissions_officer', 'finance_officer', 'reception', 'transport', 'aftercare', 'caretaker', 'staff'];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/emergencies')
export class AdminEmergenciesController {
  constructor(
    @InjectRepository(EmergencyAlert) private alertRepo: Repository<EmergencyAlert>,
    @InjectRepository(EmergencyAcknowledgement) private ackRepo: Repository<EmergencyAcknowledgement>,
    @InjectRepository(EmergencyRollCall) private rollCallRepo: Repository<EmergencyRollCall>,
    @InjectRepository(EmergencyTask) private taskRepo: Repository<EmergencyTask>,
    private dataSource: DataSource,
  ) {}

  private getRole(req: any): string {
    return req.user?.role || req.user?.customClaims?.role || '';
  }

  private canBroadcast(req: any): boolean {
    const role = this.getRole(req);
    return BROADCAST_ROLES.some(r => role.includes(r));
  }

  private isStaff(req: any): boolean {
    const role = this.getRole(req);
    return STAFF_ROLES.some(r => role.includes(r));
  }

  /* ------------------------------------------------------------------ */
  /*  POST /  — create draft alert                                      */
  /* ------------------------------------------------------------------ */
  @Post()
  async create(@Param('tenantId') tenantId: string, @Body() body: any, @Req() req: any) {
    if (!this.canBroadcast(req)) {
      throw new ForbiddenException('Only broadcast roles may create emergency alerts');
    }

    const alert = this.alertRepo.create({
      tenant_id: tenantId,
      created_by_id: req.user.uid || req.user.sub,
      status: EmergencyAlertStatus.DRAFT,
      type: body.type,
      severity: body.severity,
      headline: body.headline,
      body_instructions: body.body_instructions,
      scope: body.scope,
      scope_filter: body.scope_filter,
      request_safe_confirmation: body.request_safe_confirmation,
      request_roll_call: body.request_roll_call,
      channels: body.channels,
    } as any);

    return this.alertRepo.save(alert);
  }

  /* ------------------------------------------------------------------ */
  /*  GET /  — list alerts                                              */
  /* ------------------------------------------------------------------ */
  @Get()
  async list(
    @Param('tenantId') tenantId: string,
    @Query('status') status: string | undefined,
    @Req() req: any,
  ) {
    const where: any = { tenant_id: tenantId };
    if (status) {
      where.status = status;
    }

    return this.alertRepo.find({ where, order: { created_at: 'DESC' } });
  }

  /* ------------------------------------------------------------------ */
  /*  GET /:id  — alert detail with ack summary                        */
  /* ------------------------------------------------------------------ */
  @Get(':id')
  async detail(@Param('tenantId') tenantId: string, @Param('id') id: string, @Req() req: any) {
    const alert = await this.alertRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!alert) {
      throw new NotFoundException('Emergency alert not found');
    }

    const safeCt = await this.ackRepo.count({ where: { emergency_id: id, status: 'SAFE' as any } });
    const helpCt = await this.ackRepo.count({ where: { emergency_id: id, status: 'NEED_HELP' as any } });

    return {
      ...alert,
      ack_summary: { safe: safeCt, need_help: helpCt, total: safeCt + helpCt },
    };
  }

  /* ------------------------------------------------------------------ */
  /*  PATCH /:id/activate  — broadcast the alert                       */
  /* ------------------------------------------------------------------ */
  @Patch(':id/activate')
  async activate(@Param('tenantId') tenantId: string, @Param('id') id: string, @Req() req: any) {
    if (!this.canBroadcast(req)) {
      throw new ForbiddenException('Only broadcast roles may activate alerts');
    }

    const alert = await this.alertRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!alert) {
      throw new NotFoundException('Emergency alert not found');
    }

    alert.status = EmergencyAlertStatus.ACTIVE;
    (alert as any).activated_at = new Date();

    return this.alertRepo.save(alert);
  }

  /* ------------------------------------------------------------------ */
  /*  PATCH /:id/stand-down  — stand down the alert                    */
  /* ------------------------------------------------------------------ */
  @Patch(':id/stand-down')
  async standDown(@Param('tenantId') tenantId: string, @Param('id') id: string, @Req() req: any) {
    if (!this.canBroadcast(req)) {
      throw new ForbiddenException('Only broadcast roles may stand down alerts');
    }

    const alert = await this.alertRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!alert) {
      throw new NotFoundException('Emergency alert not found');
    }

    alert.status = EmergencyAlertStatus.STAND_DOWN;
    (alert as any).stood_down_at = new Date();

    return this.alertRepo.save(alert);
  }

  /* ------------------------------------------------------------------ */
  /*  POST /:id/acknowledgements  — acknowledge an alert               */
  /* ------------------------------------------------------------------ */
  @Post(':id/acknowledgements')
  async acknowledge(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const alert = await this.alertRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!alert) {
      throw new NotFoundException('Emergency alert not found');
    }

    const ack = this.ackRepo.create({
      emergency_id: id,
      tenant_id: tenantId,
      user_id: req.user.uid || req.user.sub,
      user_type: body.user_type || 'STAFF',
      status: body.status,
      note: body.note,
      acknowledged_at: new Date(),
    } as any);

    return this.ackRepo.save(ack);
  }

  /* ------------------------------------------------------------------ */
  /*  GET /:id/acknowledgements  — list acks for an alert              */
  /* ------------------------------------------------------------------ */
  @Get(':id/acknowledgements')
  async listAcknowledgements(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    if (!this.isStaff(req)) {
      throw new ForbiddenException('Only staff may view acknowledgements');
    }

    return this.ackRepo.find({
      where: { emergency_id: id },
      order: { acknowledged_at: 'DESC' },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  POST /:id/roll-calls  — submit a roll call                       */
  /* ------------------------------------------------------------------ */
  @Post(':id/roll-calls')
  async createRollCall(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    if (!this.isStaff(req)) {
      throw new ForbiddenException('Only staff may submit roll calls');
    }

    const rollCall = this.rollCallRepo.create({
      emergency_id: id,
      tenant_id: tenantId,
      staff_id: req.user.uid || req.user.sub,
      class_id: body.class_id,
      learner_statuses: body.learner_statuses,
      completed_at: new Date(),
    } as any);

    return this.rollCallRepo.save(rollCall);
  }

  /* ------------------------------------------------------------------ */
  /*  GET /:id/roll-calls  — list roll calls for an alert              */
  /* ------------------------------------------------------------------ */
  @Get(':id/roll-calls')
  async listRollCalls(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    if (!this.isStaff(req)) {
      throw new ForbiddenException('Only staff may view roll calls');
    }

    return this.rollCallRepo.find({ where: { emergency_id: id } });
  }

  /* ------------------------------------------------------------------ */
  /*  POST /:id/tasks  — create a task                                 */
  /* ------------------------------------------------------------------ */
  @Post(':id/tasks')
  async createTask(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    if (!this.canBroadcast(req)) {
      throw new ForbiddenException('Only broadcast roles may create tasks');
    }

    const task = this.taskRepo.create({
      emergency_id: id,
      tenant_id: tenantId,
      title: body.title,
      description: body.description,
      assigned_staff_id: body.assigned_staff_id,
      location: body.location,
      priority: body.priority,
      checklist_items: body.checklist_items,
    } as any);

    return this.taskRepo.save(task);
  }

  /* ------------------------------------------------------------------ */
  /*  PATCH /:id/tasks/:taskId  — update a task                        */
  /* ------------------------------------------------------------------ */
  @Patch(':id/tasks/:taskId')
  async updateTask(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    if (!this.isStaff(req)) {
      throw new ForbiddenException('Only staff may update tasks');
    }

    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (body.status !== undefined) {
      task.status = body.status;
    }
    if (body.checklist_items !== undefined) {
      (task as any).checklist_items = body.checklist_items;
    }

    return this.taskRepo.save(task);
  }
}
