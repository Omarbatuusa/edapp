import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Thread } from './thread.entity';
import { Message } from './message.entity';
import { ThreadMember } from './thread-member.entity';
import { MessageReceipt } from './message-receipt.entity';
import { Notification } from './notification.entity';
import { ThreadsService } from './threads.service';
import { MessagesService } from './messages.service';
import { NotificationsService } from './notifications.service';
import { ThreadsController } from './threads.controller';
import { MessagesController } from './messages.controller';
import { NotificationsController } from './notifications.controller';
import { ChatGateway } from './chat.gateway';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Thread,
            Message,
            ThreadMember,
            MessageReceipt,
            Notification
        ]),
    ],
    controllers: [
        ThreadsController,
        MessagesController,
        NotificationsController
    ],
    providers: [
        ThreadsService,
        MessagesService,
        NotificationsService,
        ChatGateway
    ],
    exports: [
        ThreadsService,
        MessagesService,
        NotificationsService,
        TypeOrmModule
    ]
})
export class CommunicationModule { }
