import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Brand, BrandStatus } from '../brands/brand.entity';
import { Tenant, TenantStatus } from '../tenants/tenant.entity';
import { TenantDomain, TenantDomainType } from '../tenants/tenant-domain.entity';
import { Branch } from '../branches/branch.entity';
import { User, UserStatus } from '../users/user.entity';
import { RoleAssignment, UserRole } from '../users/role-assignment.entity';
import { Thread, ThreadType, TicketCategory } from '../communication/thread.entity';
import { ThreadMember, MemberRole, MemberPermission } from '../communication/thread-member.entity';
import { Message, MessageType } from '../communication/message.entity';
import { ParentChildLink } from '../communication/parent-child-link.entity';

// Initialize TypeORM DataSource for seeding
const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://edapp:edapp123@localhost:5432/edapp',
    entities: [Brand, Tenant, TenantDomain, Branch, User, RoleAssignment, Thread, ThreadMember, Message, ParentChildLink],
    synchronize: true, // Auto-create tables (DEV only)
    logging: true,
});

async function seed() {
    console.log('🌱 Starting database seed...');

    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Clear existing data (fresh start)
    await AppDataSource.query('TRUNCATE brands, tenants, tenant_domains, branches, users, role_assignments, threads, thread_members, messages, parent_child_links CASCADE');
    console.log('🗑️  Cleared existing data');

    const brandRepo = AppDataSource.getRepository(Brand);
    const tenantRepo = AppDataSource.getRepository(Tenant);
    const domainRepo = AppDataSource.getRepository(TenantDomain);
    const branchRepo = AppDataSource.getRepository(Branch);
    const userRepo = AppDataSource.getRepository(User);
    const roleRepo = AppDataSource.getRepository(RoleAssignment);

    // ========== 1. CREATE BRANDS (Grouping only) ==========
    console.log('\n📦 Creating brands...');

    const brands = await brandRepo.save([
        { brand_code: 'RAINBOW', brand_name: 'Rainbow City Schools', status: BrandStatus.ACTIVE },
        { brand_code: 'ALLIED', brand_name: 'Allied Education Group', status: BrandStatus.ACTIVE },
        { brand_code: 'LEN', brand_name: 'Lakewood Education Network', status: BrandStatus.ACTIVE },
        { brand_code: 'JEPPE', brand_name: 'Jeppe Educational Centre', status: BrandStatus.ACTIVE },
    ]);

    const brandMap = Object.fromEntries(brands.map(b => [b.brand_code, b]));
    console.log(`   ✅ Created ${brands.length} brands`);

    // ========== 2. CREATE TENANTS ==========
    console.log('\n🏫 Creating tenants...');

    const tenants = await tenantRepo.save([
        {
            brand_id: brandMap['RAINBOW'].id,
            tenant_slug: 'rainbow',
            school_code: 'RAI01',
            school_name: 'Rainbow City Schools',
            status: TenantStatus.ACTIVE,
            auth_config: {
                enable_email_password: true,
                enable_email_magic_link: true,
                enable_google_signin: false,
                enable_student_pin: true,
                pin_length: 4,
            },
        },
        {
            brand_id: brandMap['ALLIED'].id,
            tenant_slug: 'allied',
            school_code: 'ALL01',
            school_name: 'Allied Schools',
            status: TenantStatus.ACTIVE,
            auth_config: {
                enable_email_password: true,
                enable_email_magic_link: true,
                enable_google_signin: false,
                enable_student_pin: true,
                pin_length: 4,
            },
        },
        {
            brand_id: brandMap['LEN'].id,
            tenant_slug: 'lia',
            school_code: 'LIA01',
            school_name: 'Lakewood International Academy',
            status: TenantStatus.ACTIVE,
            auth_config: {
                enable_email_password: true,
                enable_email_magic_link: true,
                enable_google_signin: false,
                enable_student_pin: true,
                pin_length: 4,
            },
        },
        {
            brand_id: brandMap['JEPPE'].id,
            tenant_slug: 'jeppe',
            school_code: 'JEP01',
            school_name: 'Jeppe Education Centre',
            status: TenantStatus.ACTIVE,
            auth_config: {
                enable_email_password: true,
                enable_email_magic_link: true,
                enable_google_signin: false,
                enable_student_pin: true,
                pin_length: 4,
            },
        },
    ]);

    const tenantMap = Object.fromEntries(tenants.map(t => [t.tenant_slug, t]));
    console.log(`   ✅ Created ${tenants.length} tenants`);

    // ========== 3. CREATE TENANT DOMAINS ==========
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

    // ========== 4. CREATE BRANCHES (with REAL contact data) ==========
    console.log('\n🏢 Creating branches...');

    // Rainbow branches
    await branchRepo.save([
        {
            tenant_id: tenantMap['rainbow'].id,
            branch_code: 'MIDRAND',
            branch_name: 'Midrand Branch',
            is_main_branch: true,
            physical_address: '748 Richards Drive, Halfway House, Midrand, 1685',
            mobile_whatsapp: '+27839925241',
            branch_email: 'info@rainbowschools.co.za',
        },
        {
            tenant_id: tenantMap['rainbow'].id,
            branch_code: 'REUVEN',
            branch_name: 'Reuven Branch',
            is_main_branch: false,
            physical_address: '17 Benray Road, Reuven, Johannesburg, 2091',
            mobile_whatsapp: '+27839925241',
            branch_email: 'info@rainbowschools.co.za',
        },
    ]);

    // Allied branches
    await branchRepo.save([
        {
            tenant_id: tenantMap['allied'].id,
            branch_code: 'ROBERTSHAM',
            branch_name: 'Allied School Robertsham',
            is_main_branch: true,
            physical_address: '9 Alamein Road, Robertsham, Johannesburg',
            phone_landline: '011 433 8272',
            mobile_whatsapp: '073 802 9461',
            branch_email: 'info@alliedschools.co.za',
        },
        {
            tenant_id: tenantMap['allied'].id,
            branch_code: 'FORDSBURG_GIRLS',
            branch_name: 'Allied School for Girls (Fordsburg)',
            is_main_branch: false,
            physical_address: '20 Malherbe St, Newtown Fordsburg, Johannesburg',
            mobile_whatsapp: '067 702 7915',
            branch_email: 'info2@alliedschools.co.za',
        },
        {
            tenant_id: tenantMap['allied'].id,
            branch_code: 'FORDSBURG_BOYS',
            branch_name: 'Allied School for Boys (Fordsburg)',
            is_main_branch: false,
            physical_address: '43 Burghersdorp Str, Fordsburg, Johannesburg',
            mobile_whatsapp: '067 738 0803',
            branch_email: 'boys@alliedschools.co.za',
        },
        {
            tenant_id: tenantMap['allied'].id,
            branch_code: 'CASTLE_ROBERTSHAM',
            branch_name: 'Allied Castle for Kids',
            is_main_branch: false,
            physical_address: '188 Kimberley Minor Rd, Robertsham, Johannesburg',
            phone_landline: '011 433 8272',
            branch_email: 'info@alliedschools.co.za',
        },
        {
            tenant_id: tenantMap['allied'].id,
            branch_code: 'SKILLS_FORDSBURG',
            branch_name: 'Allied Skills Training Centre',
            is_main_branch: false,
            physical_address: 'Corner Bree and Burgersdorp Streets, Fordsburg, Johannesburg',
            mobile_whatsapp: '068 721 1598',
            branch_email: 'admissions@alliedschools.co.za',
        },
    ]);

    // LIA branches
    await branchRepo.save([
        {
            tenant_id: tenantMap['lia'].id,
            branch_code: 'ORMONDE',
            branch_name: 'Ormonde (Main Campus)',
            is_main_branch: true,
            physical_address: 'Ormonde, Johannesburg, 2091',
            phone_landline: '010 023 6117',
            mobile_whatsapp: '072 741 3979',
            branch_email: 'info@lakewoodacademy.co.za',
            secondary_email: 'accounts@lakewoodacademy.co.za',
        },
    ]);

    // Jeppe branches
    await branchRepo.save([
        {
            tenant_id: tenantMap['jeppe'].id,
            branch_code: 'DOORNFONTEIN',
            branch_name: 'Johannesburg Campus',
            is_main_branch: true,
            physical_address: 'Stanop House, 63 Sivewright Avenue, New Doornfontein, Johannesburg, 2094',
            phone_landline: '011-333-7846',
            branch_email: 'adminjhb@jeppeeducationcentre.co.za',
        },
    ]);

    const allBranches = await branchRepo.find();
    console.log(`   ✅ Created ${allBranches.length} branches`);

    // ========== 5. CREATE ADMIN USERS ==========
    console.log('\n👤 Creating admin users...');

    const passwordHash = await bcrypt.hash('Janat@2000', 10);

    // Platform Super Admins
    const superAdmin1 = await userRepo.save({
        email: 'umarbatuusa@gmail.com',
        display_name: 'Umar Batuusa',
        password_hash: passwordHash,
        status: UserStatus.ACTIVE,
    });

    const superAdmin2 = await userRepo.save({
        email: 'admin@edapp.co.za',
        display_name: 'EdApp Admin',
        password_hash: passwordHash,
        status: UserStatus.ACTIVE,
    });

    console.log(`   ✅ Created 2 super admin users`);

    // ========== 6. CREATE ROLE ASSIGNMENTS ==========
    console.log('\n🔑 Creating role assignments...');

    // Platform Super Admin roles (no tenant scope)
    await roleRepo.save([
        { user_id: superAdmin1.id, role: UserRole.PLATFORM_SUPER_ADMIN, is_active: true },
        { user_id: superAdmin2.id, role: UserRole.PLATFORM_SUPER_ADMIN, is_active: true },
    ]);

    // ========== 7. CREATE LAKEWOOD DEMO USERS ==========
    console.log('\n🏫 Creating Lakewood (LIA) Demo Users...');

    const liaTenant = tenantMap['lia'];

    // 1. Tenant Admin
    const liaAdmin = await userRepo.save({
        email: 'admin@lakewood.edu',
        display_name: 'Principal Skinner',
        first_name: 'Seymour',
        last_name: 'Skinner',
        password_hash: passwordHash,
        status: UserStatus.ACTIVE,
    });

    // 2. Teacher
    const liaTeacher = await userRepo.save({
        email: 'teacher@lakewood.edu',
        display_name: 'Edna Krabappel',
        first_name: 'Edna',
        last_name: 'Krabappel',
        password_hash: passwordHash,
        status: UserStatus.ACTIVE,
    });

    // 3. Parent
    const liaParent = await userRepo.save({
        email: 'parent@lakewood.edu',
        display_name: 'Marge Simpson',
        first_name: 'Marge',
        last_name: 'Simpson',
        password_hash: passwordHash,
        status: UserStatus.ACTIVE,
    });

    // 4. Student (Learner)
    const liaStudent = await userRepo.save({
        email: 'student@lakewood.edu', // Optional for learner
        student_number: 'LIA001',
        pin_hash: await bcrypt.hash('1234', 10),
        display_name: 'Bart Simpson',
        first_name: 'Bart',
        last_name: 'Simpson',
        status: UserStatus.ACTIVE,
    });

    // ========== 8. ASSIGN ROLES FOR DEMO USERS ==========
    console.log('\n🔑 Assigning LIA Roles...');

    await roleRepo.save([
        // Umar -> Also LIA Admin (for testing)
        { user_id: superAdmin1.id, tenant_id: liaTenant.id, role: UserRole.MAIN_BRANCH_ADMIN, is_active: true },

        // Demo Users
        { user_id: liaAdmin.id, tenant_id: liaTenant.id, role: UserRole.MAIN_BRANCH_ADMIN, is_active: true },
        { user_id: liaTeacher.id, tenant_id: liaTenant.id, role: UserRole.TEACHER, is_active: true },
        { user_id: liaParent.id, tenant_id: liaTenant.id, role: UserRole.PARENT, is_active: true },
        { user_id: liaStudent.id, tenant_id: liaTenant.id, role: UserRole.LEARNER, is_active: true },
    ]);

    console.log(`   ✅ Created role assignments`);

    // ========== 9. CREATE ADDITIONAL STAFF FOR LIA ==========
    console.log('\n👥 Creating additional LIA staff...');

    const liaFinance = await userRepo.save({
        email: 'finance@lakewood.edu',
        display_name: 'Jane Finance',
        first_name: 'Jane',
        last_name: 'Finance',
        password_hash: passwordHash,
        status: UserStatus.ACTIVE,
    });

    const liaTransport = await userRepo.save({
        email: 'transport@lakewood.edu',
        display_name: 'Tom Transport',
        first_name: 'Tom',
        last_name: 'Transport',
        password_hash: passwordHash,
        status: UserStatus.ACTIVE,
    });

    const liaIT = await userRepo.save({
        email: 'itsupport@lakewood.edu',
        display_name: 'Sam IT Support',
        first_name: 'Sam',
        last_name: 'Support',
        password_hash: passwordHash,
        status: UserStatus.ACTIVE,
    });

    await roleRepo.save([
        { user_id: liaFinance.id, tenant_id: liaTenant.id, role: UserRole.STAFF, is_active: true },
        { user_id: liaTransport.id, tenant_id: liaTenant.id, role: UserRole.STAFF, is_active: true },
        { user_id: liaIT.id, tenant_id: liaTenant.id, role: UserRole.STAFF, is_active: true },
    ]);

    console.log('   ✅ Created 3 staff users (Finance, Transport, IT)');

    // ========== 10. PARENT-CHILD LINKS ==========
    console.log('\n👨‍👧 Creating parent-child links...');

    const parentChildRepo = AppDataSource.getRepository(ParentChildLink);
    await parentChildRepo.save({
        tenant_id: liaTenant.id,
        parent_user_id: liaParent.id,
        child_user_id: liaStudent.id,
    });

    console.log('   ✅ Linked Marge Simpson → Bart Simpson');

    // ========== 11. COMMUNICATION THREADS + MESSAGES ==========
    console.log('\n💬 Creating communication threads and messages...');

    const threadRepo = AppDataSource.getRepository(Thread);
    const memberRepo = AppDataSource.getRepository(ThreadMember);
    const messageRepo = AppDataSource.getRepository(Message);

    // Thread 1: Parent ↔ Teacher (DM about homework)
    const dmTeacher = await threadRepo.save({
        tenant_id: liaTenant.id,
        type: ThreadType.DM,
        title: 'Edna Krabappel',
        created_by: liaParent.id,
        last_message_content: 'I\'ll send his progress report by Friday.',
        last_message_at: new Date(),
    });

    await memberRepo.save([
        { thread_id: dmTeacher.id, user_id: liaParent.id, role: MemberRole.MEMBER, permission: MemberPermission.WRITE },
        { thread_id: dmTeacher.id, user_id: liaTeacher.id, role: MemberRole.MEMBER, permission: MemberPermission.WRITE },
    ]);

    const now = new Date();
    await messageRepo.save([
        {
            thread_id: dmTeacher.id, sender_id: liaParent.id, type: MessageType.TEXT,
            content: 'Hi Mrs. Krabappel, I wanted to check in about Bart\'s progress this week.',
            created_at: new Date(now.getTime() - 3600000 * 4),
        },
        {
            thread_id: dmTeacher.id, sender_id: liaTeacher.id, type: MessageType.TEXT,
            content: 'Thank you for reaching out! Bart has been doing much better in class. His math scores have improved significantly.',
            created_at: new Date(now.getTime() - 3600000 * 3.5),
        },
        {
            thread_id: dmTeacher.id, sender_id: liaParent.id, type: MessageType.TEXT,
            content: 'That\'s wonderful to hear! We\'ve been working on practice problems at home.',
            created_at: new Date(now.getTime() - 3600000 * 3),
        },
        {
            thread_id: dmTeacher.id, sender_id: liaTeacher.id, type: MessageType.TEXT,
            content: 'I\'ll send his progress report by Friday.',
            created_at: new Date(now.getTime() - 3600000 * 2),
        },
    ]);

    // Thread 2: Parent ↔ Finance (DM about fees)
    const dmFinance = await threadRepo.save({
        tenant_id: liaTenant.id,
        type: ThreadType.DM,
        title: 'Jane Finance',
        created_by: liaParent.id,
        last_message_content: 'I\'ll check your account and get back to you shortly.',
        last_message_at: new Date(now.getTime() - 1800000),
    });

    await memberRepo.save([
        { thread_id: dmFinance.id, user_id: liaParent.id, role: MemberRole.MEMBER, permission: MemberPermission.WRITE },
        { thread_id: dmFinance.id, user_id: liaFinance.id, role: MemberRole.MEMBER, permission: MemberPermission.WRITE },
    ]);

    await messageRepo.save([
        {
            thread_id: dmFinance.id, sender_id: liaParent.id, type: MessageType.TEXT,
            content: 'Good morning, I would like to check on my outstanding balance for this term.',
            created_at: new Date(now.getTime() - 7200000),
        },
        {
            thread_id: dmFinance.id, sender_id: liaFinance.id, type: MessageType.TEXT,
            content: 'Good morning Mrs. Simpson. Let me pull up your account details.',
            created_at: new Date(now.getTime() - 5400000),
        },
        {
            thread_id: dmFinance.id, sender_id: liaFinance.id, type: MessageType.TEXT,
            content: 'I\'ll check your account and get back to you shortly.',
            created_at: new Date(now.getTime() - 1800000),
        },
    ]);

    console.log('   ✅ Created 2 DM threads with 7 messages');

    // ========== 12. CREATE ALLIED TENANT USERS (Real Firebase accounts) ==========
    console.log('\n🏫 Creating Allied Schools users (real Firebase emails)...');

    const alliedTenant = tenantMap['allied'];

    // Parent — ssebuguzisula@gmail.com (exists in Firebase)
    const alliedParent = await userRepo.save({
        email: 'ssebuguzisula@gmail.com',
        display_name: 'Ssebuguzi Sula',
        first_name: 'Ssebuguzi',
        last_name: 'Sula',
        password_hash: passwordHash,
        status: UserStatus.ACTIVE,
    });

    // Staff — alliedschoolrobertsham@gmail.com (exists in Firebase)
    const alliedStaff = await userRepo.save({
        email: 'alliedschoolrobertsham@gmail.com',
        display_name: 'Allied Staff',
        first_name: 'Allied',
        last_name: 'Staff',
        password_hash: passwordHash,
        status: UserStatus.ACTIVE,
    });

    // Admin — umarbatuusa@gmail.com (already created as super admin, add Allied role)
    // superAdmin1 already exists with this email

    // Additional staff for Allied (teacher, finance, transport)
    const alliedTeacher = await userRepo.save({
        email: 'teacher@allied.edu',
        display_name: 'Mrs. Johnson',
        first_name: 'Sarah',
        last_name: 'Johnson',
        password_hash: passwordHash,
        status: UserStatus.ACTIVE,
    });

    const alliedFinance = await userRepo.save({
        email: 'finance@allied.edu',
        display_name: 'Finance Office',
        first_name: 'Finance',
        last_name: 'Office',
        password_hash: passwordHash,
        status: UserStatus.ACTIVE,
    });

    const alliedTransport = await userRepo.save({
        email: 'transport@allied.edu',
        display_name: 'Transport Office',
        first_name: 'Transport',
        last_name: 'Office',
        password_hash: passwordHash,
        status: UserStatus.ACTIVE,
    });

    // Learner for Allied
    const alliedLearner = await userRepo.save({
        email: 'learner@allied.edu',
        student_number: 'ALL001',
        pin_hash: await bcrypt.hash('1234', 10),
        display_name: 'Test Learner',
        first_name: 'Test',
        last_name: 'Learner',
        status: UserStatus.ACTIVE,
    });

    // Assign roles for Allied
    await roleRepo.save([
        { user_id: alliedParent.id, tenant_id: alliedTenant.id, role: UserRole.PARENT, is_active: true },
        { user_id: alliedStaff.id, tenant_id: alliedTenant.id, role: UserRole.TEACHER, is_active: true },
        { user_id: superAdmin1.id, tenant_id: alliedTenant.id, role: UserRole.MAIN_BRANCH_ADMIN, is_active: true },
        { user_id: alliedTeacher.id, tenant_id: alliedTenant.id, role: UserRole.TEACHER, is_active: true },
        { user_id: alliedFinance.id, tenant_id: alliedTenant.id, role: UserRole.STAFF, is_active: true },
        { user_id: alliedTransport.id, tenant_id: alliedTenant.id, role: UserRole.STAFF, is_active: true },
        { user_id: alliedLearner.id, tenant_id: alliedTenant.id, role: UserRole.LEARNER, is_active: true },
    ]);

    // Parent-child link for Allied
    await parentChildRepo.save({
        tenant_id: alliedTenant.id,
        parent_user_id: alliedParent.id,
        child_user_id: alliedLearner.id,
    });

    // Create DM threads for Allied
    // Thread: Parent ↔ Staff (teacher)
    const alliedDmStaff = await threadRepo.save({
        tenant_id: alliedTenant.id,
        type: ThreadType.DM,
        title: 'Allied Staff',
        created_by: alliedParent.id,
        last_message_content: 'Welcome to Allied Schools communication.',
        last_message_at: new Date(),
    });

    await memberRepo.save([
        { thread_id: alliedDmStaff.id, user_id: alliedParent.id, role: MemberRole.MEMBER, permission: MemberPermission.WRITE },
        { thread_id: alliedDmStaff.id, user_id: alliedStaff.id, role: MemberRole.MEMBER, permission: MemberPermission.WRITE },
    ]);

    await messageRepo.save([
        {
            thread_id: alliedDmStaff.id, sender_id: alliedStaff.id, type: MessageType.TEXT,
            content: 'Welcome to Allied Schools! Feel free to reach out anytime.',
            created_at: new Date(now.getTime() - 3600000),
        },
        {
            thread_id: alliedDmStaff.id, sender_id: alliedParent.id, type: MessageType.TEXT,
            content: 'Thank you! Looking forward to the term.',
            created_at: new Date(now.getTime() - 1800000),
        },
    ]);

    console.log('   ✅ Created Allied users, roles, threads, and messages');

    // ========== SUMMARY ==========
    console.log('\n✨ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Brands: ${brands.length}`);
    console.log(`   - Tenants: ${tenants.length}`);
    console.log(`   - Domains: ${domains.length}`);
    console.log(`   - Branches: ${allBranches.length}`);
    console.log(`   - Users: 16 (2 super admins, 4 LIA demo, 3 LIA staff, 7 Allied)`);
    console.log(`   - Parent-child links: 2 (LIA + Allied)`);
    console.log(`   - Chat threads: 3 (2 LIA DMs + 1 Allied DM)`);
    console.log(`   - Messages: 9`);
    console.log('\n🔐 Admin Credentials:');
    console.log('   - umarbatuusa@gmail.com / Janat@2000');
    console.log('   - admin@edapp.co.za / Janat@2000');
    console.log('\n🏫 School Codes:');
    console.log('   - RAI01 (Rainbow City Schools)');
    console.log('   - ALL01 (Allied Schools)');
    console.log('   - LIA01 (Lakewood International Academy)');
    console.log('   - JEP01 (Jeppe Education Centre)');
    console.log('\n🧪 Demo Accounts (Lakewood - LIA):');
    console.log('   - Tenant Admin: admin@lakewood.edu / Janat@2000');
    console.log('   - Teacher: teacher@lakewood.edu / Janat@2000');
    console.log('   - Parent: parent@lakewood.edu / Janat@2000');
    console.log('   - Student: LIA001 / Pin: 1234');
    console.log('   - Finance: finance@lakewood.edu / Janat@2000');
    console.log('   - Transport: transport@lakewood.edu / Janat@2000');
    console.log('   - IT Support: itsupport@lakewood.edu / Janat@2000');
    console.log('\n🧪 Allied Schools (ALL01) — Real Firebase Accounts:');
    console.log('   - Parent: ssebuguzisula@gmail.com (Firebase)');
    console.log('   - Staff/Teacher: alliedschoolrobertsham@gmail.com (Firebase)');
    console.log('   - Admin: umarbatuusa@gmail.com (Firebase, shared with platform admin)');
    console.log('   - Teacher: teacher@allied.edu / Janat@2000');
    console.log('   - Finance: finance@allied.edu / Janat@2000');
    console.log('   - Transport: transport@allied.edu / Janat@2000');
    console.log('   - Learner: ALL001 / Pin: 1234');

    await AppDataSource.destroy();
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
