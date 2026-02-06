import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceToken } from './device-token.entity';
import { PushService } from './push.service';
import { PushController } from './push.controller';

// ============================================================
// NOTIFICATIONS MODULE - Push notifications via FCM
// ============================================================

@Module({
    imports: [
        TypeOrmModule.forFeature([DeviceToken]),
    ],
    controllers: [PushController],
    providers: [PushService],
    exports: [PushService],
})
export class NotificationsModule { }
