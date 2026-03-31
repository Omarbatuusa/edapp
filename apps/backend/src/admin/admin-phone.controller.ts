import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { PhoneNormalizationService } from './services/phone-normalization.service';

@Controller('admin/phone')
export class AdminPhoneController {
    constructor(private readonly phoneService: PhoneNormalizationService) {}

    @Post('validate')
    validate(@Body() body: { phone: string; country_iso2: string }) {
        const { phone, country_iso2 } = body;

        if (!phone || !country_iso2) {
            throw new BadRequestException('phone and country_iso2 are required');
        }

        const result = this.phoneService.normalize(phone, country_iso2);
        if (!result) return { valid: false };

        return { valid: true, ...result };
    }
}
