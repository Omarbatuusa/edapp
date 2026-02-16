import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Security Enforcement (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/attendance/learner/mark (POST) - Blocked by Geo (Missing)', () => {
        return request(app.getHttpServer())
            .post('/attendance/learner/mark')
            .set('x-tenant-id', 'test-tenant')
            .send({ studentId: '123' })
            .expect(400) // Expect BadRequest due to missing Geo if ENFORCE is on (default might be WARN though? Let's check policy)
            // Actually default is WARN in my code: `policy.geoMode = SecurityMode.WARN;`
            // So it should return 201/200 but log warning.
            // Wait, mock controller returns { status: 'success' }
            .expect(201)
            .expect((res) => {
                expect(res.body.status).toBe('success');
            });
    });

    // To test blocking, we need to set policy to ENFORCE.
    // But we can't easily change DB state in e2e without a seeding step or API call.
    // We added SecuritySettingsController! We can use it.

    it('should allow Admin to set Policy to ENFORCE', async () => {
        // 1. Set Policy
        await request(app.getHttpServer())
            .put('/security-settings/policy')
            .set('x-tenant-id', 'test-tenant')
            .send({ geoMode: 'ENFORCE', ipMode: 'OFF' })
            .expect(200);

        // 2. Try Mark without Geo -> Blocked
        await request(app.getHttpServer())
            .post('/attendance/learner/mark')
            .set('x-tenant-id', 'test-tenant')
            .send({ studentId: '123' })
            .expect(400) // BadRequest: GEO_REQUIRED
            .expect((res) => {
                expect(res.body.message).toBe('GEO_REQUIRED');
            });
    });

    it('should block if Geo is outside zone (when ENFORCE)', async () => {
        // 1. Add Zone (Valid)
        await request(app.getHttpServer())
            .post('/security-settings/geo-zones')
            .set('x-tenant-id', 'test-tenant')
            .send({
                name: 'School',
                centerLat: 40.7128,
                centerLng: -74.0060,
                radiusM: 100,
                enabled: true
            })
            .expect(201);

        // 2. Try Mark Outside
        const outsidePayload = JSON.stringify({ lat: 50.0, lng: 50.0, accuracy: 10, capturedAt: new Date() });
        await request(app.getHttpServer())
            .post('/attendance/learner/mark')
            .set('x-tenant-id', 'test-tenant')
            .set('x-geo-data', outsidePayload)
            .send({ studentId: '123' })
            .expect(403) // Forbidden: GEO_OUTSIDE_ZONE
            .expect((res) => {
                expect(res.body.message).toBe('GEO_OUTSIDE_ZONE');
            });

        // 3. Try Mark Inside
        const insidePayload = JSON.stringify({ lat: 40.7128, lng: -74.0060, accuracy: 10, capturedAt: new Date() });
        await request(app.getHttpServer())
            .post('/attendance/learner/mark')
            .set('x-tenant-id', 'test-tenant')
            .set('x-geo-data', insidePayload)
            .send({ studentId: '123' })
            .expect(201)
            .expect((res) => {
                expect(res.body.status).toBe('success');
            });
    });
});
