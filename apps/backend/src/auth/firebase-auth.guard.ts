import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { SessionTokenService } from './session-token.service';
import { User } from '../users/user.entity';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private sessionTokenService: SessionTokenService,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }

        const token = authHeader.split(' ')[1];

        // 1. Try session token (custom JWT from handoff auth flow)
        try {
            const payload = this.sessionTokenService.verify(token);
            if (payload.type === 'session') {
                const dbUser = await this.userRepo.findOne({ where: { id: payload.sub } });
                request.user = {
                    uid: payload.sub,
                    dbUserId: payload.sub,
                    role: payload.role,
                    tenant: payload.tenant,
                    customClaims: { role: payload.role },
                };
                return true;
            }
        } catch {
            // Not a valid session token — try Firebase next
        }

        // 2. Try Firebase ID token
        try {
            const decoded = await this.authService.verifyToken(token);

            // Resolve Firebase UID → database user UUID
            let dbUser = await this.userRepo.findOne({
                where: { firebase_uid: decoded.uid },
            });

            // Auto-link: if no user found by firebase_uid, try by email
            if (!dbUser && decoded.email) {
                dbUser = await this.userRepo.findOne({
                    where: { email: decoded.email },
                });
                // Link firebase_uid to existing DB user for future lookups
                if (dbUser && !dbUser.firebase_uid) {
                    await this.userRepo.update(dbUser.id, { firebase_uid: decoded.uid });
                }
            }

            // Attach resolved user: uid = DB UUID (for thread operations)
            request.user = {
                ...decoded,
                uid: dbUser?.id || decoded.uid,
                firebaseUid: decoded.uid,
                dbUserId: dbUser?.id || null,
            };

            return true;
        } catch (err) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
