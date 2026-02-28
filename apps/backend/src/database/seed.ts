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
        DictSalutation, DictReligion, Subject, TenantFeature,
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

    console.log('   ✅ Seeded all dictionaries');

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
