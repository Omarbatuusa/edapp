import { Controller, Post, Body } from '@nestjs/common';

/**
 * Server-side geocoding proxy.
 * Uses GOOGLE_MAPS_SERVER_KEY (unrestricted key) so referrer restrictions on the
 * browser key don't block server-to-server Geocoding API calls.
 *
 * Degrades gracefully — returns { valid: false } if key is not configured.
 */
@Controller('admin/geocode')
export class AdminGeocodeController {
    @Post()
    async geocode(@Body() body: { address?: string; place_id?: string }): Promise<Record<string, unknown>> {
        const key = process.env.GOOGLE_MAPS_SERVER_KEY;
        if (!key) return { valid: false, error: 'not_configured' };

        if (!body.place_id && !body.address) {
            return { valid: false, error: 'address or place_id required' };
        }

        const params = new URLSearchParams({ key });
        if (body.place_id) {
            params.set('place_id', body.place_id);
        } else {
            params.set('address', body.address!);
        }

        try {
            const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
            );
            const data: any = await res.json();

            if (data.status !== 'OK' || !data.results?.length) {
                return { valid: false, status: data.status };
            }

            const r = data.results[0];
            const loc = r.geometry?.location;

            // Extract common address components
            const components: Record<string, string> = {};
            for (const comp of (r.address_components || [])) {
                for (const type of comp.types) {
                    components[type] = comp.long_name;
                    if (type === 'country') components['country_iso2'] = comp.short_name;
                }
            }

            return {
                valid: true,
                formatted_address: r.formatted_address,
                place_id: r.place_id,
                lat: loc?.lat ?? null,
                lng: loc?.lng ?? null,
                components,
            };
        } catch (err: any) {
            return { valid: false, error: err?.message || 'geocoding_failed' };
        }
    }
}
