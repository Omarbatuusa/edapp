import { EntityManager } from 'typeorm';
import { ImportStrategy } from '../bulk-import.service';
import { ImportRowError } from '../../dto/bulk-import.dto';

export class BrandImportStrategy implements ImportStrategy {
  getColumnMap(): Record<string, string> {
    return {
      'Brand Name': 'brand_name',
      'brand_name': 'brand_name',
      'Brand Slug': 'brand_slug',
      'brand_slug': 'brand_slug',
      'Brand Code': 'brand_code',
      'brand_code': 'brand_code',
      'Description': 'description',
      'description': 'description',
      'Contact Email': 'contact_email',
      'contact_email': 'contact_email',
      'Contact Phone': 'contact_phone',
      'contact_phone': 'contact_phone',
      'Website URL': 'website_url',
      'website_url': 'website_url',
    };
  }

  getRequiredColumns(): string[] {
    return ['brand_name', 'brand_slug'];
  }

  async validateRow(
    row: Record<string, any>,
    rowIndex: number,
    _tenantId: string | null,
    manager: EntityManager,
  ): Promise<ImportRowError[]> {
    const errors: ImportRowError[] = [];

    if (!row.brand_name?.trim()) {
      errors.push({ row_index: rowIndex, field: 'brand_name', error: 'Brand name is required', severity: 'error' });
    }

    if (!row.brand_slug?.trim()) {
      errors.push({ row_index: rowIndex, field: 'brand_slug', error: 'Brand slug is required', severity: 'error' });
    } else {
      // Validate slug format
      const slug = row.brand_slug.trim().toLowerCase();
      if (!/^[a-z0-9-]+$/.test(slug)) {
        errors.push({ row_index: rowIndex, field: 'brand_slug', error: 'Slug must be lowercase letters, numbers, and hyphens only', severity: 'error' });
      }

      // Check uniqueness
      const existing = await manager.query(
        `SELECT id FROM brands WHERE LOWER(brand_code) = LOWER($1) LIMIT 1`,
        [row.brand_code || slug.toUpperCase().replace(/-/g, '_')],
      );
      if (existing.length > 0) {
        errors.push({ row_index: rowIndex, field: 'brand_slug', error: 'Brand with this code already exists', severity: 'warning' });
      }
    }

    if (row.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.contact_email.trim())) {
      errors.push({ row_index: rowIndex, field: 'contact_email', error: 'Invalid email format', severity: 'error' });
    }

    return errors;
  }

  async executeRow(
    row: Record<string, any>,
    _tenantId: string | null,
    _userId: string,
    manager: EntityManager,
  ): Promise<void> {
    const brandName = row.brand_name.trim();
    const brandSlug = row.brand_slug.trim().toLowerCase();
    const brandCode = (row.brand_code || brandSlug.toUpperCase().replace(/-/g, '_')).trim().toUpperCase();

    await manager.query(
      `INSERT INTO brands (brand_code, brand_name, status, created_at, updated_at)
       VALUES ($1, $2, 'active', NOW(), NOW())
       ON CONFLICT (brand_code) DO UPDATE SET brand_name = EXCLUDED.brand_name, updated_at = NOW()`,
      [brandCode, brandName],
    );
  }
}
