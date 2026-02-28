import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassRegister, RegisterMark } from '../entities/class-register.entity';
import { AttendanceEventService } from './attendance-event.service';
import { SchoolClass } from '../entities/class.entity';
import { SubjectType, AttendanceEventType, AttendanceSourceType } from '../entities/attendance-event.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ClassRegisterService {
    private readonly logger = new Logger(ClassRegisterService.name);

    constructor(
        @InjectRepository(ClassRegister)
        private registerRepo: Repository<ClassRegister>,
        @InjectRepository(SchoolClass)
        private classRepo: Repository<SchoolClass>,
        private eventService: AttendanceEventService,
    ) {}

    async submitRegister(
        tenant_id: string,
        branch_id: string,
        class_id: string,
        date: string,
        teacher_user_id: string,
        marks: RegisterMark[],
    ): Promise<ClassRegister> {
        // Check if register already exists
        let register = await this.registerRepo.findOne({
            where: { tenant_id, class_id, date },
        });

        if (register && register.is_final) {
            throw new ConflictException('Register already finalized for this date');
        }

        if (register) {
            register.marks = marks;
            register.teacher_user_id = teacher_user_id;
            register.submitted_at = new Date();
        } else {
            register = this.registerRepo.create({
                tenant_id,
                branch_id,
                class_id,
                date,
                teacher_user_id,
                marks,
                submitted_at: new Date(),
            });
        }

        const saved = await this.registerRepo.save(register);

        // Emit REGISTER_MARK events for each learner
        for (const mark of marks) {
            await this.eventService.recordEvent({
                tenant_id,
                branch_id,
                subject_type: SubjectType.LEARNER,
                subject_user_id: mark.learner_user_id,
                event_type: AttendanceEventType.REGISTER_MARK,
                source: AttendanceSourceType.TEACHER_REGISTER,
                class_id,
                actor_user_id: teacher_user_id,
                captured_at_device: new Date().toISOString(),
                idempotency_key: `register-${class_id}-${date}-${mark.learner_user_id}`,
                metadata: { status: mark.status, notes: mark.notes },
            });
        }

        this.logger.log(`Register submitted for class ${class_id} on ${date} by ${teacher_user_id}`);
        return saved;
    }

    async getRegister(
        tenant_id: string,
        class_id: string,
        date: string,
    ): Promise<ClassRegister | null> {
        return this.registerRepo.findOne({
            where: { tenant_id, class_id, date },
        });
    }

    async getTeacherClasses(
        tenant_id: string,
        teacher_user_id: string,
    ): Promise<SchoolClass[]> {
        return this.classRepo.find({
            where: { tenant_id, class_teacher_id: teacher_user_id, is_active: true },
            order: { section_name: 'ASC' },
        });
    }

    async getRegistersForBranch(
        tenant_id: string,
        branch_id: string,
        date: string,
    ): Promise<ClassRegister[]> {
        return this.registerRepo.find({
            where: { tenant_id, branch_id, date },
            order: { created_at: 'DESC' },
        });
    }
}
