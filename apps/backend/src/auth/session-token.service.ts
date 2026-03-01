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
        this.secret = this.configService.get<string>('SESSION_JWT_SECRET') || 'edapp-session-secret-change-in-production';
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
