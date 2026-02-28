import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KioskDevice, ScanPointType } from '../entities/kiosk-device.entity';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class KioskDeviceService {
    constructor(
        @InjectRepository(KioskDevice)
        private deviceRepo: Repository<KioskDevice>,
        private auditService: AuditService,
    ) {}

    async registerDevice(
        tenant_id: string,
        dto: {
            branch_id: string;
            device_code: string;
            device_name: string;
            location_label?: string;
            scan_point_type?: string;
            registered_by_user_id?: string;
        },
    ): Promise<KioskDevice> {
        const existing = await this.deviceRepo.findOne({
            where: { tenant_id, device_code: dto.device_code },
        });

        if (existing) {
            // Update existing device
            existing.device_name = dto.device_name;
            existing.location_label = dto.location_label || existing.location_label;
            existing.scan_point_type = (dto.scan_point_type as ScanPointType) || existing.scan_point_type;
            existing.is_active = true;
            existing.last_heartbeat_at = new Date();
            return this.deviceRepo.save(existing);
        }

        const device = this.deviceRepo.create({
            tenant_id,
            branch_id: dto.branch_id,
            device_code: dto.device_code,
            device_name: dto.device_name,
            location_label: dto.location_label,
            scan_point_type: (dto.scan_point_type as ScanPointType) || ScanPointType.GATE,
            registered_by_user_id: dto.registered_by_user_id,
            is_active: true,
            last_heartbeat_at: new Date(),
        });

        const saved = await this.deviceRepo.save(device);

        await this.auditService.log({
            action: 'kiosk_device_registered',
            tenantId: tenant_id,
            userId: dto.registered_by_user_id,
            metadata: { device_id: saved.id, device_code: dto.device_code },
        });

        return saved;
    }

    async heartbeat(tenant_id: string, device_id: string): Promise<void> {
        await this.deviceRepo.update(
            { id: device_id, tenant_id },
            { last_heartbeat_at: new Date() },
        );
    }

    async listDevices(tenant_id: string, branch_id?: string): Promise<KioskDevice[]> {
        const where: any = { tenant_id };
        if (branch_id) where.branch_id = branch_id;
        return this.deviceRepo.find({ where, order: { created_at: 'DESC' } });
    }

    async deactivateDevice(tenant_id: string, device_id: string, actor_user_id?: string): Promise<void> {
        const result = await this.deviceRepo.update(
            { id: device_id, tenant_id },
            { is_active: false },
        );

        if (result.affected === 0) {
            throw new NotFoundException('Device not found');
        }

        await this.auditService.log({
            action: 'kiosk_device_deactivated',
            tenantId: tenant_id,
            userId: actor_user_id,
            metadata: { device_id },
        });
    }

    async getDevice(tenant_id: string, device_id: string): Promise<KioskDevice | null> {
        return this.deviceRepo.findOne({
            where: { id: device_id, tenant_id, is_active: true },
        });
    }
}
