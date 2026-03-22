import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export interface SessionTokenPayload {
    sub: string;       // user ID
    role: string;      // user role
    tenant?: string;   // tenant slug
    type: 'session';   // token type
}

@Injectable()
export class SessionTokenService {
    private readonly secret: string;
    private readonly defaultExpiresIn: string;

    constructor(private configService: ConfigService) {
        const secret = this.configService.get<string>('SESSION_JWT_SECRET');
        if (!secret) {
            const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
            if (isProduction) {
                // Hard fail — running with a hardcoded secret in production means any
                // holder of the public repo can forge valid admin session tokens.
                throw new Error(
                    'SESSION_JWT_SECRET must be set in production. ' +
                    'Set it in .env.production and restart the application.',
                );
            }
            console.warn('[SessionToken] SESSION_JWT_SECRET not set — using dev-only default.');
        }
        this.secret = secret || 'edapp-dev-only-secret-not-for-production';
        this.defaultExpiresIn = '24h';
    }

    sign(payload: Omit<SessionTokenPayload, 'type'>, expiresIn?: string): string {
        return jwt.sign(
            { ...payload, type: 'session' },
            this.secret,
            { expiresIn: (expiresIn || this.defaultExpiresIn) as any },
        );
    }

    verify(token: string): SessionTokenPayload {
        return jwt.verify(token, this.secret) as SessionTokenPayload;
    }
}
