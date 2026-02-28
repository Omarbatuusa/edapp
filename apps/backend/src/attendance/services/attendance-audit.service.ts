import { Injectable, Logger } from '@nestjs/common';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class AttendanceAuditService {
    private readonly logger = new Logger(AttendanceAuditService.name);

    constructor(private auditService: AuditService) {}

    async logOverride(
        tenant_id: string,
        actor_user_id: string,
        event_id: string,
        reason: string,
        before: Record<string, any>,
        after: Record<string, any>,
    ): Promise<void> {
        await this.auditService.log({
            action: 'attendance_override',
            tenantId: tenant_id,
            userId: actor_user_id,
            metadata: { event_id, reason, before, after },
        });
    }

    async logPolicyChange(
        tenant_id: string,
        actor_user_id: string,
        policy_id: string,
        before: Record<string, any>,
        after: Record<string, any>,
    ): Promise<void> {
        await this.auditService.log({
            action: 'attendance_policy_change',
            tenantId: tenant_id,
            userId: actor_user_id,
            metadata: { policy_id, before, after },
        });
    }

    async logDeviceChange(
        tenant_id: string,
        actor_user_id: string,
        device_id: string,
        action: 'registered' | 'deactivated' | 'updated',
    ): Promise<void> {
        await this.auditService.log({
            action: `kiosk_device_${action}`,
            tenantId: tenant_id,
            userId: actor_user_id,
            metadata: { device_id },
        });
    }

    async logApprovalAction(
        tenant_id: string,
        actor_user_id: string,
        request_id: string,
        action: 'approved' | 'rejected' | 'completed',
    ): Promise<void> {
        await this.auditService.log({
            action: `early_leave_${action}`,
            tenantId: tenant_id,
            userId: actor_user_id,
            metadata: { request_id },
        });
    }
}
