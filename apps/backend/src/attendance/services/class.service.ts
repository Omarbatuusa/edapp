import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolClass } from '../entities/class.entity';

@Injectable()
export class ClassService {
    constructor(
        @InjectRepository(SchoolClass)
        private classRepo: Repository<SchoolClass>,
    ) {}

    async createClass(
        tenant_id: string,
        dto: {
            branch_id: string;
            grade_id?: string;
            section_name: string;
            class_code: string;
            class_teacher_id?: string;
            academic_year?: string;
            learner_user_ids?: string[];
        },
    ): Promise<SchoolClass> {
        const cls = this.classRepo.create({
            tenant_id,
            ...dto,
        });
        return this.classRepo.save(cls);
    }

    async updateClass(
        tenant_id: string,
        class_id: string,
        dto: Partial<{
            section_name: string;
            class_teacher_id: string;
            is_active: boolean;
            learner_user_ids: string[];
        }>,
    ): Promise<SchoolClass> {
        const cls = await this.classRepo.findOne({
            where: { id: class_id, tenant_id },
        });
        if (!cls) throw new NotFoundException('Class not found');
        Object.assign(cls, dto);
        return this.classRepo.save(cls);
    }

    async listClasses(
        tenant_id: string,
        branch_id?: string,
        filters?: { grade_id?: string; is_active?: boolean; academic_year?: string },
    ): Promise<SchoolClass[]> {
        const where: any = { tenant_id };
        if (branch_id) where.branch_id = branch_id;
        if (filters?.grade_id) where.grade_id = filters.grade_id;
        if (filters?.is_active !== undefined) where.is_active = filters.is_active;
        if (filters?.academic_year) where.academic_year = filters.academic_year;

        return this.classRepo.find({ where, order: { section_name: 'ASC' } });
    }

    async getClass(tenant_id: string, class_id: string): Promise<SchoolClass | null> {
        return this.classRepo.findOne({ where: { id: class_id, tenant_id } });
    }

    async getClassLearners(tenant_id: string, class_id: string): Promise<string[]> {
        const cls = await this.classRepo.findOne({ where: { id: class_id, tenant_id } });
        return cls?.learner_user_ids || [];
    }
}
