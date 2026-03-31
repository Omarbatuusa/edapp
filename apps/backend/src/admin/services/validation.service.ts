import { Injectable } from '@nestjs/common';

/**
 * Shared backend validation + normalization service.
 * Mirrors the frontend validators.ts — backend is the source of truth.
 */
@Injectable()
export class ValidationService {

    // ──── SA ID ────

    validateSaId(id: string): string | null {
        if (!id) return null;
        const cleaned = id.replace(/\D/g, '');
        if (cleaned.length !== 13) return 'Invalid South African ID number.';
        const mm = parseInt(cleaned.substring(2, 4), 10);
        const dd = parseInt(cleaned.substring(4, 6), 10);
        if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return 'Invalid South African ID number.';
        if (!this.luhn(cleaned)) return 'Invalid South African ID number.';
        return null;
    }

    extractDobFromSaId(id: string): string | null {
        const cleaned = id.replace(/\D/g, '');
        if (cleaned.length < 6) return null;
        const yy = parseInt(cleaned.substring(0, 2), 10);
        const mm = cleaned.substring(2, 4);
        const dd = cleaned.substring(4, 6);
        const currentTwoDigitYear = new Date().getFullYear() % 100;
        const century = yy <= currentTwoDigitYear ? '20' : '19';
        return `${century}${cleaned.substring(0, 2)}-${mm}-${dd}`;
    }

    extractGenderFromSaId(id: string): 'male' | 'female' | null {
        const cleaned = id.replace(/\D/g, '');
        if (cleaned.length < 10) return null;
        return parseInt(cleaned.substring(6, 10), 10) >= 5000 ? 'male' : 'female';
    }

    validateSaIdDobMatch(id: string, dob: string): string | null {
        if (!id || !dob) return null;
        const cleaned = id.replace(/\D/g, '');
        if (cleaned.length < 6 || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
        const idYYMMDD = cleaned.substring(0, 6);
        const dobYYMMDD = dob.slice(2, 4) + dob.slice(5, 7) + dob.slice(8, 10);
        if (idYYMMDD !== dobYYMMDD) return 'ID number does not match date of birth.';
        return null;
    }

    // ──── Passport ────

    validatePassport(value: string): string | null {
        if (!value) return null;
        const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!/^(?=.*\d)[A-Z0-9]{5,9}$/.test(cleaned)) return 'Invalid passport number.';
        return null;
    }

    normalizePassport(value: string): string {
        return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
    }

    // ──── Permit ────

    private readonly PERMIT_PATTERNS: Record<string, RegExp> = {
        asylum: /^AS\d{7}$/, refugee: /^R\d{8}$/, work: /^WP\d{6,8}$/,
        study: /^SP\d{6,8}$/, critical: /^CS\d{7}$/, general: /^GW\d{6,8}$/,
        ict: /^ICT\d{6,8}$/, corporate: /^CP\d{6,8}$/, permanent: /^PR\d{6,9}$/,
        retired: /^RP\d{6,9}$/, relative: /^REL\d{6,9}$/, exchange: /^EX\d{6,9}$/,
        business: /^BV\d{6,9}$/, spousal: /^SPV\d{6,9}$/, medical: /^MD\d{6,9}$/,
        volunteer: /^VO\d{6,9}$/, transit: /^TR\d{6,9}$/, crew: /^CR\d{6,9}$/,
    };

    validatePermit(value: string, permitType: string): string | null {
        if (!value) return null;
        const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const type = permitType?.toLowerCase().replace(/[\s_-]/g, '');
        if (!type || !this.PERMIT_PATTERNS[type]) {
            if (!/^[A-Z0-9]{4,13}$/.test(cleaned)) return 'Invalid permit number for selected type.';
            return null;
        }
        if (!this.PERMIT_PATTERNS[type].test(cleaned)) return 'Invalid permit number for selected type.';
        return null;
    }

    normalizePermit(value: string): string {
        return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 13);
    }

    // ──── Birth Certificate ────

    validateBirthCertificate(value: string): string | null {
        if (!value) return null;
        const cleaned = value.replace(/\D/g, '');
        if (!/^\d{4,13}$/.test(cleaned)) return 'Invalid birth certificate number.';
        return null;
    }

    // ──── SACE ────

    validateSace(value: string): string | null {
        if (!value) return null;
        const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!/^[A-Z0-9]{5,10}$/.test(cleaned)) return 'Invalid SACE Format';
        return null;
    }

    // ──── Name ────

    validateName(value: string): string | null {
        if (!value) return null;
        const trimmed = value.trim();
        if (trimmed.length < 2) return 'Invalid Name/s. Add Valid Name/s.';
        if (!/^[a-zA-Z\u00C0-\u024F\s'\-]+$/.test(trimmed)) return 'Invalid Name/s. Add Valid Name/s.';
        return null;
    }

    normalizeName(value: string): string {
        return value.trim().replace(/\b([a-zA-Z\u00C0-\u024F])/g, (_, c) => c.toUpperCase());
    }

    // ──── Email ────

    validateEmail(value: string): string | null {
        if (!value) return null;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Invalid email. Add a valid email.';
        return null;
    }

    // ──── Age ────

    validateLearnerAge(dob: string): string | null {
        if (!dob) return null;
        const age = this.calcAge(dob);
        if (isNaN(age) || age < 3 || age > 21) return 'Learner age must be between 3 and 21 years.';
        return null;
    }

    validateAdultAge(dob: string): string | null {
        if (!dob) return null;
        const age = this.calcAge(dob);
        if (isNaN(age) || age < 18 || age > 65) return 'Age must be between 18 and 65.';
        return null;
    }

    // ──── Normalization helpers ────

    normalizeSaId(raw: string): string {
        return raw.replace(/\D/g, '').slice(0, 13);
    }

    // ──── Private helpers ────

    private luhn(digits: string): boolean {
        let sum = 0;
        let alt = false;
        for (let i = digits.length - 1; i >= 0; i--) {
            let n = parseInt(digits[i], 10);
            if (alt) { n *= 2; if (n > 9) n -= 9; }
            sum += n;
            alt = !alt;
        }
        return sum % 10 === 0;
    }

    private calcAge(dob: string): number {
        const birth = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    }
}
