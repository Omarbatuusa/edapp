import { Test, TestingModule } from '@nestjs/testing';
import { GeoService } from './geo.service';
import { BadRequestException } from '@nestjs/common';

describe('GeoService', () => {
    let service: GeoService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GeoService],
        }).compile();

        service = module.get<GeoService>(GeoService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateGeoPayload', () => {
        it('should throw if lat/lng missing', () => {
            expect(() => service.validateGeoPayload({} as any, 120, 100)).toThrow(BadRequestException);
        });

        it('should throw if accuracy is too low (value too high)', () => {
            const payload = { lat: 0, lng: 0, accuracy: 200, capturedAt: new Date() };
            expect(() => service.validateGeoPayload(payload, 120, 100)).toThrow(BadRequestException); // Max 100
        });

        it('should throw if stale', () => {
            const past = new Date(Date.now() - 5000 * 1000);
            const payload = { lat: 0, lng: 0, accuracy: 50, capturedAt: past };
            expect(() => service.validateGeoPayload(payload, 120, 100)).toThrow(BadRequestException);
        });

        it('should pass valid payload', () => {
            const payload = { lat: 0, lng: 0, accuracy: 50, capturedAt: new Date() };
            expect(() => service.validateGeoPayload(payload, 120, 100)).not.toThrow();
        });
    });

    describe('isWithinZone', () => {
        it('should return true if inside radius', () => {
            // Point A
            const payload = { lat: 40.7128, lng: -74.0060, accuracy: 10, capturedAt: new Date() };
            // Zone centered at Point A with 100m radius
            const zone = { centerLat: 40.7128, centerLng: -74.0060, radiusM: 100 } as any;
            expect(service.isWithinZone(payload, zone)).toBe(true);
        });

        it('should return false if outside radius', () => {
            // Point A
            const payload = { lat: 40.7128, lng: -74.0060, accuracy: 10, capturedAt: new Date() };
            // Zone far away
            const zone = { centerLat: 41.7128, centerLng: -74.0060, radiusM: 100 } as any;
            expect(service.isWithinZone(payload, zone)).toBe(false);
        });
    });
});
