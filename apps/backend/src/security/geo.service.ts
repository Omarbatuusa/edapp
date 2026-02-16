import { Injectable, BadRequestException } from '@nestjs/common';
import { GeoZone } from './geo-zone.entity';

export interface GeoPayload {
    lat: number;
    lng: number;
    accuracy: number;
    capturedAt: Date; // ISO string or Date object
}

@Injectable()
export class GeoService {
    private readonly EARTH_RADIUS_METERS = 6371000;

    validateGeoPayload(payload: GeoPayload, maxAgeSeconds: number, maxAccuracyMeters: number): void {
        if (payload.lat === undefined || payload.lat === null || payload.lng === undefined || payload.lng === null) {
            throw new BadRequestException('GEO_REQUIRED');
        }

        if (payload.accuracy > maxAccuracyMeters) {
            throw new BadRequestException('GEO_INACCURATE');
        }

        const captureTime = new Date(payload.capturedAt).getTime();
        const now = Date.now();
        const ageSeconds = (now - captureTime) / 1000;

        if (ageSeconds > maxAgeSeconds) {
            throw new BadRequestException('GEO_STALE');
        }
    }

    isWithinZone(payload: GeoPayload, zone: GeoZone): boolean {
        const dist = this.calculateDistance(
            payload.lat,
            payload.lng,
            Number(zone.centerLat),
            Number(zone.centerLng),
        );
        return dist <= zone.radiusM;
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const toRad = (value: number) => (value * Math.PI) / 180;
        const phi1 = toRad(lat1);
        const phi2 = toRad(lat2);
        const deltaPhi = toRad(lat2 - lat1);
        const deltaLambda = toRad(lon2 - lon1);

        const a =
            Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return this.EARTH_RADIUS_METERS * c;
    }
}
