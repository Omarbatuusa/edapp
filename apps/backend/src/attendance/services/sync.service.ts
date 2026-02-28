import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceEventService } from './attendance-event.service';
import { AttendancePolicy } from '../entities/attendance-policy.entity';
import { SchoolClass } from '../entities/class.entity';
import { User } from '../../users/user.entity';
import { RoleAssignment, UserRole } from '../../users/role-assignment.entity';
import { RecordEventDto } from '../dto/record-event.dto';

export interface SyncPullResponse {
    policy: AttendancePolicy | null;
    roster: { user_id: string; display_name: string; student_number?: string; class_ids: string[] }[];
    classes: { id: string; class_code: string; section_name: string; learner_user_ids: string[] }[];
    server_time: string;
}

@Injectable()
export class SyncService {
    private readonly logger = new Logger(SyncService.name);

    constructor(
        private eventService: AttendanceEventService,
        @InjectRepository(AttendancePolicy)
        private policyRepo: Repository<AttendancePolicy>,
        @InjectRepository(SchoolClass)
        private classRepo: Repository<SchoolClass>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(RoleAssignment)
        private roleRepo: Repository<RoleAssignment>,
    ) {}

    async pushBatch(events: RecordEventDto[]) {
        return this.eventService.recordBatch(events);
    }

    async pullPolicies(tenant_id: string, branch_id: string): Promise<SyncPullResponse> {
        // Get effective policy (branch-specific or tenant-wide)
        let policy = await this.policyRepo.findOne({
            where: { tenant_id, branch_id, is_active: true },
        });
        if (!policy) {
            policy = await this.policyRepo.findOne({
                where: { tenant_id, branch_id: null as any, is_active: true },
            });
        }

        // Get classes for this branch
        const classes = await this.classRepo.find({
            where: { tenant_id, branch_id, is_active: true },
        });

        // Get learner roster for this branch
        const learnerRoles = await this.roleRepo.find({
            where: {
                tenant_id,
                role: UserRole.LEARNER,
                is_active: true,
            },
            relations: ['user'],
        });

        const roster = learnerRoles
            .filter(r => r.user)
            .map(r => ({
                user_id: r.user_id,
                display_name: r.user?.display_name || `${r.user?.first_name || ''} ${r.user?.last_name || ''}`.trim(),
                student_number: r.user?.student_number,
                class_ids: classes
                    .filter(c => c.learner_user_ids?.includes(r.user_id))
                    .map(c => c.id),
            }));

        return {
            policy,
            roster,
            classes: classes.map(c => ({
                id: c.id,
                class_code: c.class_code,
                section_name: c.section_name,
                learner_user_ids: c.learner_user_ids || [],
            })),
            server_time: new Date().toISOString(),
        };
    }

    async ackSync(event_ids: string[]): Promise<{ acknowledged: number }> {
        // Mark events as synced (no-op since they're already persisted, but useful for client tracking)
        this.logger.log(`Acknowledged sync for ${event_ids.length} events`);
        return { acknowledged: event_ids.length };
    }
}
