import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityModule } from '../security/security.module';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

// Entities
import { Attendance } from './attendance.entity';
import { AttendanceEvent } from './entities/attendance-event.entity';
import { AttendanceDailySummary } from './entities/attendance-daily-summary.entity';
import { AttendanceWeeklySummary } from './entities/attendance-weekly-summary.entity';
import { AttendancePolicy } from './entities/attendance-policy.entity';
import { KioskDevice } from './entities/kiosk-device.entity';
import { EarlyLeaveRequest } from './entities/early-leave-request.entity';
import { ClassRegister } from './entities/class-register.entity';
import { SchoolClass } from './entities/class.entity';
import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';
import { RoleAssignment } from '../users/role-assignment.entity';
import { Branch } from '../branches/branch.entity';
import { Notification } from '../communication/notification.entity';

// Services
import { AttendanceEventService } from './services/attendance-event.service';
import { QrTokenService } from './services/qr-token.service';
import { KioskDeviceService } from './services/kiosk-device.service';
import { SyncService } from './services/sync.service';
import { StaffAttendanceService } from './services/staff-attendance.service';
import { LearnerAttendanceService } from './services/learner-attendance.service';
import { EarlyLeaveService } from './services/early-leave.service';
import { ClassRegisterService } from './services/class-register.service';
import { ClassService } from './services/class.service';
import { AttendanceRollupService } from './services/attendance-rollup.service';
import { AttendanceAlertService } from './services/attendance-alert.service';
import { AttendanceAuditService } from './services/attendance-audit.service';
import { ReportService } from './reports/report.service';
import { ExportService } from './reports/export.service';

// Controllers
import { AttendanceController } from './attendance.controller';
import { KioskController } from './controllers/kiosk.controller';
import { SyncController } from './controllers/sync.controller';
import { EarlyLeaveController } from './controllers/early-leave.controller';
import { ClassRegisterController } from './controllers/class-register.controller';
import { ClassController } from './controllers/class.controller';
import { ExceptionsController } from './controllers/exceptions.controller';
import { OverrideController } from './controllers/override.controller';
import { ReportController } from './controllers/report.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Attendance,
            AttendanceEvent,
            AttendanceDailySummary,
            AttendanceWeeklySummary,
            AttendancePolicy,
            KioskDevice,
            EarlyLeaveRequest,
            ClassRegister,
            SchoolClass,
            Tenant,
            User,
            RoleAssignment,
            Branch,
            Notification,
        ]),
        SecurityModule,
        AuditModule,
        NotificationsModule,
    ],
    controllers: [
        AttendanceController,
        KioskController,
        SyncController,
        EarlyLeaveController,
        ClassRegisterController,
        ClassController,
        ExceptionsController,
        OverrideController,
        ReportController,
    ],
    providers: [
        AttendanceEventService,
        QrTokenService,
        KioskDeviceService,
        SyncService,
        StaffAttendanceService,
        LearnerAttendanceService,
        EarlyLeaveService,
        ClassRegisterService,
        ClassService,
        AttendanceRollupService,
        AttendanceAlertService,
        AttendanceAuditService,
        ReportService,
        ExportService,
    ],
    exports: [
        AttendanceEventService,
        QrTokenService,
        StaffAttendanceService,
        LearnerAttendanceService,
    ],
})
export class AttendanceModule {}
