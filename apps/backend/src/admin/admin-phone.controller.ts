import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

@Controller('admin/phone')
export class AdminPhoneController {
    @Post('validate')
    validate(@Body() body: { phone: string; country_iso2: string }) {
        const { phone, country_iso2 } = body;

        if (!phone || !country_iso2) {
            throw new BadRequestException('phone and country_iso2 are required');
        }

        try {
            const countryCode = country_iso2.toUpperCase() as CountryCode;
            const valid = isValidPhoneNumber(phone, countryCode);

            if (!valid) {
                return { valid: false };
            }

            const parsed = parsePhoneNumber(phone, countryCode);
            return {
                valid: true,
                e164: parsed.format('E.164'),
                national: parsed.formatNational(),
                country_iso2: parsed.country,
                dial_code: `+${parsed.countryCallingCode}`,
            };
        } catch {
            return { valid: false };
        }
    }
}
