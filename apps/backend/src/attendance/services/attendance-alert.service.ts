import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PushService } from '../../notifications/push.service';
import { Notification } from '../../communication/notification.entity';
import { RoleAssignment, UserRole } from '../../users/role-assignment.entity';
import { User } from '../../users/user.entity';
import { AttendancePolicy } from '../entities/attendance-policy.entity';

@Injectable()
export class AttendanceAlertService {
    private readonly logger = new Logger(AttendanceAlertService.name);

    constructor(
        private pushService: PushService,
        @InjectRepository(Notification)
        private notificationRepo: Repository<Notification>,
        @InjectRepository(RoleAssignment)
        private roleRepo: Repository<RoleAssignment>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(AttendancePolicy)
        private policyRepo: Repository<AttendancePolicy>,
    ) {}

    async handleStaffLate(
        tenant_id: string,
        branch_id: string,
        user_id: string,
        late_minutes: number,
    ): Promise<void> {
        const user = await this.userRepo.findOne({ where: { id: user_id } });
        const staffName = user?.display_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Staff member';

        // Get alert chain from policy
        const policy = await this.getPolicy(tenant_id, branch_id);
        const chain = policy?.alert_routing?.chain || ['principal', 'deputy_principal'];

        // Find users with those roles in this tenant/branch
        const recipientIds = await this.getAlertRecipients(tenant_id, branch_id, chain);

        if (recipientIds.length === 0) {
            this.logger.warn(`No alert recipients found for tenant ${tenant_id} branch ${branch_id}`);
            return;
        }

        const title = 'Staff Late Arrival';
        const body = `${staffName} arrived ${Math.round(late_minutes)} minutes late`;

        // Create in-app notifications
        for (const recipientId of recipientIds) {
            const notification = this.notificationRepo.create({
                tenant_id,
                user_id: recipientId,
                type: 'GENERAL' as any,
                urgency: late_minutes > 30 ? 'HIGH' as any : 'NORMAL' as any,
                title,
                body,
                action: { type: 'navigate', target: '/admin/attendance' } as any,
                reference_type: 'attendance_alert',
                reference_id: user_id,
            });
            await this.notificationRepo.save(notification);
        }

        // Send push notifications
        await this.pushService.sendToUsers(recipientIds, {
            title,
            body,
            data: { type: 'staff_late', user_id, late_minutes: String(late_minutes) },
        }, { priority: 'high' });

        this.logger.log(`Late alert sent for ${staffName}: ${late_minutes}min to ${recipientIds.length} recipients`);
    }

    async handleMissingCheckout(
        tenant_id: string,
        branch_id: string,
        user_id: string,
    ): Promise<void> {
        const user = await this.userRepo.findOne({ where: { id: user_id } });
        const name = user?.display_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

        const recipientIds = await this.getAlertRecipients(tenant_id, branch_id, ['principal', 'hr_admin']);

        for (const recipientId of recipientIds) {
            const notification = this.notificationRepo.create({
                tenant_id,
                user_id: recipientId,
                type: 'GENERAL' as any,
                urgency: 'NORMAL' as any,
                title: 'Missing Checkout',
                body: `${name} did not check out today`,
                reference_type: 'missing_checkout',
                reference_id: user_id,
            });
            await this.notificationRepo.save(notification);
        }
    }

    async handleLearnerLate(
        tenant_id: string,
        branch_id: string,
        learner_user_id: string,
        late_minutes: number,
    ): Promise<void> {
        const user = await this.userRepo.findOne({ where: { id: learner_user_id } });
        const name = user?.display_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

        const recipientIds = await this.getAlertRecipients(tenant_id, branch_id, ['class_teacher', 'grade_head']);

        for (const recipientId of recipientIds) {
            const notification = this.notificationRepo.create({
                tenant_id,
                user_id: recipientId,
                type: 'GENERAL' as any,
                urgency: 'NORMAL' as any,
                title: 'Learner Late Arrival',
                body: `${name} arrived ${Math.round(late_minutes)} minutes late`,
                reference_type: 'learner_late',
                reference_id: learner_user_id,
            });
            await this.notificationRepo.save(notification);
        }
    }

    async handleEarlyLeaveApproved(
        tenant_id: string,
        branch_id: string,
        learner_user_id: string,
        pickup_person_name: string,
    ): Promise<void> {
        // Notify gate/reception about approved early leave
        const recipientIds = await this.getAlertRecipients(tenant_id, branch_id, ['reception', 'security']);

        const user = await this.userRepo.findOne({ where: { id: learner_user_id } });
        const name = user?.display_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

        for (const recipientId of recipientIds) {
            const notification = this.notificationRepo.create({
                tenant_id,
                user_id: recipientId,
                type: 'GENERAL' as any,
                urgency: 'HIGH' as any,
                title: 'Early Leave Approved',
                body: `${name} approved for early pickup by ${pickup_person_name}`,
                reference_type: 'early_leave',
                reference_id: learner_user_id,
            });
            await this.notificationRepo.save(notification);
        }

        await this.pushService.sendToUsers(recipientIds, {
            title: 'Early Leave Approved',
            body: `${name} - pickup by ${pickup_person_name}`,
            data: { type: 'early_leave_approved', learner_user_id },
        }, { priority: 'high' });
    }

    private async getAlertRecipients(
        tenant_id: string,
        branch_id: string,
        roles: string[],
    ): Promise<string[]> {
        const roleEnums = roles.map(r => r as UserRole);
        const assignments = await this.roleRepo.find({
            where: [
                { tenant_id, role: In(roleEnums), is_active: true, branch_id },
                { tenant_id, role: In(roleEnums), is_active: true },
            ],
        });

        return [...new Set(assignments.map(a => a.user_id))];
    }

    private async getPolicy(tenant_id: string, branch_id: string): Promise<AttendancePolicy | null> {
        return this.policyRepo.findOne({
            where: [
                { tenant_id, branch_id, is_active: true },
                { tenant_id, branch_id: null as any, is_active: true },
            ],
        });
    }
}
