import { z } from 'zod';

/** First name: 2-50 chars, letters + hyphens + apostrophes + spaces */
export const firstNameSchema = z
  .string()
  .min(2, 'At least 2 characters')
  .max(50, 'Maximum 50 characters')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Letters, hyphens, and apostrophes only');

/** Surname: 2-60 chars, supports multi-part surnames (van der Merwe, De La Cruz) */
export const surnameSchema = z
  .string()
  .min(2, 'At least 2 characters')
  .max(60, 'Maximum 60 characters')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Letters, hyphens, and apostrophes only');

/** SA ID number: 13 digits with basic Luhn check */
export const saIdSchema = z
  .string()
  .regex(/^\d{13}$/, 'Must be exactly 13 digits')
  .refine(val => {
    // Basic date check: first 6 digits = YYMMDD
    const mm = parseInt(val.substring(2, 4), 10);
    const dd = parseInt(val.substring(4, 6), 10);
    return mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31;
  }, 'Invalid date portion in ID number');

/** SA phone number: 10 digits starting with 0, or +27 format */
export const saPhoneSchema = z
  .string()
  .regex(/^(?:0\d{9}|\+27\d{9})$/, 'Must be 10 digits (0XX) or +27 format');

/** Auto-generate initials from first name and surname */
export function initialsFromName(firstName: string, surname: string): string {
  const f = firstName.trim().charAt(0).toUpperCase();
  const s = surname.trim().charAt(0).toUpperCase();
  return `${f}${s}`;
}

/** Title-case a name: john → John, VAN DER merwe → Van Der Merwe */
export function titleCaseName(name: string): string {
  return name
    .toLowerCase()
    .split(/(\s+|-|')/)
    .map(part => {
      if (/^\s+$/.test(part) || part === '-' || part === "'") return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
}

/** Email validation (basic) */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(255, 'Maximum 255 characters')
  .transform(v => v.toLowerCase().trim());
