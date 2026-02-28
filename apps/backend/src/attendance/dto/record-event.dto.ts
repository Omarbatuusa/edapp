import { SubjectType, AttendanceEventType, AttendanceSourceType } from '../entities/attendance-event.entity';

export class RecordEventDto {
    tenant_id: string;
    branch_id: string;
    subject_type: SubjectType;
    subject_user_id: string;
    event_type: AttendanceEventType;
    source: AttendanceSourceType;
    class_id?: string;
    captured_at_device: string; // ISO timestamp
    device_id?: string;
    actor_user_id?: string;
    captured_lat?: number;
    captured_lng?: number;
    captured_accuracy_m?: number;
    client_ip?: string;
    override_reason?: string;
    is_offline_synced?: boolean;
    idempotency_key: string;
    metadata?: Record<string, any>;
}

export class KioskScanDto {
    qr_token: string;
    branch_id: string;
    device_id: string;
    captured_at_device: string; // ISO timestamp
    idempotency_key: string;
}

export class StaffCheckinDto {
    branch_id: string;
    captured_at_device?: string;
    device_id?: string;
    geo?: {
        lat: number;
        lng: number;
        accuracy: number;
        timestamp?: number;
    };
    idempotency_key: string;
}

export class SyncPushDto {
    events: RecordEventDto[];
}

export class SyncAckDto {
    event_ids: string[];
}

export class RegisterDeviceDto {
    branch_id: string;
    device_code: string;
    device_name: string;
    location_label?: string;
    scan_point_type?: string;
}
