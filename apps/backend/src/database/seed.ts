import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Brand, BrandStatus } from '../brands/brand.entity';
import { Tenant, TenantStatus } from '../tenants/tenant.entity';
import { TenantDomain, TenantDomainType } from '../tenants/tenant-domain.entity';
import { Branch } from '../branches/branch.entity';
import { User, UserStatus } from '../users/user.entity';
import { RoleAssignment, UserRole } from '../users/role-assignment.entity';

// Initialize TypeORM DataSource for seeding
const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://edapp:edapp123@localhost:5432/edapp',
    entities: [Brand, Tenant, TenantDomain, Branch, User, RoleAssignment],
    synchronize: true, // Auto-create tables (DEV only)
    logging: true,
});

async function seed() {
    console.log('🌱 Starting database seed...');

    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Clear existing data (fresh start)
    await AppDataSource.query('TRUNCATE brands, tenants, tenant_domains, branches, users, role_assignments CASCADE');
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

    console.log(`   ✅ Created role assignments`);

    // ========== SUMMARY ==========
    console.log('\n✨ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Brands: ${brands.length}`);
    console.log(`   - Tenants: ${tenants.length}`);
    console.log(`   - Domains: ${domains.length}`);
    console.log(`   - Branches: ${allBranches.length}`);
    console.log(`   - Users: 2 (Platform Super Admins)`);
    console.log('\n🔐 Admin Credentials:');
    console.log('   - umarbatuusa@gmail.com / Janat@2000');
    console.log('   - admin@edapp.co.za / Janat@2000');
    console.log('\n🏫 School Codes:');
    console.log('   - RAI01 (Rainbow City Schools)');
    console.log('   - ALL01 (Allied Schools)');
    console.log('   - LIA01 (Lakewood International Academy)');
    console.log('   - JEP01 (Jeppe Education Centre)');

    await AppDataSource.destroy();
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
