import { Test, TestingModule } from '@nestjs/testing';
import { IpExtractionService } from './ip-extraction.service';

describe('IpExtractionService', () => {
    let service: IpExtractionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [IpExtractionService],
        }).compile();

        service = module.get<IpExtractionService>(IpExtractionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('extractIp', () => {
        it('should return direct IP when not from Cloudflare', () => {
            const req = {
                ip: '192.168.1.1',
                socket: { remoteAddress: '192.168.1.1' },
                headers: {}
            } as any;
            const result = service.extractIp(req);
            expect(result).toEqual({ ip: '192.168.1.1', source: 'direct' });
        });

        it('should return direct IP if remoteAddress is localhost (mocking dev)', () => {
            const req = {
                ip: '127.0.0.1',
                socket: { remoteAddress: '127.0.0.1' },
                headers: { 'cf-connecting-ip': '203.0.113.1' } // Should be ignored if we don't trust localhost as CF
            } as any;
            // In my logic: localhost is NOT CF.
            const result = service.extractIp(req);
            expect(result).toEqual({ ip: '127.0.0.1', source: 'direct' });
        });

        it('should return CF-Connecting-IP if remoteAddress is valid Cloudflare IP', () => {
            const cfIp = '103.21.244.10'; // In 103.21.244.0/22 range
            const realClientIp = '203.0.113.5';
            const req = {
                ip: cfIp,
                socket: { remoteAddress: cfIp },
                headers: { 'cf-connecting-ip': realClientIp }
            } as any;
            const result = service.extractIp(req);
            expect(result).toEqual({ ip: realClientIp, source: 'cloudflare' });
        });

        it('should handle array header for cf-connecting-ip', () => {
            const cfIp = '103.21.244.10';
            const realClientIp = '203.0.113.5';
            const req = {
                ip: cfIp,
                socket: { remoteAddress: cfIp },
                headers: { 'cf-connecting-ip': [realClientIp] }
            } as any;
            const result = service.extractIp(req);
            expect(result).toEqual({ ip: realClientIp, source: 'cloudflare' });
        });
    });

    describe('isIpAllowed', () => {
        it('should return true if allowlist is empty', () => {
            expect(service.isIpAllowed('1.2.3.4', [])).toBe(true);
        });

        it('should return true if IP matches a CIDR', () => {
            expect(service.isIpAllowed('192.168.1.5', ['192.168.1.0/24'])).toBe(true);
        });

        it('should return false if IP does not match CIDR', () => {
            expect(service.isIpAllowed('192.168.2.5', ['192.168.1.0/24'])).toBe(false);
        });

        it('should handle single IP in allowlist (CIDR /32 implicit or explicit)', () => {
            expect(service.isIpAllowed('10.0.0.1', ['10.0.0.1/32'])).toBe(true);
            // My logic expects CIDR format strictly potentially.
            // ipInCidr uses `cidr.split('/')`. If no slash, bits=32.
            expect(service.isIpAllowed('10.0.0.1', ['10.0.0.1'])).toBe(true);
        });
    });
});
