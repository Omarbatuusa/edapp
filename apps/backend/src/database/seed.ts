import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Brand, BrandStatus } from '../brands/brand.entity';
import { Tenant, TenantStatus } from '../tenants/tenant.entity';
import { TenantDomain, TenantDomainType } from '../tenants/tenant-domain.entity';
import { Branch } from '../branches/branch.entity';
import { User, UserStatus } from '../users/user.entity';
import { RoleAssignment, UserRole } from '../users/role-assignment.entity';
import { Thread, ThreadType } from '../communication/thread.entity';
import { ThreadMember, MemberRole, MemberPermission } from '../communication/thread-member.entity';
import { Message, MessageType } from '../communication/message.entity';
import { ParentChildLink } from '../communication/parent-child-link.entity';
import { DictPhase } from '../admin/entities/dict-phase.entity';
import { DictGrade } from '../admin/entities/dict-grade.entity';
import { DictClassGender } from '../admin/entities/dict-class-gender.entity';
import { DictSubjectCategory } from '../admin/entities/dict-subject-category.entity';
import { DictSubjectType } from '../admin/entities/dict-subject-type.entity';
import { DictLanguageLevel } from '../admin/entities/dict-language-level.entity';
import { DictLanguageHL } from '../admin/entities/dict-language-hl.entity';
import { DictLanguageFAL } from '../admin/entities/dict-language-fal.entity';
import { DictSalutation } from '../admin/entities/dict-salutation.entity';
import { DictReligion } from '../admin/entities/dict-religion.entity';
import { DictTeachingLeadershipStaff } from '../admin/entities/dict-teaching-leadership-staff.entity';
import { DictNonTeachingSupportStaff } from '../admin/entities/dict-non-teaching-support-staff.entity';
import { DictOptionalAdminRole } from '../admin/entities/dict-optional-admin-role.entity';
import { DictCurriculumAuthority } from '../admin/entities/dict-curriculum-authority.entity';
import { DictCertificationType } from '../admin/entities/dict-certification-type.entity';
import { DictAcademicDocument } from '../admin/entities/dict-academic-document.entity';
import { DictReqvLevel } from '../admin/entities/dict-reqv-level.entity';
import { DictCitizenshipType } from '../admin/entities/dict-citizenship-type.entity';
import { DictMedicalAidProvider } from '../admin/entities/dict-medical-aid-provider.entity';
import { DictEmergencyRelationship } from '../admin/entities/dict-emergency-relationship.entity';
import { DictMaritalStatus } from '../admin/entities/dict-marital-status.entity';
import { DictCertSubjectProvider } from '../admin/entities/dict-cert-subject-provider.entity';
import { DictTeachingLevel } from '../admin/entities/dict-teaching-level.entity';
import { DictAcademicYearStructure } from '../admin/entities/dict-academic-year-structure.entity';
import { DictQualificationPathway } from '../admin/entities/dict-qualification-pathway.entity';
import { DictExamBody } from '../admin/entities/dict-exam-body.entity';
import { DictCurriculumName } from '../admin/entities/dict-curriculum-name.entity';
import { DictMedicalDisability } from '../admin/entities/dict-medical-disability.entity';
import { DictSchoolAllergy } from '../admin/entities/dict-school-allergy.entity';
import { DictPsychologicalIssue } from '../admin/entities/dict-psychological-issue.entity';
import { DictEducationalDisability } from '../admin/entities/dict-educational-disability.entity';
import { DictSupportProfile } from '../admin/entities/dict-support-profile.entity';
import { DictTherapyType } from '../admin/entities/dict-therapy-type.entity';
import { DictBloodType } from '../admin/entities/dict-blood-type.entity';
import { DictMonth } from '../admin/entities/dict-month.entity';
import { DictProgrammeType } from '../admin/entities/dict-programme-type.entity';
import { DictSubjectLanguageLevel } from '../admin/entities/dict-subject-language-level.entity';
import { DictAssessmentModel } from '../admin/entities/dict-assessment-model.entity';
import { DictSubjectGroup } from '../admin/entities/dict-subject-group.entity';
import { DictHomeLanguage } from '../admin/entities/dict-home-language.entity';
import { DictParentRight } from '../admin/entities/dict-parent-right.entity';
import { DictCompulsorySubject } from '../admin/entities/dict-compulsory-subject.entity';
import { DictSubject } from '../admin/entities/dict-subject.entity';
import { Subject } from '../admin/entities/subject.entity';
import { TenantFeature } from '../admin/entities/tenant-feature.entity';
import { AdmissionsProcessCard, AdmissionsCardType } from '../admin/entities/admissions-process-card.entity';
import { SubjectStream } from '../admin/entities/subject-stream.entity';
import { AuditEvent } from '../admin/entities/audit-event.entity';
import { TenantPhaseLink } from '../admin/entities/tenant-phase-link.entity';
import { TenantGradeLink } from '../admin/entities/tenant-grade-link.entity';
import { SubjectOffering } from '../admin/entities/subject-offering.entity';
import { SchoolClass } from '../attendance/entities/class.entity';
import { AttendancePolicy } from '../attendance/entities/attendance-policy.entity';
import { KioskDevice, ScanPointType } from '../attendance/entities/kiosk-device.entity';
import { AttendanceEvent, SubjectType, AttendanceEventType, AttendanceSourceType, EventPolicyDecision } from '../attendance/entities/attendance-event.entity';

const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://edapp:edapp123@localhost:5432/edapp',
    entities: [
        Brand, Tenant, TenantDomain, Branch, User, RoleAssignment,
        Thread, ThreadMember, Message, ParentChildLink,
        DictPhase, DictGrade, DictClassGender, DictSubjectCategory,
        DictSubjectType, DictLanguageLevel, DictLanguageHL, DictLanguageFAL,
        DictSalutation, DictReligion,
        DictTeachingLeadershipStaff, DictNonTeachingSupportStaff, DictOptionalAdminRole,
        DictCurriculumAuthority, DictCertificationType, DictAcademicDocument, DictReqvLevel,
        DictCitizenshipType, DictMedicalAidProvider, DictEmergencyRelationship, DictMaritalStatus,
        DictCertSubjectProvider, DictTeachingLevel, DictAcademicYearStructure, DictQualificationPathway,
        DictExamBody, DictCurriculumName, DictMedicalDisability, DictSchoolAllergy,
        DictPsychologicalIssue, DictEducationalDisability, DictSupportProfile, DictTherapyType,
        DictBloodType, DictMonth, DictProgrammeType, DictSubjectLanguageLevel,
        DictAssessmentModel, DictSubjectGroup, DictHomeLanguage, DictParentRight,
        DictCompulsorySubject, DictSubject,
        Subject, TenantFeature,
        AdmissionsProcessCard, SubjectStream, AuditEvent,
        TenantPhaseLink, TenantGradeLink, SubjectOffering,
        SchoolClass, AttendancePolicy, KioskDevice, AttendanceEvent,
    ],
    synchronize: true,
    logging: false,
});

const DEFAULT_AUTH_CONFIG = {
    enable_email_password: true,
    enable_email_magic_link: true,
    enable_google_signin: false,
    enable_student_pin: true,
    pin_length: 4,
};

const DEFAULT_FEATURES = [
    { feature_key: 'FINANCE_MODE', is_enabled: false, config: { mode: 'disabled' } },
    { feature_key: 'SAGE_ONE', is_enabled: false, config: null },
    { feature_key: 'SAGE_PASTEL', is_enabled: false, config: null },
    { feature_key: 'ADMISSIONS_ONLINE', is_enabled: true, config: null },
    { feature_key: 'SMS_ENABLED', is_enabled: false, config: null },
    { feature_key: 'TRANSPORT_MODULE', is_enabled: false, config: null },
    { feature_key: 'TIMETABLE_MODULE', is_enabled: false, config: null },
];

async function seed() {
    console.log('🌱 Starting database seed...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Clear existing data
    await AppDataSource.query(`
        TRUNCATE
            admissions_process_cards,
            audit_events,
            subject_offerings,
            subject_streams,
            tenant_phase_links,
            tenant_grade_links,
            tenant_features,
            subjects,
            dict_religions, dict_salutations, dict_languages_fal, dict_languages_hl,
            dict_language_levels, dict_subject_types, dict_subject_categories,
            dict_class_genders, dict_grades, dict_phases,
            dict_teaching_leadership_staff, dict_non_teaching_support_staff,
            dict_optional_admin_roles, dict_curriculum_authorities, dict_certification_types,
            dict_academic_documents, dict_reqv_levels, dict_citizenship_types,
            dict_medical_aid_providers, dict_emergency_relationships, dict_marital_statuses,
            dict_cert_subject_providers, dict_teaching_levels, dict_academic_year_structures,
            dict_qualification_pathways, dict_exam_bodies, dict_curriculum_names,
            dict_medical_disabilities, dict_school_allergies, dict_psychological_issues,
            dict_educational_disabilities, dict_support_profiles, dict_therapy_types,
            dict_blood_types, dict_months, dict_programme_types, dict_subject_language_levels,
            dict_assessment_models, dict_subject_groups, dict_home_languages,
            dict_parent_rights, dict_compulsory_subjects, dict_subjects,
            brands, tenants, tenant_domains, branches, users, role_assignments,
            threads, thread_members, messages, parent_child_links
        CASCADE
    `);
    console.log('🗑️  Cleared existing data');

    const brandRepo = AppDataSource.getRepository(Brand);
    const tenantRepo = AppDataSource.getRepository(Tenant);
    const domainRepo = AppDataSource.getRepository(TenantDomain);
    const branchRepo = AppDataSource.getRepository(Branch);
    const userRepo = AppDataSource.getRepository(User);
    const roleRepo = AppDataSource.getRepository(RoleAssignment);
    const featureRepo = AppDataSource.getRepository(TenantFeature);
    const admissionsRepo = AppDataSource.getRepository(AdmissionsProcessCard);
    const streamRepo = AppDataSource.getRepository(SubjectStream);

    // ========== 1. BRANDS ==========
    console.log('\n📦 Creating brands...');

    const brands = await brandRepo.save([
        { brand_code: 'LAK', brand_name: 'Lakewood School', status: BrandStatus.ACTIVE },
        { brand_code: 'ALL', brand_name: 'Allied Schools', status: BrandStatus.ACTIVE },
        { brand_code: 'JEP', brand_name: 'Jeppe College', status: BrandStatus.ACTIVE },
        { brand_code: 'RCS', brand_name: 'Rainbow City Schools', status: BrandStatus.ACTIVE },
    ]);

    const brandMap = Object.fromEntries(brands.map(b => [b.brand_code, b]));
    console.log(`   ✅ Created ${brands.length} brands`);

    // ========== 2. TENANTS (7) ==========
    console.log('\n🏫 Creating tenants...');

    const tenants = await tenantRepo.save([
        { brand_id: brandMap['LAK'].id, tenant_slug: 'lakewood', school_code: 'LAK-001', school_name: 'Lakewood Primary School', status: TenantStatus.ACTIVE, auth_config: DEFAULT_AUTH_CONFIG },
        { brand_id: brandMap['ALL'].id, tenant_slug: 'allied-sandton', school_code: 'ALL-001', school_name: 'Allied School Sandton', status: TenantStatus.ACTIVE, auth_config: DEFAULT_AUTH_CONFIG },
        { brand_id: brandMap['ALL'].id, tenant_slug: 'allied-pretoria', school_code: 'ALL-002', school_name: 'Allied School Pretoria', status: TenantStatus.ACTIVE, auth_config: DEFAULT_AUTH_CONFIG },
        { brand_id: brandMap['ALL'].id, tenant_slug: 'allied-jhb', school_code: 'ALL-003', school_name: 'Allied School Johannesburg', status: TenantStatus.ACTIVE, auth_config: DEFAULT_AUTH_CONFIG },
        { brand_id: brandMap['ALL'].id, tenant_slug: 'allied-durban', school_code: 'ALL-004', school_name: 'Allied School Durban', status: TenantStatus.ACTIVE, auth_config: DEFAULT_AUTH_CONFIG },
        { brand_id: brandMap['JEP'].id, tenant_slug: 'jeppe', school_code: 'JEP-001', school_name: 'Jeppe College', status: TenantStatus.ACTIVE, auth_config: DEFAULT_AUTH_CONFIG },
        { brand_id: brandMap['RCS'].id, tenant_slug: 'rainbow-city', school_code: 'RCS-001', school_name: 'Rainbow City Primary', status: TenantStatus.ACTIVE, auth_config: DEFAULT_AUTH_CONFIG },
    ]);

    const tenantMap = Object.fromEntries(tenants.map(t => [t.tenant_slug, t]));
    console.log(`   ✅ Created ${tenants.length} tenants`);

    // ========== 3. TENANT DOMAINS ==========
    console.log('\n🌐 Creating tenant domains...');
    const domains: Partial<TenantDomain>[] = [];
    for (const tenant of tenants) {
        domains.push(
            { tenant_id: tenant.id, type: TenantDomainType.APP, host: `${tenant.tenant_slug}.edapp.co.za`, is_primary: true },
            { tenant_id: tenant.id, type: TenantDomainType.APPLY, host: `apply-${tenant.tenant_slug}.edapp.co.za`, is_primary: true },
        );
    }
    await domainRepo.save(domains);
    console.log(`   ✅ Created ${domains.length} tenant domains`);

    // ========== 4. BRANCHES ==========
    console.log('\n🏢 Creating branches...');

    await branchRepo.save([
        { tenant_id: tenantMap['lakewood'].id, branch_code: 'LAK-MAIN', branch_name: 'Lakewood Main Campus', is_main_branch: true, physical_address: 'Ormonde, Johannesburg, 2091', phone_landline: '010 023 6117', mobile_whatsapp: '072 741 3979', branch_email: 'info@lakewoodacademy.co.za' },
        { tenant_id: tenantMap['allied-sandton'].id, branch_code: 'ALL-SDN', branch_name: 'Allied School Sandton', is_main_branch: true, physical_address: '9 Alamein Road, Robertsham, Johannesburg', phone_landline: '011 433 8272', branch_email: 'info@alliedschools.co.za' },
        { tenant_id: tenantMap['allied-pretoria'].id, branch_code: 'ALL-PTA', branch_name: 'Allied School Pretoria', is_main_branch: true, physical_address: 'Pretoria, Gauteng', branch_email: 'pretoria@alliedschools.co.za' },
        { tenant_id: tenantMap['allied-jhb'].id, branch_code: 'ALL-JHB', branch_name: 'Allied School Johannesburg', is_main_branch: true, physical_address: '43 Burghersdorp Str, Fordsburg, Johannesburg', branch_email: 'jhb@alliedschools.co.za' },
        { tenant_id: tenantMap['allied-durban'].id, branch_code: 'ALL-DBN', branch_name: 'Allied School Durban', is_main_branch: true, physical_address: 'Durban, KwaZulu-Natal', branch_email: 'durban@alliedschools.co.za' },
        { tenant_id: tenantMap['jeppe'].id, branch_code: 'JEP-MAIN', branch_name: 'Jeppe College Main Campus', is_main_branch: true, physical_address: 'Stanop House, 63 Sivewright Avenue, New Doornfontein, Johannesburg, 2094', phone_landline: '011-333-7846', branch_email: 'adminjhb@jeppeeducationcentre.co.za' },
        { tenant_id: tenantMap['rainbow-city'].id, branch_code: 'RCS-MAIN', branch_name: 'Rainbow City Main Campus', is_main_branch: true, physical_address: '748 Richards Drive, Halfway House, Midrand, 1685', mobile_whatsapp: '+27839925241', branch_email: 'info@rainbowschools.co.za' },
        { tenant_id: tenantMap['rainbow-city'].id, branch_code: 'RCS-REU', branch_name: 'Rainbow City Reuven', is_main_branch: false, physical_address: '17 Benray Road, Reuven, Johannesburg, 2091', branch_email: 'info@rainbowschools.co.za' },
    ]);
    const allBranches = await branchRepo.find();
    console.log(`   ✅ Created ${allBranches.length} branches`);

    // ========== 5. USERS ==========
    console.log('\n👤 Creating users...');
    const passwordHash = await bcrypt.hash('Janat@2000', 10);

    const superAdmin1 = await userRepo.save({ email: 'umarbatuusa@gmail.com', display_name: 'Umar Batuusa', password_hash: passwordHash, status: UserStatus.ACTIVE });
    const superAdmin2 = await userRepo.save({ email: 'admin@edapp.co.za', display_name: 'EdApp Admin', password_hash: passwordHash, status: UserStatus.ACTIVE });

    const lakewoodAdmin = await userRepo.save({ email: 'admin@lakewood.edu', display_name: 'Principal Skinner', first_name: 'Seymour', last_name: 'Skinner', password_hash: passwordHash, status: UserStatus.ACTIVE });
    const lakewoodTeacher = await userRepo.save({ email: 'teacher@lakewood.edu', display_name: 'Edna Krabappel', first_name: 'Edna', last_name: 'Krabappel', password_hash: passwordHash, status: UserStatus.ACTIVE });
    const lakewoodParent = await userRepo.save({ email: 'parent@lakewood.edu', display_name: 'Marge Simpson', first_name: 'Marge', last_name: 'Simpson', password_hash: passwordHash, status: UserStatus.ACTIVE });
    const lakewoodStudent = await userRepo.save({ email: 'student@lakewood.edu', student_number: 'LAK001', pin_hash: await bcrypt.hash('1234', 10), display_name: 'Bart Simpson', first_name: 'Bart', last_name: 'Simpson', status: UserStatus.ACTIVE });
    const lakewoodFinance = await userRepo.save({ email: 'finance@lakewood.edu', display_name: 'Jane Finance', first_name: 'Jane', last_name: 'Finance', password_hash: passwordHash, status: UserStatus.ACTIVE });

    const alliedParent = await userRepo.save({ email: 'ssebuguzisula@gmail.com', display_name: 'Ssebuguzi Sula', first_name: 'Ssebuguzi', last_name: 'Sula', password_hash: passwordHash, status: UserStatus.ACTIVE });
    const alliedStaff = await userRepo.save({ email: 'alliedschoolrobertsham@gmail.com', display_name: 'Allied Staff', first_name: 'Allied', last_name: 'Staff', password_hash: passwordHash, status: UserStatus.ACTIVE });
    const alliedLearner = await userRepo.save({ email: 'learner@allied.edu', student_number: 'ALL001', pin_hash: await bcrypt.hash('1234', 10), display_name: 'Test Learner', first_name: 'Test', last_name: 'Learner', status: UserStatus.ACTIVE });

    console.log('   ✅ Created users');

    // ========== 6. ROLE ASSIGNMENTS ==========
    console.log('\n🔑 Creating role assignments...');
    const lak = tenantMap['lakewood'];
    const allSdn = tenantMap['allied-sandton'];

    await roleRepo.save([
        { user_id: superAdmin1.id, role: UserRole.PLATFORM_SUPER_ADMIN, is_active: true },
        { user_id: superAdmin2.id, role: UserRole.PLATFORM_SUPER_ADMIN, is_active: true },
        { user_id: superAdmin1.id, tenant_id: lak.id, role: UserRole.MAIN_BRANCH_ADMIN, is_active: true },
        { user_id: lakewoodAdmin.id, tenant_id: lak.id, role: UserRole.TENANT_ADMIN, is_active: true },
        { user_id: lakewoodTeacher.id, tenant_id: lak.id, role: UserRole.TEACHER, is_active: true },
        { user_id: lakewoodParent.id, tenant_id: lak.id, role: UserRole.PARENT, is_active: true },
        { user_id: lakewoodStudent.id, tenant_id: lak.id, role: UserRole.LEARNER, is_active: true },
        { user_id: lakewoodFinance.id, tenant_id: lak.id, role: UserRole.STAFF, is_active: true },
        { user_id: alliedParent.id, tenant_id: allSdn.id, role: UserRole.PARENT, is_active: true },
        { user_id: alliedStaff.id, tenant_id: allSdn.id, role: UserRole.TEACHER, is_active: true },
        { user_id: superAdmin1.id, tenant_id: allSdn.id, role: UserRole.MAIN_BRANCH_ADMIN, is_active: true },
        { user_id: alliedLearner.id, tenant_id: allSdn.id, role: UserRole.LEARNER, is_active: true },
    ]);

    const parentChildRepo = AppDataSource.getRepository(ParentChildLink);
    await parentChildRepo.save({ tenant_id: lak.id, parent_user_id: lakewoodParent.id, child_user_id: lakewoodStudent.id });
    await parentChildRepo.save({ tenant_id: allSdn.id, parent_user_id: alliedParent.id, child_user_id: alliedLearner.id });
    console.log('   ✅ Created role assignments + parent-child links');

    // ========== 7. DEMO THREADS ==========
    console.log('\n💬 Creating demo threads...');
    const threadRepo = AppDataSource.getRepository(Thread);
    const memberRepo = AppDataSource.getRepository(ThreadMember);
    const messageRepo = AppDataSource.getRepository(Message);
    const now = new Date();

    const dmTeacher = await threadRepo.save({ tenant_id: lak.id, type: ThreadType.DM, title: 'Edna Krabappel', created_by: lakewoodParent.id, last_message_content: "I'll send his progress report by Friday.", last_message_at: now });
    await memberRepo.save([
        { thread_id: dmTeacher.id, user_id: lakewoodParent.id, role: MemberRole.MEMBER, permission: MemberPermission.WRITE },
        { thread_id: dmTeacher.id, user_id: lakewoodTeacher.id, role: MemberRole.MEMBER, permission: MemberPermission.WRITE },
    ]);
    await messageRepo.save([
        { thread_id: dmTeacher.id, sender_id: lakewoodParent.id, type: MessageType.TEXT, content: "Hi Mrs. Krabappel, how is Bart doing this term?", created_at: new Date(now.getTime() - 7200000) },
        { thread_id: dmTeacher.id, sender_id: lakewoodTeacher.id, type: MessageType.TEXT, content: "Bart has been improving a lot lately!", created_at: new Date(now.getTime() - 3600000) },
        { thread_id: dmTeacher.id, sender_id: lakewoodTeacher.id, type: MessageType.TEXT, content: "I'll send his progress report by Friday.", created_at: new Date(now.getTime() - 1800000) },
    ]);
    console.log('   ✅ Created demo threads');

    // ========== 8. DICTIONARIES ==========
    console.log('\n📚 Seeding dictionaries...');

    const phaseRepo = AppDataSource.getRepository(DictPhase);
    await phaseRepo.save([
        { code: 'ECD', label: 'Early Childhood Development', sort_order: 0 },
        { code: 'FOUNDATION', label: 'Foundation Phase (Gr R–3)', sort_order: 1 },
        { code: 'INTERMEDIATE', label: 'Intermediate Phase (Gr 4–6)', sort_order: 2 },
        { code: 'SENIOR', label: 'Senior Phase (Gr 7–9)', sort_order: 3 },
        { code: 'FET', label: 'Further Education & Training (Gr 10–12)', sort_order: 4 },
        { code: 'TVET', label: 'Technical Vocational Education & Training', sort_order: 5 },
    ]);

    const gradeRepo = AppDataSource.getRepository(DictGrade);
    await gradeRepo.save([
        { code: 'PRE_R', label: 'Pre-Grade R', phase_code: 'ECD', sort_order: 0 },
        { code: 'GR_R', label: 'Grade R', phase_code: 'FOUNDATION', sort_order: 1 },
        { code: 'GR_1', label: 'Grade 1', phase_code: 'FOUNDATION', sort_order: 2 },
        { code: 'GR_2', label: 'Grade 2', phase_code: 'FOUNDATION', sort_order: 3 },
        { code: 'GR_3', label: 'Grade 3', phase_code: 'FOUNDATION', sort_order: 4 },
        { code: 'GR_4', label: 'Grade 4', phase_code: 'INTERMEDIATE', sort_order: 5 },
        { code: 'GR_5', label: 'Grade 5', phase_code: 'INTERMEDIATE', sort_order: 6 },
        { code: 'GR_6', label: 'Grade 6', phase_code: 'INTERMEDIATE', sort_order: 7 },
        { code: 'GR_7', label: 'Grade 7', phase_code: 'SENIOR', sort_order: 8 },
        { code: 'GR_8', label: 'Grade 8', phase_code: 'SENIOR', sort_order: 9 },
        { code: 'GR_9', label: 'Grade 9', phase_code: 'SENIOR', sort_order: 10 },
        { code: 'GR_10', label: 'Grade 10', phase_code: 'FET', sort_order: 11 },
        { code: 'GR_11', label: 'Grade 11', phase_code: 'FET', sort_order: 12 },
        { code: 'GR_12', label: 'Grade 12', phase_code: 'FET', sort_order: 13 },
        { code: 'N1', label: 'N1', phase_code: 'TVET', sort_order: 14 },
        { code: 'N2', label: 'N2', phase_code: 'TVET', sort_order: 15 },
        { code: 'N3', label: 'N3', phase_code: 'TVET', sort_order: 16 },
    ]);

    const genderRepo = AppDataSource.getRepository(DictClassGender);
    await genderRepo.save([
        { code: 'MIXED', label: 'Mixed', sort_order: 0 },
        { code: 'BOYS_ONLY', label: 'Boys Only', sort_order: 1 },
        { code: 'GIRLS_ONLY', label: 'Girls Only', sort_order: 2 },
    ]);

    const subCatRepo = AppDataSource.getRepository(DictSubjectCategory);
    await subCatRepo.save([
        { code: 'LANGUAGES', label: 'Languages', sort_order: 0 },
        { code: 'MATHEMATICS', label: 'Mathematics', sort_order: 1 },
        { code: 'SCIENCES', label: 'Natural Sciences', sort_order: 2 },
        { code: 'HUMANITIES', label: 'Humanities & Social Sciences', sort_order: 3 },
        { code: 'ARTS', label: 'Arts & Culture', sort_order: 4 },
        { code: 'TECHNOLOGY', label: 'Technology & Computing', sort_order: 5 },
        { code: 'BUSINESS', label: 'Business & Economics', sort_order: 6 },
        { code: 'LIFE_SKILLS', label: 'Life Skills & Orientation', sort_order: 7 },
    ]);

    const subTypeRepo = AppDataSource.getRepository(DictSubjectType);
    await subTypeRepo.save([
        { code: 'HL', label: 'Home Language', sort_order: 0 },
        { code: 'FAL', label: 'First Additional Language', sort_order: 1 },
        { code: 'SAL', label: 'Second Additional Language', sort_order: 2 },
        { code: 'CORE', label: 'Core Subject', sort_order: 3 },
        { code: 'OPTIONAL', label: 'Optional Subject', sort_order: 4 },
        { code: 'ELECTIVE', label: 'Elective', sort_order: 5 },
    ]);

    const langLevelRepo = AppDataSource.getRepository(DictLanguageLevel);
    await langLevelRepo.save([
        { code: 'HL', label: 'Home Language', sort_order: 0 },
        { code: 'FAL', label: 'First Additional Language', sort_order: 1 },
        { code: 'SAL', label: 'Second Additional Language', sort_order: 2 },
    ]);

    const langs = [
        { code: 'AFR', label: 'Afrikaans', sort_order: 0 },
        { code: 'ENG', label: 'English', sort_order: 1 },
        { code: 'ZUL', label: 'isiZulu', sort_order: 2 },
        { code: 'XHO', label: 'isiXhosa', sort_order: 3 },
        { code: 'SOT', label: 'Sesotho', sort_order: 4 },
        { code: 'TSW', label: 'Setswana', sort_order: 5 },
        { code: 'PED', label: 'Sepedi', sort_order: 6 },
        { code: 'VEN', label: 'Tshivenda', sort_order: 7 },
        { code: 'TSO', label: 'Xitsonga', sort_order: 8 },
        { code: 'NBL', label: 'isiNdebele', sort_order: 9 },
        { code: 'SSW', label: 'siSwati', sort_order: 10 },
    ];
    const hlRepo = AppDataSource.getRepository(DictLanguageHL);
    const falRepo = AppDataSource.getRepository(DictLanguageFAL);
    await hlRepo.save(langs);
    await falRepo.save(langs.map(l => ({ ...l, id: undefined })));

    const salRepo = AppDataSource.getRepository(DictSalutation);
    await salRepo.save([
        { code: 'MR', label: 'Mr', sort_order: 0 },
        { code: 'MRS', label: 'Mrs', sort_order: 1 },
        { code: 'MISS', label: 'Miss', sort_order: 2 },
        { code: 'MS', label: 'Ms', sort_order: 3 },
        { code: 'DR', label: 'Dr', sort_order: 4 },
        { code: 'PROF', label: 'Prof', sort_order: 5 },
        { code: 'REV', label: 'Rev', sort_order: 6 },
        { code: 'ADV', label: 'Adv', sort_order: 7 },
        { code: 'SGT', label: 'Sgt', sort_order: 8 },
    ]);

    const religionRepo = AppDataSource.getRepository(DictReligion);
    await religionRepo.save([
        { code: 'CHRISTIANITY', label: 'Christianity', sort_order: 0 },
        { code: 'ISLAM', label: 'Islam', sort_order: 1 },
        { code: 'JUDAISM', label: 'Judaism', sort_order: 2 },
        { code: 'HINDUISM', label: 'Hinduism', sort_order: 3 },
        { code: 'BUDDHISM', label: 'Buddhism', sort_order: 4 },
        { code: 'TRADITIONAL', label: 'Traditional African', sort_order: 5 },
        { code: 'AGNOSTIC', label: 'Agnostic', sort_order: 6 },
        { code: 'OTHER', label: 'Other', sort_order: 7 },
        { code: 'NONE', label: 'Prefer Not to Say', sort_order: 8 },
    ]);

    // --- New dictionaries ---
    await AppDataSource.getRepository(DictTeachingLeadershipStaff).save([
        { code: 'PRINCIPAL', label: 'Principal', sort_order: 0 },
        { code: 'DEPUTY_PRINCIPAL', label: 'Deputy Principal', sort_order: 1 },
        { code: 'HOD', label: 'Head of Department', sort_order: 2 },
        { code: 'SENIOR_TEACHER', label: 'Senior Teacher', sort_order: 3 },
        { code: 'TEACHER', label: 'Teacher', sort_order: 4 },
        { code: 'SUBJECT_HEAD', label: 'Subject Head', sort_order: 5 },
        { code: 'GRADE_HEAD', label: 'Grade Head', sort_order: 6 },
        { code: 'PHASE_HEAD', label: 'Phase Head', sort_order: 7 },
    ]);

    await AppDataSource.getRepository(DictNonTeachingSupportStaff).save([
        { code: 'ADMIN_CLERK', label: 'Administrative Clerk', sort_order: 0 },
        { code: 'SECRETARY', label: 'Secretary', sort_order: 1 },
        { code: 'RECEPTIONIST', label: 'Receptionist', sort_order: 2 },
        { code: 'FINANCE_OFFICER', label: 'Finance Officer', sort_order: 3 },
        { code: 'IT_TECHNICIAN', label: 'IT Technician', sort_order: 4 },
        { code: 'LIBRARIAN', label: 'Librarian', sort_order: 5 },
        { code: 'LAB_ASSISTANT', label: 'Lab Assistant', sort_order: 6 },
        { code: 'CARETAKER', label: 'Caretaker', sort_order: 7 },
        { code: 'GROUNDSMAN', label: 'Groundsman', sort_order: 8 },
        { code: 'SECURITY_GUARD', label: 'Security Guard', sort_order: 9 },
        { code: 'CLEANER', label: 'Cleaner', sort_order: 10 },
        { code: 'KITCHEN_STAFF', label: 'Kitchen Staff', sort_order: 11 },
        { code: 'BUS_DRIVER', label: 'Bus Driver', sort_order: 12 },
    ]);

    await AppDataSource.getRepository(DictOptionalAdminRole).save([
        { code: 'SGB_CHAIRPERSON', label: 'SGB Chairperson', sort_order: 0 },
        { code: 'SGB_MEMBER', label: 'SGB Member', sort_order: 1 },
        { code: 'EXAM_OFFICER', label: 'Exam Officer', sort_order: 2 },
        { code: 'SPORTS_COORDINATOR', label: 'Sports Coordinator', sort_order: 3 },
        { code: 'DISCIPLINARY_HEAD', label: 'Disciplinary Head', sort_order: 4 },
        { code: 'COUNSELLOR', label: 'School Counsellor', sort_order: 5 },
        { code: 'MARKETING_OFFICER', label: 'Marketing Officer', sort_order: 6 },
    ]);

    await AppDataSource.getRepository(DictCurriculumAuthority).save([
        { code: 'DBE', label: 'Department of Basic Education (DBE)', sort_order: 0 },
        { code: 'IEB', label: 'Independent Examinations Board (IEB)', sort_order: 1 },
        { code: 'UMALUSI', label: 'Umalusi', sort_order: 2 },
        { code: 'CAMBRIDGE', label: 'Cambridge International', sort_order: 3 },
        { code: 'SACAI', label: 'SACAI', sort_order: 4 },
    ]);

    await AppDataSource.getRepository(DictCertificationType).save([
        { code: 'PGCE', label: 'PGCE', sort_order: 0 },
        { code: 'BED', label: 'B.Ed', sort_order: 1 },
        { code: 'HDE', label: 'HDE', sort_order: 2 },
        { code: 'NPDE', label: 'NPDE', sort_order: 3 },
        { code: 'ACE', label: 'ACE', sort_order: 4 },
        { code: 'MED', label: 'M.Ed', sort_order: 5 },
        { code: 'PHD', label: 'PhD (Education)', sort_order: 6 },
        { code: 'SACE', label: 'SACE Registration', sort_order: 7 },
    ]);

    await AppDataSource.getRepository(DictAcademicDocument).save([
        { code: 'MATRIC_CERT', label: 'Matric Certificate', sort_order: 0 },
        { code: 'DEGREE_CERT', label: 'Degree Certificate', sort_order: 1 },
        { code: 'DIPLOMA_CERT', label: 'Diploma Certificate', sort_order: 2 },
        { code: 'SACE_CERT', label: 'SACE Certificate', sort_order: 3 },
        { code: 'POLICE_CLEARANCE', label: 'Police Clearance', sort_order: 4 },
        { code: 'ID_COPY', label: 'ID Copy', sort_order: 5 },
        { code: 'CV', label: 'Curriculum Vitae', sort_order: 6 },
        { code: 'ACADEMIC_TRANSCRIPT', label: 'Academic Transcript', sort_order: 7 },
    ]);

    await AppDataSource.getRepository(DictReqvLevel).save([
        { code: 'REQV_10', label: 'REQV 10 (Grade 9 + 0 years)', sort_order: 0 },
        { code: 'REQV_11', label: 'REQV 11 (Matric / NQF 4)', sort_order: 1 },
        { code: 'REQV_12', label: 'REQV 12 (Matric + Certificate)', sort_order: 2 },
        { code: 'REQV_13', label: 'REQV 13 (3-year Diploma)', sort_order: 3 },
        { code: 'REQV_14', label: 'REQV 14 (B.Ed / 4-year degree)', sort_order: 4 },
        { code: 'REQV_15', label: 'REQV 15 (Honours / PGCE)', sort_order: 5 },
        { code: 'REQV_16', label: 'REQV 16 (Master\'s degree)', sort_order: 6 },
        { code: 'REQV_17', label: 'REQV 17 (Doctoral degree)', sort_order: 7 },
    ]);

    await AppDataSource.getRepository(DictCitizenshipType).save([
        { code: 'SA_CITIZEN', label: 'South African Citizen', sort_order: 0 },
        { code: 'PERMANENT_RESIDENT', label: 'Permanent Resident', sort_order: 1 },
        { code: 'WORK_PERMIT', label: 'Work Permit Holder', sort_order: 2 },
        { code: 'STUDY_PERMIT', label: 'Study Permit Holder', sort_order: 3 },
        { code: 'REFUGEE', label: 'Refugee', sort_order: 4 },
        { code: 'ASYLUM_SEEKER', label: 'Asylum Seeker', sort_order: 5 },
        { code: 'FOREIGN_NATIONAL', label: 'Foreign National', sort_order: 6 },
    ]);

    await AppDataSource.getRepository(DictMedicalAidProvider).save([
        { code: 'DISCOVERY', label: 'Discovery Health', sort_order: 0 },
        { code: 'BONITAS', label: 'Bonitas', sort_order: 1 },
        { code: 'GEMS', label: 'GEMS', sort_order: 2 },
        { code: 'MEDIHELP', label: 'Medihelp', sort_order: 3 },
        { code: 'MOMENTUM', label: 'Momentum Health', sort_order: 4 },
        { code: 'BESTMED', label: 'Bestmed', sort_order: 5 },
        { code: 'FEDHEALTH', label: 'Fedhealth', sort_order: 6 },
        { code: 'POLMED', label: 'Polmed', sort_order: 7 },
        { code: 'PROFMED', label: 'Profmed', sort_order: 8 },
        { code: 'SIZWE', label: 'Sizwe Medical Fund', sort_order: 9 },
        { code: 'OTHER', label: 'Other', sort_order: 10 },
        { code: 'NONE', label: 'None', sort_order: 11 },
    ]);

    await AppDataSource.getRepository(DictEmergencyRelationship).save([
        { code: 'MOTHER', label: 'Mother', sort_order: 0 },
        { code: 'FATHER', label: 'Father', sort_order: 1 },
        { code: 'GUARDIAN', label: 'Guardian', sort_order: 2 },
        { code: 'GRANDPARENT', label: 'Grandparent', sort_order: 3 },
        { code: 'SIBLING', label: 'Sibling', sort_order: 4 },
        { code: 'AUNT_UNCLE', label: 'Aunt / Uncle', sort_order: 5 },
        { code: 'SPOUSE', label: 'Spouse', sort_order: 6 },
        { code: 'OTHER', label: 'Other', sort_order: 7 },
    ]);

    await AppDataSource.getRepository(DictMaritalStatus).save([
        { code: 'SINGLE', label: 'Single', sort_order: 0 },
        { code: 'MARRIED', label: 'Married', sort_order: 1 },
        { code: 'DIVORCED', label: 'Divorced', sort_order: 2 },
        { code: 'WIDOWED', label: 'Widowed', sort_order: 3 },
        { code: 'SEPARATED', label: 'Separated', sort_order: 4 },
        { code: 'CIVIL_UNION', label: 'Civil Union', sort_order: 5 },
    ]);

    await AppDataSource.getRepository(DictCertSubjectProvider).save([
        { code: 'DBE', label: 'Department of Basic Education', sort_order: 0 },
        { code: 'IEB', label: 'Independent Examinations Board', sort_order: 1 },
        { code: 'CAMBRIDGE', label: 'Cambridge International', sort_order: 2 },
        { code: 'SACAI', label: 'SACAI', sort_order: 3 },
        { code: 'UMALUSI', label: 'Umalusi', sort_order: 4 },
    ]);

    await AppDataSource.getRepository(DictTeachingLevel).save([
        { code: 'ECD', label: 'Early Childhood Development', sort_order: 0 },
        { code: 'PRIMARY', label: 'Primary School', sort_order: 1 },
        { code: 'SECONDARY', label: 'Secondary School', sort_order: 2 },
        { code: 'FET', label: 'FET (Gr 10-12)', sort_order: 3 },
        { code: 'SPECIAL_NEEDS', label: 'Special Needs', sort_order: 4 },
    ]);

    await AppDataSource.getRepository(DictAcademicYearStructure).save([
        { code: 'TERM_4', label: '4 Terms', sort_order: 0 },
        { code: 'SEMESTER_2', label: '2 Semesters', sort_order: 1 },
        { code: 'TRIMESTER_3', label: '3 Trimesters', sort_order: 2 },
        { code: 'QUARTER_4', label: '4 Quarters', sort_order: 3 },
    ]);

    await AppDataSource.getRepository(DictQualificationPathway).save([
        { code: 'NSC', label: 'National Senior Certificate (NSC)', sort_order: 0 },
        { code: 'IEB_NSC', label: 'IEB National Senior Certificate', sort_order: 1 },
        { code: 'SC', label: 'Senior Certificate (amended)', sort_order: 2 },
        { code: 'IGCSE', label: 'IGCSE', sort_order: 3 },
        { code: 'AS_LEVEL', label: 'AS Level', sort_order: 4 },
        { code: 'A_LEVEL', label: 'A Level', sort_order: 5 },
        { code: 'NC_V', label: 'NC(V) — TVET', sort_order: 6 },
    ]);

    await AppDataSource.getRepository(DictExamBody).save([
        { code: 'DBE', label: 'Department of Basic Education', sort_order: 0 },
        { code: 'IEB', label: 'Independent Examinations Board', sort_order: 1 },
        { code: 'CAMBRIDGE', label: 'Cambridge Assessment International', sort_order: 2 },
        { code: 'SACAI', label: 'SACAI', sort_order: 3 },
    ]);

    await AppDataSource.getRepository(DictCurriculumName).save([
        { code: 'CAPS', label: 'CAPS (Curriculum & Assessment Policy Statements)', sort_order: 0 },
        { code: 'IEB_CAPS', label: 'IEB-adapted CAPS', sort_order: 1 },
        { code: 'CAMBRIDGE_IGCSE', label: 'Cambridge IGCSE', sort_order: 2 },
        { code: 'CAMBRIDGE_A_LEVEL', label: 'Cambridge A-Level', sort_order: 3 },
        { code: 'NCV', label: 'National Certificate Vocational', sort_order: 4 },
    ]);

    await AppDataSource.getRepository(DictMedicalDisability).save([
        { code: 'PHYSICAL', label: 'Physical Disability', sort_order: 0 },
        { code: 'VISUAL', label: 'Visual Impairment', sort_order: 1 },
        { code: 'HEARING', label: 'Hearing Impairment', sort_order: 2 },
        { code: 'SPEECH', label: 'Speech Impairment', sort_order: 3 },
        { code: 'CHRONIC_ILLNESS', label: 'Chronic Illness', sort_order: 4 },
        { code: 'EPILEPSY', label: 'Epilepsy', sort_order: 5 },
        { code: 'CEREBRAL_PALSY', label: 'Cerebral Palsy', sort_order: 6 },
        { code: 'OTHER', label: 'Other', sort_order: 7 },
        { code: 'NONE', label: 'None', sort_order: 8 },
    ]);

    await AppDataSource.getRepository(DictSchoolAllergy).save([
        { code: 'PEANUTS', label: 'Peanuts / Tree Nuts', sort_order: 0 },
        { code: 'DAIRY', label: 'Dairy / Lactose', sort_order: 1 },
        { code: 'EGGS', label: 'Eggs', sort_order: 2 },
        { code: 'GLUTEN', label: 'Gluten / Wheat', sort_order: 3 },
        { code: 'SHELLFISH', label: 'Shellfish / Seafood', sort_order: 4 },
        { code: 'SOY', label: 'Soy', sort_order: 5 },
        { code: 'BEE_STINGS', label: 'Bee Stings', sort_order: 6 },
        { code: 'PENICILLIN', label: 'Penicillin', sort_order: 7 },
        { code: 'LATEX', label: 'Latex', sort_order: 8 },
        { code: 'POLLEN', label: 'Pollen / Hay Fever', sort_order: 9 },
        { code: 'OTHER', label: 'Other', sort_order: 10 },
    ]);

    await AppDataSource.getRepository(DictPsychologicalIssue).save([
        { code: 'ANXIETY', label: 'Anxiety Disorder', sort_order: 0 },
        { code: 'DEPRESSION', label: 'Depression', sort_order: 1 },
        { code: 'PTSD', label: 'Post-Traumatic Stress', sort_order: 2 },
        { code: 'ODD', label: 'Oppositional Defiant Disorder', sort_order: 3 },
        { code: 'ATTACHMENT', label: 'Attachment Disorder', sort_order: 4 },
        { code: 'SELECTIVE_MUTISM', label: 'Selective Mutism', sort_order: 5 },
        { code: 'SELF_HARM', label: 'Self-Harm Behaviour', sort_order: 6 },
        { code: 'EATING_DISORDER', label: 'Eating Disorder', sort_order: 7 },
        { code: 'OTHER', label: 'Other', sort_order: 8 },
    ]);

    await AppDataSource.getRepository(DictEducationalDisability).save([
        { code: 'DYSLEXIA', label: 'Dyslexia', sort_order: 0 },
        { code: 'DYSCALCULIA', label: 'Dyscalculia', sort_order: 1 },
        { code: 'DYSGRAPHIA', label: 'Dysgraphia', sort_order: 2 },
        { code: 'ADHD', label: 'ADHD', sort_order: 3 },
        { code: 'ADD', label: 'ADD', sort_order: 4 },
        { code: 'ASD', label: 'Autism Spectrum Disorder', sort_order: 5 },
        { code: 'INTELLECTUAL', label: 'Intellectual Disability', sort_order: 6 },
        { code: 'SLD', label: 'Specific Learning Disability', sort_order: 7 },
        { code: 'OTHER', label: 'Other', sort_order: 8 },
    ]);

    await AppDataSource.getRepository(DictSupportProfile).save([
        { code: 'LOW', label: 'Low Support Needs', sort_order: 0 },
        { code: 'MODERATE', label: 'Moderate Support Needs', sort_order: 1 },
        { code: 'HIGH', label: 'High Support Needs', sort_order: 2 },
        { code: 'VERY_HIGH', label: 'Very High Support Needs', sort_order: 3 },
        { code: 'FULL_SERVICE', label: 'Full-Service School', sort_order: 4 },
        { code: 'SPECIAL_SCHOOL', label: 'Special School Placement', sort_order: 5 },
    ]);

    await AppDataSource.getRepository(DictTherapyType).save([
        { code: 'OCCUPATIONAL', label: 'Occupational Therapy', sort_order: 0 },
        { code: 'SPEECH', label: 'Speech Therapy', sort_order: 1 },
        { code: 'PHYSIOTHERAPY', label: 'Physiotherapy', sort_order: 2 },
        { code: 'PLAY_THERAPY', label: 'Play Therapy', sort_order: 3 },
        { code: 'ART_THERAPY', label: 'Art Therapy', sort_order: 4 },
        { code: 'BEHAVIOURAL', label: 'Behavioural Therapy', sort_order: 5 },
        { code: 'COUNSELLING', label: 'Counselling', sort_order: 6 },
        { code: 'REMEDIAL', label: 'Remedial Teaching', sort_order: 7 },
    ]);

    await AppDataSource.getRepository(DictBloodType).save([
        { code: 'A_POS', label: 'A+', sort_order: 0 },
        { code: 'A_NEG', label: 'A-', sort_order: 1 },
        { code: 'B_POS', label: 'B+', sort_order: 2 },
        { code: 'B_NEG', label: 'B-', sort_order: 3 },
        { code: 'AB_POS', label: 'AB+', sort_order: 4 },
        { code: 'AB_NEG', label: 'AB-', sort_order: 5 },
        { code: 'O_POS', label: 'O+', sort_order: 6 },
        { code: 'O_NEG', label: 'O-', sort_order: 7 },
        { code: 'UNKNOWN', label: 'Unknown', sort_order: 8 },
    ]);

    await AppDataSource.getRepository(DictMonth).save([
        { code: 'JAN', label: 'January', sort_order: 0 },
        { code: 'FEB', label: 'February', sort_order: 1 },
        { code: 'MAR', label: 'March', sort_order: 2 },
        { code: 'APR', label: 'April', sort_order: 3 },
        { code: 'MAY', label: 'May', sort_order: 4 },
        { code: 'JUN', label: 'June', sort_order: 5 },
        { code: 'JUL', label: 'July', sort_order: 6 },
        { code: 'AUG', label: 'August', sort_order: 7 },
        { code: 'SEP', label: 'September', sort_order: 8 },
        { code: 'OCT', label: 'October', sort_order: 9 },
        { code: 'NOV', label: 'November', sort_order: 10 },
        { code: 'DEC', label: 'December', sort_order: 11 },
    ]);

    await AppDataSource.getRepository(DictProgrammeType).save([
        { code: 'ACADEMIC', label: 'Academic', sort_order: 0 },
        { code: 'VOCATIONAL', label: 'Vocational', sort_order: 1 },
        { code: 'TECHNICAL', label: 'Technical', sort_order: 2 },
        { code: 'SPECIAL_NEEDS', label: 'Special Needs', sort_order: 3 },
        { code: 'ECD', label: 'Early Childhood Development', sort_order: 4 },
    ]);

    await AppDataSource.getRepository(DictSubjectLanguageLevel).save([
        { code: 'HL', label: 'Home Language', sort_order: 0 },
        { code: 'FAL', label: 'First Additional Language', sort_order: 1 },
        { code: 'SAL', label: 'Second Additional Language', sort_order: 2 },
        { code: 'LOLT', label: 'Language of Learning & Teaching', sort_order: 3 },
    ]);

    await AppDataSource.getRepository(DictAssessmentModel).save([
        { code: 'CONTINUOUS', label: 'Continuous Assessment (CASS)', sort_order: 0 },
        { code: 'EXAM_BASED', label: 'Examination-Based', sort_order: 1 },
        { code: 'SBA', label: 'School-Based Assessment', sort_order: 2 },
        { code: 'PAT', label: 'Practical Assessment Task', sort_order: 3 },
        { code: 'ORAL', label: 'Oral Assessment', sort_order: 4 },
        { code: 'PORTFOLIO', label: 'Portfolio-Based', sort_order: 5 },
    ]);

    await AppDataSource.getRepository(DictSubjectGroup).save([
        { code: 'GROUP_A', label: 'Group A — Languages', sort_order: 0 },
        { code: 'GROUP_B', label: 'Group B — Sciences', sort_order: 1 },
        { code: 'GROUP_C', label: 'Group C — Commerce', sort_order: 2 },
        { code: 'GROUP_D', label: 'Group D — Humanities', sort_order: 3 },
        { code: 'ELECTIVE', label: 'Electives', sort_order: 4 },
    ]);

    await AppDataSource.getRepository(DictHomeLanguage).save([
        { code: 'AFR', label: 'Afrikaans', sort_order: 0 },
        { code: 'ENG', label: 'English', sort_order: 1 },
        { code: 'ZUL', label: 'isiZulu', sort_order: 2 },
        { code: 'XHO', label: 'isiXhosa', sort_order: 3 },
        { code: 'SOT', label: 'Sesotho', sort_order: 4 },
        { code: 'TSW', label: 'Setswana', sort_order: 5 },
        { code: 'PED', label: 'Sepedi', sort_order: 6 },
        { code: 'VEN', label: 'Tshivenda', sort_order: 7 },
        { code: 'TSO', label: 'Xitsonga', sort_order: 8 },
        { code: 'NBL', label: 'isiNdebele', sort_order: 9 },
        { code: 'SSW', label: 'siSwati', sort_order: 10 },
        { code: 'FRENCH', label: 'French', sort_order: 11 },
        { code: 'PORTUGUESE', label: 'Portuguese', sort_order: 12 },
        { code: 'ARABIC', label: 'Arabic', sort_order: 13 },
        { code: 'URDU', label: 'Urdu', sort_order: 14 },
        { code: 'OTHER', label: 'Other', sort_order: 15 },
    ]);

    await AppDataSource.getRepository(DictParentRight).save([
        { code: 'FULL_CUSTODY', label: 'Full Custody', sort_order: 0 },
        { code: 'JOINT_CUSTODY', label: 'Joint Custody', sort_order: 1 },
        { code: 'VISITATION', label: 'Visitation Rights Only', sort_order: 2 },
        { code: 'LEGAL_GUARDIAN', label: 'Legal Guardian', sort_order: 3 },
        { code: 'NO_ACCESS', label: 'No Access / Restricted', sort_order: 4 },
        { code: 'FOSTER_PARENT', label: 'Foster Parent', sort_order: 5 },
    ]);

    await AppDataSource.getRepository(DictCompulsorySubject).save([
        { code: 'HOME_LANG', label: 'Home Language', sort_order: 0 },
        { code: 'FAL', label: 'First Additional Language', sort_order: 1 },
        { code: 'MATHEMATICS', label: 'Mathematics / Math Literacy', sort_order: 2 },
        { code: 'LIFE_ORI', label: 'Life Orientation', sort_order: 3 },
    ]);

    await AppDataSource.getRepository(DictSubject).save([
        { code: 'ENG_HL', label: 'English Home Language', sort_order: 0 },
        { code: 'AFR_HL', label: 'Afrikaans Home Language', sort_order: 1 },
        { code: 'ZUL_HL', label: 'isiZulu Home Language', sort_order: 2 },
        { code: 'ENG_FAL', label: 'English First Additional Language', sort_order: 3 },
        { code: 'AFR_FAL', label: 'Afrikaans First Additional Language', sort_order: 4 },
        { code: 'MATH', label: 'Mathematics', sort_order: 5 },
        { code: 'MATH_LIT', label: 'Mathematical Literacy', sort_order: 6 },
        { code: 'PHY_SCI', label: 'Physical Sciences', sort_order: 7 },
        { code: 'LIFE_SCI', label: 'Life Sciences', sort_order: 8 },
        { code: 'ACCOUNTING', label: 'Accounting', sort_order: 9 },
        { code: 'BUS_STUDIES', label: 'Business Studies', sort_order: 10 },
        { code: 'ECONOMICS', label: 'Economics', sort_order: 11 },
        { code: 'GEOGRAPHY', label: 'Geography', sort_order: 12 },
        { code: 'HISTORY', label: 'History', sort_order: 13 },
        { code: 'LIFE_ORI', label: 'Life Orientation', sort_order: 14 },
        { code: 'CAT', label: 'Computer Applications Technology', sort_order: 15 },
        { code: 'IT', label: 'Information Technology', sort_order: 16 },
        { code: 'DRAMA', label: 'Dramatic Arts', sort_order: 17 },
    ]);

    console.log('   ✅ Seeded all dictionaries (43 types)');

    // ========== 9. PLATFORM SUBJECTS (16) ==========
    console.log('\n📖 Seeding platform subjects...');

    const subjectRepo = AppDataSource.getRepository(Subject);
    await subjectRepo.save([
        { subject_code: 'ENG_HL', subject_name: 'English Home Language', category_code: 'LANGUAGES', type_code: 'HL', is_platform_subject: true },
        { subject_code: 'AFR_HL', subject_name: 'Afrikaans Home Language', category_code: 'LANGUAGES', type_code: 'HL', is_platform_subject: true },
        { subject_code: 'ZUL_HL', subject_name: 'isiZulu Home Language', category_code: 'LANGUAGES', type_code: 'HL', is_platform_subject: true },
        { subject_code: 'ENG_FAL', subject_name: 'English First Additional Language', category_code: 'LANGUAGES', type_code: 'FAL', is_platform_subject: true },
        { subject_code: 'AFR_FAL', subject_name: 'Afrikaans First Additional Language', category_code: 'LANGUAGES', type_code: 'FAL', is_platform_subject: true },
        { subject_code: 'MATH', subject_name: 'Mathematics', category_code: 'MATHEMATICS', type_code: 'CORE', is_platform_subject: true },
        { subject_code: 'MATH_LIT', subject_name: 'Mathematical Literacy', category_code: 'MATHEMATICS', type_code: 'CORE', is_platform_subject: true },
        { subject_code: 'PHY_SCI', subject_name: 'Physical Sciences', category_code: 'SCIENCES', type_code: 'CORE', is_platform_subject: true },
        { subject_code: 'LIFE_SCI', subject_name: 'Life Sciences', category_code: 'SCIENCES', type_code: 'CORE', is_platform_subject: true },
        { subject_code: 'HISTORY', subject_name: 'History', category_code: 'HUMANITIES', type_code: 'CORE', is_platform_subject: true },
        { subject_code: 'GEOGRAPHY', subject_name: 'Geography', category_code: 'HUMANITIES', type_code: 'CORE', is_platform_subject: true },
        { subject_code: 'ACCOUNTING', subject_name: 'Accounting', category_code: 'BUSINESS', type_code: 'CORE', is_platform_subject: true },
        { subject_code: 'BUS_STUDIES', subject_name: 'Business Studies', category_code: 'BUSINESS', type_code: 'CORE', is_platform_subject: true },
        { subject_code: 'ECONOMICS', subject_name: 'Economics', category_code: 'BUSINESS', type_code: 'CORE', is_platform_subject: true },
        { subject_code: 'LIFE_ORI', subject_name: 'Life Orientation', category_code: 'LIFE_SKILLS', type_code: 'CORE', is_platform_subject: true },
        { subject_code: 'CAT', subject_name: 'Computer Applications Technology', category_code: 'TECHNOLOGY', type_code: 'CORE', is_platform_subject: true },
        { subject_code: 'IT', subject_name: 'Information Technology', category_code: 'TECHNOLOGY', type_code: 'CORE', is_platform_subject: true },
        { subject_code: 'DRAMA', subject_name: 'Dramatic Arts', category_code: 'ARTS', type_code: 'CORE', is_platform_subject: true },
    ]);
    console.log('   ✅ Seeded 18 platform subjects');

    // ========== 10. PLATFORM SUBJECT STREAMS ==========
    await streamRepo.save([
        { tenant_id: null, stream_code: 'SCIENCE', stream_name: 'Physical Science Stream', description: 'Physics, Chemistry, Biology focus' },
        { tenant_id: null, stream_code: 'COMMERCE', stream_name: 'Commerce Stream', description: 'Accounting, Business Studies, Economics' },
        { tenant_id: null, stream_code: 'ARTS', stream_name: 'Arts & Culture Stream', description: 'Drama, Music, Visual Arts' },
        { tenant_id: null, stream_code: 'GENERAL', stream_name: 'General Stream', description: 'General academic subjects' },
    ]);
    console.log('   ✅ Seeded 4 platform streams');

    // ========== 11. DEFAULT TENANT FEATURES ==========
    console.log('\n⚙️  Seeding default tenant features...');

    for (const tenant of tenants) {
        for (const f of DEFAULT_FEATURES) {
            await featureRepo.save(featureRepo.create({ tenant_id: tenant.id, ...f } as any));
        }
    }
    console.log(`   ✅ Seeded features for ${tenants.length} tenants`);

    // ========== 12. LAKEWOOD ADMISSIONS PROCESS ==========
    console.log('\n📋 Seeding Lakewood admissions process...');

    await admissionsRepo.save([
        { tenant_id: lak.id, title: 'Welcome to Lakewood Admissions', description: 'We are excited that you are considering Lakewood Primary School for your child. Please complete all steps below to submit your application.', card_type: AdmissionsCardType.INFO, sort_order: 0, config: {} },
        { tenant_id: lak.id, title: 'Valid South African ID / Birth Certificate', description: 'Certified copy of the child\'s birth certificate or South African ID document is required.', card_type: AdmissionsCardType.REQUIREMENT, sort_order: 1, config: { document_type: 'birth_certificate' } },
        { tenant_id: lak.id, title: 'Previous School Report (Last 2 Years)', description: 'Official school report cards for the last two academic years must be submitted.', card_type: AdmissionsCardType.REQUIREMENT, sort_order: 2, config: { document_type: 'school_report' } },
        { tenant_id: lak.id, title: 'Complete Online Application Form', description: 'Fill in the full application form with parent/guardian and learner details.', card_type: AdmissionsCardType.STEP, sort_order: 3, config: {} },
        { tenant_id: lak.id, title: 'Application Fee Payment (R500)', description: 'A non-refundable application fee of R500 is required to process your application.', card_type: AdmissionsCardType.GATE, sort_order: 4, config: { amount: 500, currency: 'ZAR' } },
        { tenant_id: lak.id, title: 'Placement Assessment', description: 'Your child will be invited for a grade-appropriate placement assessment conducted at the school.', card_type: AdmissionsCardType.STEP, sort_order: 5, config: {} },
        { tenant_id: lak.id, title: 'Parent / Guardian Interview', description: 'A brief interview with the school principal and admissions officer will be scheduled.', card_type: AdmissionsCardType.STEP, sort_order: 6, config: {} },
        { tenant_id: lak.id, title: 'Acceptance & Enrollment Confirmation', description: 'Upon successful completion of all steps, you will receive an acceptance letter and enrollment confirmation.', card_type: AdmissionsCardType.STEP, sort_order: 7, config: {} },
    ]);
    console.log('   ✅ Seeded 8 Lakewood admissions cards');

    // ========== 13. ATTENDANCE MODULE — Classes, Policies, Devices ==========
    console.log('\n📋 Seeding attendance module...');

    const lakBranch = allBranches.find(b => b.branch_code === 'LAK-MAIN')!;
    const allSdnBranch = allBranches.find(b => b.branch_code === 'ALL-SDN')!;

    // School classes
    const classRepo = AppDataSource.getRepository(SchoolClass);
    const lakClass10A = await classRepo.save({
        tenant_id: lak.id,
        branch_id: lakBranch.id,
        grade_id: 'GR_10',
        section_name: 'Grade 10A',
        class_code: 'LAK-10A',
        class_teacher_id: lakewoodTeacher.id,
        academic_year: '2026',
        learner_user_ids: [lakewoodStudent.id],
        is_active: true,
    });
    const lakClass9A = await classRepo.save({
        tenant_id: lak.id,
        branch_id: lakBranch.id,
        grade_id: 'GR_9',
        section_name: 'Grade 9A',
        class_code: 'LAK-9A',
        class_teacher_id: lakewoodTeacher.id,
        academic_year: '2026',
        learner_user_ids: [],
        is_active: true,
    });
    await classRepo.save({
        tenant_id: allSdn.id,
        branch_id: allSdnBranch.id,
        grade_id: 'GR_10',
        section_name: 'Grade 10',
        class_code: 'ALL-10',
        class_teacher_id: alliedStaff.id,
        academic_year: '2026',
        learner_user_ids: [alliedLearner.id],
        is_active: true,
    });
    console.log('   ✅ Created 3 school classes');

    // Attendance policies
    const policyRepo = AppDataSource.getRepository(AttendancePolicy);
    await policyRepo.save({
        tenant_id: lak.id,
        branch_id: lakBranch.id,
        working_days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        school_start_time: '07:30',
        school_end_time: '14:30',
        staff_shift_start: '07:00',
        staff_shift_end: '16:00',
        grace_minutes: 10,
        overtime_grace_minutes: 15,
        late_threshold_minutes: 0,
        missing_checkout_cutoff_minutes: 480,
        anti_passback_minutes: 5,
        alert_routing: { chain: ['TENANT_ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL'], escalation_minutes: 30 },
        is_active: true,
    });
    await policyRepo.save({
        tenant_id: allSdn.id,
        branch_id: allSdnBranch.id,
        working_days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        school_start_time: '07:45',
        school_end_time: '14:00',
        staff_shift_start: '07:15',
        staff_shift_end: '15:30',
        grace_minutes: 15,
        overtime_grace_minutes: 10,
        late_threshold_minutes: 0,
        missing_checkout_cutoff_minutes: 480,
        anti_passback_minutes: 5,
        alert_routing: { chain: ['TENANT_ADMIN'], escalation_minutes: 60 },
        is_active: true,
    });
    console.log('   ✅ Created 2 attendance policies');

    // Kiosk devices
    const kioskRepo = AppDataSource.getRepository(KioskDevice);
    await kioskRepo.save({
        tenant_id: lak.id,
        branch_id: lakBranch.id,
        device_code: 'LAK-GATE-01',
        device_name: 'Main Gate Tablet',
        location_label: 'Main Gate',
        scan_point_type: ScanPointType.GATE,
        is_active: true,
        registered_by_user_id: lakewoodAdmin.id,
    });
    await kioskRepo.save({
        tenant_id: lak.id,
        branch_id: lakBranch.id,
        device_code: 'LAK-REC-01',
        device_name: 'Reception Scanner',
        location_label: 'Reception',
        scan_point_type: ScanPointType.RECEPTION,
        is_active: true,
        registered_by_user_id: lakewoodAdmin.id,
    });
    console.log('   ✅ Created 2 kiosk devices');

    // Sample attendance events (today)
    const eventRepo = AppDataSource.getRepository(AttendanceEvent);
    const todayAt = (h: number, m: number) => {
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
    };

    await eventRepo.save({
        tenant_id: lak.id,
        branch_id: lakBranch.id,
        subject_type: SubjectType.STAFF,
        subject_user_id: lakewoodTeacher.id,
        event_type: AttendanceEventType.CHECK_IN,
        source: AttendanceSourceType.PWA_GEO,
        captured_at_device: todayAt(7, 5),
        captured_at_server: todayAt(7, 5),
        policy_decision: EventPolicyDecision.ALLOW,
        idempotency_key: 'seed-staff-checkin-teacher-1',
        is_offline_synced: false,
    });
    await eventRepo.save({
        tenant_id: lak.id,
        branch_id: lakBranch.id,
        subject_type: SubjectType.LEARNER,
        subject_user_id: lakewoodStudent.id,
        event_type: AttendanceEventType.CHECK_IN,
        source: AttendanceSourceType.KIOSK_SCAN,
        captured_at_device: todayAt(7, 25),
        captured_at_server: todayAt(7, 25),
        policy_decision: EventPolicyDecision.ALLOW,
        idempotency_key: 'seed-learner-checkin-bart-1',
        is_offline_synced: false,
    });
    console.log('   ✅ Created 2 sample attendance events');

    // ========== SUMMARY ==========
    console.log('\n✨ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Brands: 4 (LAK, ALL, JEP, RCS)`);
    console.log(`   - Tenants: 7 (LAK-001, ALL-001..ALL-004, JEP-001, RCS-001)`);
    console.log(`   - Branches: ${allBranches.length}`);
    console.log(`   - Phases: 6, Grades: 17, Languages HL+FAL: 11 each`);
    console.log(`   - Platform subjects: 18`);
    console.log(`   - Admissions cards (Lakewood): 8`);
    console.log(`   - School classes: 3`);
    console.log(`   - Attendance policies: 2`);
    console.log(`   - Kiosk devices: 2`);
    console.log(`   - Attendance events: 2`);
    console.log('\n🔐 Admin Credentials:');
    console.log('   - umarbatuusa@gmail.com / Janat@2000 (PLATFORM_SUPER_ADMIN)');
    console.log('   - admin@edapp.co.za / Janat@2000 (PLATFORM_SUPER_ADMIN)');
    console.log('\n🏫 School Codes:');
    console.log('   - LAK-001 → lakewood.edapp.co.za');
    console.log('   - ALL-001 → allied-sandton.edapp.co.za');
    console.log('   - ALL-002 → allied-pretoria.edapp.co.za');
    console.log('   - ALL-003 → allied-jhb.edapp.co.za');
    console.log('   - ALL-004 → allied-durban.edapp.co.za');
    console.log('   - JEP-001 → jeppe.edapp.co.za');
    console.log('   - RCS-001 → rainbow-city.edapp.co.za');

    await AppDataSource.destroy();
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
