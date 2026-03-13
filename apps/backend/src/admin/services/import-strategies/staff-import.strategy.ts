import { EntityManager } from 'typeorm';
import { ImportStrategy } from '../bulk-import.service';
import { ImportRowError } from '../../dto/bulk-import.dto';
import { randomBytes } from 'crypto';

export class StaffImportStrategy implements ImportStrategy {
  getColumnMap(): Record<string, string> {
    return {
      'Email': 'email',
      'email': 'email',
      'First Name': 'first_name',
      'first_name': 'first_name',
      'Last Name': 'last_name',
      'last_name': 'last_name',
      'Title': 'title',
      'title': 'title',
      'ID Number': 'id_number',
      'id_number': 'id_number',
      'Phone': 'phone',
      'phone': 'phone',
      'Role': 'role',
      'role': 'role',
      'Department': 'department',
      'department': 'department',
      'Start Date': 'employment_start_date',
      'employment_start_date': 'employment_start_date',
    };
  }

  getRequiredColumns(): string[] {
    return ['email', 'first_name', 'last_name', 'role'];
  }

  async validateRow(
    row: Record<string, any>,
    rowIndex: number,
    tenantId: string | null,
    manager: EntityManager,
  ): Promise<ImportRowError[]> {
    const errors: ImportRowError[] = [];

    if (!row.email?.trim()) {
      errors.push({ row_index: rowIndex, field: 'email', error: 'Email is required', severity: 'error' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
      errors.push({ row_index: rowIndex, field: 'email', error: 'Invalid email format', severity: 'error' });
    }

    if (!row.first_name?.trim()) {
      errors.push({ row_index: rowIndex, field: 'first_name', error: 'First name is required', severity: 'error' });
    }

    if (!row.last_name?.trim()) {
      errors.push({ row_index: rowIndex, field: 'last_name', error: 'Last name is required', severity: 'error' });
    }

    if (!row.role?.trim()) {
      errors.push({ row_index: rowIndex, field: 'role', error: 'Role is required', severity: 'error' });
    }

    // Check email uniqueness
    if (row.email?.trim()) {
      const existing = await manager.query(
        `SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
        [row.email.trim()],
      );
      if (existing.length > 0) {
        errors.push({ row_index: rowIndex, field: 'email', error: 'User with this email already exists (will be linked)', severity: 'warning' });
      }
    }

    // Validate start date format
    if (row.employment_start_date?.trim()) {
      const dateStr = row.employment_start_date.trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) && isNaN(Date.parse(dateStr))) {
        errors.push({ row_index: rowIndex, field: 'employment_start_date', error: 'Invalid date format (use YYYY-MM-DD)', severity: 'error' });
      }
    }

    return errors;
  }

  async executeRow(
    row: Record<string, any>,
    tenantId: string | null,
    userId: string,
    manager: EntityManager,
  ): Promise<void> {
    const email = row.email.trim().toLowerCase();
    const firstName = row.first_name.trim();
    const lastName = row.last_name.trim();
    const displayName = `${firstName} ${lastName}`;
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    const role = row.role.trim().toUpperCase();

    // 1. Find or create user
    let userResult = await manager.query(
      `SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email],
    );

    let userIdValue: string;

    if (userResult.length > 0) {
      userIdValue = userResult[0].id;
    } else {
      // Create user with temp password
      const tempPassword = randomBytes(4).toString('hex'); // 8-char temp password
      const result = await manager.query(
        `INSERT INTO users (email, first_name, last_name, display_name, temp_password, must_change_password, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
         RETURNING id`,
        [email, firstName, lastName, displayName, tempPassword],
      );
      userIdValue = result[0].id;
    }

    // 2. Create staff profile
    const staffCode = `STF-${Date.now().toString(36).toUpperCase().slice(-4)}-${randomBytes(2).toString('hex').toUpperCase()}`;

    await manager.query(
      `INSERT INTO staff_profiles (user_id, tenant_id, staff_code, title, initials, department, employment_start_date, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
       ON CONFLICT (user_id, tenant_id) DO UPDATE SET
         title = COALESCE(EXCLUDED.title, staff_profiles.title),
         department = COALESCE(EXCLUDED.department, staff_profiles.department),
         updated_at = NOW()`,
      [
        userIdValue,
        tenantId,
        staffCode,
        row.title?.trim() || null,
        initials,
        row.department?.trim() || null,
        row.employment_start_date?.trim() || null,
      ],
    );

    // 3. Create role assignment
    await manager.query(
      `INSERT INTO role_assignments (user_id, tenant_id, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, true, NOW(), NOW())
       ON CONFLICT DO NOTHING`,
      [userIdValue, tenantId, role.toLowerCase()],
    );
  }
}
