import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

import * as path from 'path';

@Injectable()
export class AuthService implements OnModuleInit {
    constructor(private configService: ConfigService) { }

    onModuleInit() {
        // Check if already initialized to avoid hot-reload errors
        if (admin.apps.length === 0) {
            const serviceAccountPath = path.resolve(process.cwd(), 'firebase-service-account.json');
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase Admin Initialized from:', serviceAccountPath);
        }
    }

    async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
        try {
            return await admin.auth().verifyIdToken(token);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}
