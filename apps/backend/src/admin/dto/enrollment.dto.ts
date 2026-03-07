import { IsOptional, IsObject, IsInt, IsString, IsEmail, IsNotEmpty, IsBoolean, IsArray, Min, Max } from 'class-validator';

export class UpdateEnrollmentDraftDto {
    @IsOptional() @IsObject()
    placement_data?: Record<string, any>;

    @IsOptional() @IsObject()
    learner_data?: Record<string, any>;

    @IsOptional() @IsObject()
    academic_data?: Record<string, any>;

    @IsOptional() @IsObject()
    subjects_data?: Record<string, any>;

    @IsOptional() @IsObject()
    aftercare_data?: Record<string, any>;

    @IsOptional() @IsObject()
    medical_data?: Record<string, any>;

    @IsOptional() @IsArray()
    guardians_data?: Record<string, any>[];

    @IsOptional() @IsArray()
    emergency_contacts?: Record<string, any>[];

    @IsOptional() @IsArray()
    uploaded_documents?: Array<{ doc_type: string; object_key: string; filename: string; uploaded_at: string }>;

    @IsOptional() @IsInt() @Min(1) @Max(13)
    current_step?: number;

    @IsOptional() @IsBoolean()
    document_checklist_ack?: boolean;

    @IsOptional() @IsBoolean()
    acceptance_ack?: boolean;

    @IsOptional() @IsString()
    branch_id?: string;

    @IsOptional() @IsString()
    brand_id?: string;

    @IsOptional() @IsString()
    main_branch_id?: string;
}

export class SubmitEnrollmentDto {
    @IsOptional() @IsEmail()
    submitted_by_email?: string;

    @IsOptional() @IsString()
    submitted_by_phone?: string;
}

export class RejectEnrollmentDto {
    @IsString() @IsNotEmpty()
    reason: string;
}
