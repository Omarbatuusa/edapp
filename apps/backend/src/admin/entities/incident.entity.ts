import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum IncidentCategory {
    BULLYING = 'BULLYING',
    SAFETY_CONCERN = 'SAFETY_CONCERN',
    MEDICAL_HEALTH = 'MEDICAL_HEALTH',
    BEHAVIOUR = 'BEHAVIOUR',
    DIGITAL_SAFETY = 'DIGITAL_SAFETY',
    CHILD_PROTECTION = 'CHILD_PROTECTION',
}

export enum IncidentSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export enum IncidentConfidentiality {
    STANDARD = 'STANDARD',
    RESTRICTED = 'RESTRICTED',
    ANONYMOUS_TO_PEERS = 'ANONYMOUS_TO_PEERS',
}

export enum IncidentStatus {
    SUBMITTED = 'SUBMITTED',
    ACKNOWLEDGED = 'ACKNOWLEDGED',
    ASSIGNED = 'ASSIGNED',
    INVESTIGATING = 'INVESTIGATING',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
    ESCALATED = 'ESCALATED',
}

export enum IncidentReporterType {
    PARENT = 'PARENT',
    LEARNER = 'LEARNER',
    STAFF = 'STAFF',
    ANONYMOUS = 'ANONYMOUS',
}

export enum IncidentLocation {
    CLASSROOM = 'CLASSROOM',
    BATHROOM = 'BATHROOM',
    CORRIDOR = 'CORRIDOR',
    GATE = 'GATE',
    BUS = 'BUS',
    ONLINE = 'ONLINE',
    PLAYGROUND = 'PLAYGROUND',
    SPORTS_FIELD = 'SPORTS_FIELD',
    OTHER = 'OTHER',
}

export enum BullyingType {
    VERBAL = 'VERBAL',
    PHYSICAL = 'PHYSICAL',
    SOCIAL_EXCLUSION = 'SOCIAL_EXCLUSION',
    CYBERBULLYING = 'CYBERBULLYING',
    HARASSMENT = 'HARASSMENT',
    EXTORTION = 'EXTORTION',
    OTHER = 'OTHER',
}

export enum IncidentOutcome {
    UNSUBSTANTIATED = 'UNSUBSTANTIATED',
    RESOLVED_RESTORATIVE = 'RESOLVED_RESTORATIVE',
    DISCIPLINARY_ACTION = 'DISCIPLINARY_ACTION',
    REFERRED_EXTERNAL = 'REFERRED_EXTERNAL',
}

@Entity('incidents')
@Index(['tenant_id', 'status'])
@Index(['tenant_id', 'category'])
export class Incident {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid', nullable: true })
    branch_id: string;

    @Column({ nullable: true })
    case_id: string;

    @Column({ type: 'enum', enum: IncidentCategory, default: IncidentCategory.SAFETY_CONCERN })
    category: IncidentCategory;

    @Column({ type: 'enum', enum: IncidentSeverity, default: IncidentSeverity.MEDIUM })
    severity: IncidentSeverity;

    @Column({ type: 'enum', enum: IncidentConfidentiality, default: IncidentConfidentiality.STANDARD })
    confidentiality: IncidentConfidentiality;

    @Column({ type: 'enum', enum: IncidentStatus, default: IncidentStatus.SUBMITTED })
    status: IncidentStatus;

    @Column({ type: 'uuid', nullable: true })
    reporter_id: string;

    @Column({ type: 'enum', enum: IncidentReporterType, default: IncidentReporterType.STAFF })
    reporter_type: IncidentReporterType;

    @Column({ type: 'jsonb', nullable: true, default: '[]' })
    involved_learner_ids: string[];

    @Column({ type: 'text', nullable: true })
    other_people_involved: string;

    @Column({ type: 'enum', enum: IncidentLocation, default: IncidentLocation.OTHER })
    location: IncidentLocation;

    @Column({ type: 'timestamp', nullable: true })
    incident_time: Date;

    @Column({ nullable: true })
    time_context: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ default: false })
    is_ongoing: boolean;

    @Column({ default: false })
    has_threat_of_harm: boolean;

    @Column({ default: false })
    has_evidence: boolean;

    @Column({ type: 'jsonb', nullable: true, default: '[]' })
    evidence_attachments: Record<string, any>[];

    @Column({ type: 'enum', enum: BullyingType, nullable: true })
    bullying_type: BullyingType;

    @Column({ type: 'jsonb', nullable: true })
    bullying_pattern: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    content_reference: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true, default: '[]' })
    assigned_staff_ids: string[];

    @Column({ type: 'enum', enum: IncidentOutcome, nullable: true })
    outcome: IncidentOutcome;

    @Column({ type: 'timestamp', nullable: true })
    sla_acknowledged_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    sla_deadline: Date;

    @Column({ type: 'jsonb', nullable: true, default: '[]' })
    investigation_notes: Record<string, any>[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
