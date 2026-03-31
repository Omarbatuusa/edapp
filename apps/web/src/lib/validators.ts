/**
 * Shared pure validation functions for EdApp forms.
 * Each returns string (error message) or null (valid).
 * Composable: validateRequired(v) || validateSaId(v) — first non-null wins.
 *
 * Zero imports — usable on both frontend and backend.
 */

// ──────────────────────────────────────────────
// SA ID Number (South African ID)
// ──────────────────────────────────────────────

function luhnCheck(digits: string): boolean {
    let sum = 0;
    let alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let n = parseInt(digits[i], 10);
        if (alt) {
            n *= 2;
            if (n > 9) n -= 9;
        }
        sum += n;
        alt = !alt;
    }
    return sum % 10 === 0;
}

export function validateSaId(id: string): string | null {
    if (!id) return null;
    const cleaned = id.replace(/\D/g, '');
    if (cleaned.length !== 13) return 'Invalid South African ID number.';

    // Check date portion (YYMMDD)
    const mm = parseInt(cleaned.substring(2, 4), 10);
    const dd = parseInt(cleaned.substring(4, 6), 10);
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return 'Invalid South African ID number.';

    // Luhn checksum
    if (!luhnCheck(cleaned)) return 'Invalid South African ID number.';

    return null;
}

export function extractDobFromSaId(id: string): string | null {
    const cleaned = id.replace(/\D/g, '');
    if (cleaned.length < 6) return null;
    const yy = parseInt(cleaned.substring(0, 2), 10);
    const mm = cleaned.substring(2, 4);
    const dd = cleaned.substring(4, 6);
    const currentTwoDigitYear = new Date().getFullYear() % 100;
    const century = yy <= currentTwoDigitYear ? '20' : '19';
    return `${century}${cleaned.substring(0, 2)}-${mm}-${dd}`;
}

export function extractGenderFromSaId(id: string): 'male' | 'female' | null {
    const cleaned = id.replace(/\D/g, '');
    if (cleaned.length < 10) return null;
    const genderDigits = parseInt(cleaned.substring(6, 10), 10);
    return genderDigits >= 5000 ? 'male' : 'female';
}

export function validateSaIdDobMatch(id: string, dob: string): string | null {
    if (!id || !dob) return null;
    const cleaned = id.replace(/\D/g, '');
    if (cleaned.length < 6 || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
    const idYYMMDD = cleaned.substring(0, 6);
    const dobYYMMDD = dob.slice(2, 4) + dob.slice(5, 7) + dob.slice(8, 10);
    if (idYYMMDD !== dobYYMMDD) return 'ID number does not match date of birth.';
    return null;
}

// ──────────────────────────────────────────────
// Passport
// ──────────────────────────────────────────────

export function validatePassport(value: string): string | null {
    if (!value) return null;
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!/^(?=.*\d)[A-Z0-9]{5,9}$/.test(cleaned)) return 'Invalid passport number.';
    return null;
}

export function normalizePassport(value: string): string {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
}

// ──────────────────────────────────────────────
// Permit (type-aware)
// ──────────────────────────────────────────────

const PERMIT_PATTERNS: Record<string, RegExp> = {
    asylum: /^AS\d{7}$/,
    refugee: /^R\d{8}$/,
    work: /^WP\d{6,8}$/,
    study: /^SP\d{6,8}$/,
    critical: /^CS\d{7}$/,
    general: /^GW\d{6,8}$/,
    ict: /^ICT\d{6,8}$/,
    corporate: /^CP\d{6,8}$/,
    permanent: /^PR\d{6,9}$/,
    retired: /^RP\d{6,9}$/,
    relative: /^REL\d{6,9}$/,
    exchange: /^EX\d{6,9}$/,
    business: /^BV\d{6,9}$/,
    spousal: /^SPV\d{6,9}$/,
    medical: /^MD\d{6,9}$/,
    volunteer: /^VO\d{6,9}$/,
    transit: /^TR\d{6,9}$/,
    crew: /^CR\d{6,9}$/,
};

export function validatePermit(value: string, permitType: string): string | null {
    if (!value) return null;
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const type = permitType?.toLowerCase().replace(/[\s_-]/g, '');
    if (!type) {
        // No type selected — accept any alphanumeric 4-13 chars
        if (!/^[A-Z0-9]{4,13}$/.test(cleaned)) return 'Invalid permit number for selected type.';
        return null;
    }
    const pattern = PERMIT_PATTERNS[type];
    if (!pattern) {
        // Unknown type — accept any alphanumeric
        if (!/^[A-Z0-9]{4,13}$/.test(cleaned)) return 'Invalid permit number for selected type.';
        return null;
    }
    if (!pattern.test(cleaned)) return 'Invalid permit number for selected type.';
    return null;
}

export function normalizePermit(value: string): string {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 13);
}

// ──────────────────────────────────────────────
// Birth Certificate
// ──────────────────────────────────────────────

export function validateBirthCertificate(value: string): string | null {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '');
    if (!/^\d{4,13}$/.test(cleaned)) return 'Invalid birth certificate number.';
    return null;
}

// ──────────────────────────────────────────────
// SACE Number
// ──────────────────────────────────────────────

export function validateSace(value: string): string | null {
    if (!value) return null;
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!/^[A-Z0-9]{5,10}$/.test(cleaned)) return 'Invalid SACE Format';
    return null;
}

// ──────────────────────────────────────────────
// Name
// ──────────────────────────────────────────────

const NAME_REGEX = /^[a-zA-Z\u00C0-\u024F\s'\-]+$/;

export function validateName(value: string): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (trimmed.length < 2) return 'Invalid Name/s. Add Valid Name/s.';
    if (!NAME_REGEX.test(trimmed)) return 'Invalid Name/s. Add Valid Name/s.';
    return null;
}

export function validatePreferredName(value: string): string | null {
    if (!value) return null; // optional
    const trimmed = value.trim();
    if (trimmed.length > 0 && !NAME_REGEX.test(trimmed)) return 'Invalid Preferred name. Add valid names.';
    return null;
}

export function autoCapitalizeName(value: string): string {
    return value.replace(/\b([a-zA-Z\u00C0-\u024F])/g, (_, c) => c.toUpperCase());
}

// ──────────────────────────────────────────────
// Email
// ──────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!EMAIL_REGEX.test(trimmed)) return 'Invalid email. Add a valid email.';
    return null;
}

export function validateEmailOptional(value: string): string | null {
    if (!value || !value.trim()) return null; // empty is fine
    if (!EMAIL_REGEX.test(value.trim())) return 'Invalid email. Add a valid email or leave empty.';
    return null;
}

// ──────────────────────────────────────────────
// Year
// ──────────────────────────────────────────────

export function validateYear(value: string): string | null {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '');
    if (!/^\d{4}$/.test(cleaned)) return 'Invalid year. Enter valid year.';
    const year = parseInt(cleaned, 10);
    if (year < 1900) return 'Invalid year. Enter a valid year.';
    return null;
}

export function validateYearNotFuture(value: string): string | null {
    const baseErr = validateYear(value);
    if (baseErr) return baseErr;
    if (!value) return null;
    const year = parseInt(value.replace(/\D/g, ''), 10);
    if (year > new Date().getFullYear()) return 'Invalid year. Future years are not allowed.';
    return null;
}

// ──────────────────────────────────────────────
// Age Range
// ──────────────────────────────────────────────

function calcAge(dob: string): number {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

export function validateLearnerAge(dob: string): string | null {
    if (!dob) return null;
    const age = calcAge(dob);
    if (isNaN(age) || age < 3 || age > 21) return 'Learner age must be between 3 and 21 years.';
    return null;
}

export function validateAdultAge(dob: string): string | null {
    if (!dob) return null;
    const age = calcAge(dob);
    if (isNaN(age) || age < 18 || age > 65) return 'Age must be between 18 and 65.';
    return null;
}

// ──────────────────────────────────────────────
// Date Business Rules
// ──────────────────────────────────────────────

export function validateDateNotWeekend(dateStr: string): string | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const day = d.getUTCDay();
    if (day === 0 || day === 6) return 'Starting date cannot be a weekend.';
    return null;
}

export function validateJoiningDateNotTooOld(dateStr: string): string | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    if (d < fiveYearsAgo) return 'Joining date cannot be more than 5 years ago.';
    return null;
}

// ──────────────────────────────────────────────
// Required
// ──────────────────────────────────────────────

export function validateRequired(value: any): string | null {
    if (value === null || value === undefined) return 'This field is required.';
    if (typeof value === 'string' && value.trim() === '') return 'This field is required.';
    return null;
}
