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
 * Takes first 3 letters uppercase + 3-digit sequence.
 * e.g., "Lakewood Academy" → "LAK001"
 */
export function generateSchoolCode(name: string): string {
    const prefix = name
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 3)
        .toUpperCase()
        .padEnd(3, 'X');
    return `${prefix}001`;
}

/**
 * Smart 3-6 char slug for tenant subdomains.
 * 1-2 words → first word stripped to alpha, max 6 chars (min 3)
 * 3+ words  → initials of each word, max 6 chars (min 3)
 * e.g. "Allied Schools"            → "allied"
 * e.g. "Lakewood International Academy" → "lia"
 */
export function generateTenantSlug(name: string): string {
    const words = name.trim().split(/\s+/).filter(w => /[a-zA-Z]/.test(w));
    let slug: string;
    if (words.length >= 3) {
        slug = words.map(w => w.replace(/[^a-zA-Z]/g, '')[0] || '').join('').toLowerCase();
    } else {
        slug = (words[0] || '').replace(/[^a-zA-Z]/g, '').toLowerCase();
    }
    slug = slug.substring(0, 6);
    if (slug.length < 3) slug = slug.padEnd(3, 'x');
    return slug;
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
        const candidate = `${prefix}${String(num).padStart(3, '0')}`;
        const query: any = { [column]: candidate };
        const existing = await repo.findOne({ where: query });

        if (!existing || (excludeId && existing.id === excludeId)) {
            return candidate;
        }

        num++;
        if (num > 999) {
            throw new Error(`Could not generate unique code after 999 attempts for prefix: ${prefix}`);
        }
    }
}
