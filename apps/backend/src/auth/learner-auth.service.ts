import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcryptjs';

// Assuming you have a User/Student entity
interface Student {
    id: string;
    student_number: string;
    pin_hash: string;
    tenant_id: string;
    name: string;
}

@Injectable()
export class LearnerAuthService {
    constructor(
        // @InjectRepository(Student)
        // private studentRepository: Repository<Student>,
    ) { }

    async validateLearner(
        studentNumber: string,
        pin: string,
        tenantSlug: string,
    ): Promise<{ customToken: string; user: any }> {
        // TODO: Implement actual database lookup
        // For now, this is a placeholder implementation

        // 1. Find student by student_number and tenant
        // const student = await this.studentRepository.findOne({
        //   where: { student_number: studentNumber, tenant: { slug: tenantSlug } },
        //   relations: ['tenant'],
        // });

        // 2. Verify PIN
        // if (!student || !(await bcrypt.compare(pin, student.pin_hash))) {
        //   throw new UnauthorizedException('Invalid student number or PIN');
        // }

        // 3. Generate Firebase custom token
        const customToken = await admin.auth().createCustomToken(`learner_${studentNumber}`, {
            role: 'learner',
            tenant: tenantSlug,
            studentNumber,
        });

        return {
            customToken,
            user: {
                id: `learner_${studentNumber}`,
                name: 'Student Name', // Replace with actual student name
                role: 'learner',
                studentNumber,
            },
        };
    }
}
