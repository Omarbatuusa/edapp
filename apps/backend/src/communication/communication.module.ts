import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

// Entities
import { Thread } from './thread.entity';
import { Message } from './message.entity';
import { ThreadMember } from './thread-member.entity';
import { MessageReceipt } from './message-receipt.entity';
import { Notification } from './notification.entity';
import { ParentChildLink } from './parent-child-link.entity';
import { AnnouncementRead } from './announcement-read.entity';
import { AnnouncementReaction } from './announcement-reaction.entity';
import { TicketAction } from './ticket-action.entity';
import { MessageReport } from './message-report.entity';

// Services
import { ThreadsService } from './threads.service';
import { MessagesService } from './messages.service';
import { NotificationsService } from './notifications.service';
import { AnnouncementsService } from './announcements.service';
import { TicketActionsService } from './ticket-actions.service';
import { MessageReportsService } from './message-reports.service';
import { ParentChildService } from './parent-child.service';

// Controllers
import { ThreadsController } from './threads.controller';
import { MessagesController } from './messages.controller';
import { NotificationsController } from './notifications.controller';
import { AnnouncementsController } from './announcements.controller';
import { TicketActionsController } from './ticket-actions.controller';
import { MessageReportsController } from './message-reports.controller';
import { ParentChildController } from './parent-child.controller';

// Gateways
import { ChatGateway } from './chat.gateway';
import { CallsGateway } from './calls.gateway';

// Processors
import { SlaProcessor } from './sla.processor';

@Module({
    imports: [
        BullModule.registerQueue({ name: 'sla-monitor' }),
        TypeOrmModule.forFeature([
            Thread,
            Message,
            ThreadMember,
            MessageReceipt,
            Notification,
            ParentChildLink,
            AnnouncementRead,
            AnnouncementReaction,
            TicketAction,
            MessageReport,
        ]),
    ],
    controllers: [
        ThreadsController,
        MessagesController,
        NotificationsController,
        AnnouncementsController,
        TicketActionsController,
        MessageReportsController,
        ParentChildController,
    ],
    providers: [
        ThreadsService,
        MessagesService,
        NotificationsService,
        AnnouncementsService,
        TicketActionsService,
        MessageReportsService,
        ParentChildService,
        ChatGateway,
        CallsGateway,
        SlaProcessor,
    ],
    exports: [
        ThreadsService,
        MessagesService,
        NotificationsService,
        AnnouncementsService,
        TicketActionsService,
        ParentChildService,
        TypeOrmModule,
    ],
})
export class CommunicationModule { }
