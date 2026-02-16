import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { SecurityModule } from '../security/security.module';

@Module({
    imports: [SecurityModule],
    controllers: [AttendanceController],
})
export class AttendanceModule { }
