import { Injectable } from '@nestjs/common';
import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

export interface PhoneNormResult {
    e164: string;
    national: string;
    country_iso2: string;
    dial_code: string;
}

@Injectable()
export class PhoneNormalizationService {
    /**
     * Normalize a raw phone string into E.164 format.
     *
     * Handles:
     *  - Local numbers starting with 0 (e.g. 0821234567 + ZA → +27821234567)
     *  - International numbers starting with + (e.g. +27821234567)
     *  - Numbers with spaces, dashes, brackets
     *
     * Returns null if the number cannot be parsed/validated.
     */
    normalize(raw: string, countryIso2: string): PhoneNormResult | null {
        if (!raw || !countryIso2) return null;

        const cleaned = raw.trim();
        if (!cleaned) return null;

        const country = countryIso2.toUpperCase() as CountryCode;

        try {
            // Always try with country hint first — handles local numbers (0XX) correctly
            const parsed = parsePhoneNumber(cleaned, country);
            if (parsed && parsed.isValid()) {
                return {
                    e164: parsed.format('E.164'),
                    national: parsed.formatNational(),
                    country_iso2: parsed.country || countryIso2.toUpperCase(),
                    dial_code: `+${parsed.countryCallingCode}`,
                };
            }
        } catch { /* fall through */ }

        // If that fails and input starts with +, try without country hint
        if (cleaned.startsWith('+')) {
            try {
                const parsed = parsePhoneNumber(cleaned);
                if (parsed && parsed.isValid()) {
                    return {
                        e164: parsed.format('E.164'),
                        national: parsed.formatNational(),
                        country_iso2: parsed.country || countryIso2.toUpperCase(),
                        dial_code: `+${parsed.countryCallingCode}`,
                    };
                }
            } catch { /* fall through */ }
        }

        return null;
    }

    /**
     * Validate a phone number against a specific country.
     * Lighter than normalize — just returns true/false.
     */
    isValid(raw: string, countryIso2: string): boolean {
        if (!raw || !countryIso2) return false;
        try {
            return isValidPhoneNumber(raw.trim(), countryIso2.toUpperCase() as CountryCode);
        } catch {
            return false;
        }
    }
}
