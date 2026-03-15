import { Repository } from 'typeorm';

/**
 * Generate a URL-safe slug from a name.
 * e.g., "Rainbow City Schools" → "rainbow-city-schools"
 */
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 60);
}

/**
 * Generate a school code from a name.
 * Takes first 3 letters uppercase + 2-digit sequence.
 * e.g., "Lakewood Academy" → "LAK01"
 */
export function generateSchoolCode(name: string): string {
    const prefix = name
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 3)
        .toUpperCase()
        .padEnd(3, 'X');
    return `${prefix}01`;
}

/**
 * Ensure a slug is unique by appending -2, -3, etc. if needed.
 */
export async function ensureUniqueSlug(
    slug: string,
    repo: Repository<any>,
    column: string = 'tenant_slug',
    excludeId?: string,
): Promise<string> {
    let candidate = slug;
    let counter = 1;

    while (true) {
        const query: any = { [column]: candidate };
        const existing = await repo.findOne({ where: query });

        if (!existing || (excludeId && existing.id === excludeId)) {
            return candidate;
        }

        counter++;
        candidate = `${slug}-${counter}`;

        if (counter > 100) {
            throw new Error(`Could not generate unique slug after 100 attempts for: ${slug}`);
        }
    }
}

/**
 * Ensure a school code is unique by incrementing the number suffix.
 */
export async function ensureUniqueCode(
    code: string,
    repo: Repository<any>,
    column: string = 'school_code',
    excludeId?: string,
): Promise<string> {
    const prefix = code.replace(/\d+$/, '');
    let num = parseInt(code.replace(/^[A-Z]+/, ''), 10) || 1;

    while (true) {
        const candidate = `${prefix}${String(num).padStart(2, '0')}`;
        const query: any = { [column]: candidate };
        const existing = await repo.findOne({ where: query });

        if (!existing || (excludeId && existing.id === excludeId)) {
            return candidate;
        }

        num++;
        if (num > 99) {
            throw new Error(`Could not generate unique code after 99 attempts for prefix: ${prefix}`);
        }
    }
}
