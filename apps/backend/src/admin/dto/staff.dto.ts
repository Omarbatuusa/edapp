import {
    IsOptional, IsString, IsEmail, IsArray, IsObject,
    MinLength, IsDateString, IsUUID,
} from 'class-validator';

export class CreateStaffDto {
    @IsEmail()
    email: string;

    @IsString() @MinLength(2)
    first_name: string;

    @IsString() @MinLength(2)
    last_name: string;

    @IsOptional() @IsUUID()
    branch_id?: string;

    @IsOptional() @IsString()
    title_code?: string;

    @IsOptional() @IsDateString()
    date_of_birth?: string;

    @IsOptional() @IsString()
    gender_code?: string;

    @IsOptional() @IsString()
    citizenship_type_code?: string;

    @IsOptional() @IsString()
    id_number?: string;

    @IsOptional() @IsString()
    passport_number?: string;

    @IsOptional() @IsObject()
    address?: Record<string, any>;

    @IsOptional() @IsDateString()
    joining_date?: string;

    @IsOptional() @IsString()
    employment_type_code?: string;

    @IsOptional() @IsArray()
    assigned_roles?: string[];

    @IsOptional() @IsString()
    sace_number?: string;

    @IsOptional() @IsString()
    teaching_level_code?: string;

    @IsOptional() @IsString()
    reqv_level_code?: string;

    @IsOptional()
    phone_mobile?: any;

    @IsOptional()
    phone_work?: any;

    @IsOptional() @IsArray()
    medical_disabilities?: string[];

    @IsOptional() @IsString()
    medical_aid_provider_code?: string;

    @IsOptional() @IsArray()
    emergency_contacts?: Record<string, any>[];

    @IsOptional() @IsArray()
    documents?: Record<string, any>[];

    @IsOptional() @IsString()
    race_code?: string;

    @IsOptional() @IsString()
    religion_code?: string;

    @IsOptional() @IsString()
    photo_url?: string;

    @IsOptional() @IsString()
    medical_aid_number?: string;

    @IsOptional() @IsArray()
    allergies?: string[];

    @IsOptional() @IsArray()
    conditions?: string[];

    @IsOptional() @IsUUID()
    family_doctor_id?: string;
}

export class UpdateStaffDto {
    @IsOptional() @IsEmail()
    email?: string;

    @IsOptional() @IsString() @MinLength(2)
    first_name?: string;

    @IsOptional() @IsString() @MinLength(2)
    last_name?: string;

    @IsOptional() @IsUUID()
    branch_id?: string;

    @IsOptional() @IsString()
    title_code?: string;

    @IsOptional() @IsDateString()
    date_of_birth?: string;

    @IsOptional() @IsString()
    gender_code?: string;

    @IsOptional() @IsString()
    citizenship_type_code?: string;

    @IsOptional() @IsString()
    id_number?: string;

    @IsOptional() @IsString()
    passport_number?: string;

    @IsOptional() @IsObject()
    address?: Record<string, any>;

    @IsOptional() @IsDateString()
    joining_date?: string;

    @IsOptional() @IsString()
    employment_type_code?: string;

    @IsOptional() @IsArray()
    assigned_roles?: string[];

    @IsOptional() @IsString()
    sace_number?: string;

    @IsOptional() @IsString()
    teaching_level_code?: string;

    @IsOptional() @IsString()
    reqv_level_code?: string;

    @IsOptional()
    phone_mobile?: any;

    @IsOptional()
    phone_work?: any;

    @IsOptional() @IsArray()
    medical_disabilities?: string[];

    @IsOptional() @IsString()
    medical_aid_provider_code?: string;

    @IsOptional() @IsArray()
    emergency_contacts?: Record<string, any>[];

    @IsOptional() @IsArray()
    documents?: Record<string, any>[];

    @IsOptional() @IsString()
    race_code?: string;

    @IsOptional() @IsString()
    religion_code?: string;

    @IsOptional() @IsString()
    photo_url?: string;

    @IsOptional() @IsString()
    medical_aid_number?: string;

    @IsOptional() @IsArray()
    allergies?: string[];

    @IsOptional() @IsArray()
    conditions?: string[];

    @IsOptional() @IsUUID()
    family_doctor_id?: string;
}
