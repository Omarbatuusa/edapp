'use client';

import { useEmergency } from '@/contexts/EmergencyContext';
import { ShieldAlert, Flame, Ambulance, Lock, Bell } from 'lucide-react';
import { useState } from 'react';

export default function SafetyHub() {
    const { triggerEmergency, status, clearEmergency } = useEmergency();
    const [confirming, setConfirming] = useState<string | null>(null);

    const handleTrigger = (type: string, level: any, message: string) => {
        if (confirming === type) {
            triggerEmergency(type as any, level, message);
            setConfirming(null);
        } else {
            setConfirming(type);
            // Auto reset confirmation after 3s
            setTimeout(() => setConfirming(null), 3000);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--admin-text-main))] mb-1">Campus Safety Hub</h1>
                <p className="text-[15px] font-medium text-[hsl(var(--admin-text-sub))]">Emergency broadcast system and incident logging.</p>
            </div>

            {status.active ? (
                <div className="ios-card overflow-hidden p-8 border-l-4 border-l-[hsl(var(--admin-danger))] bg-[hsl(var(--admin-danger))/0.05] dark:bg-[hsl(var(--admin-danger))/0.1] mb-8 animate-in slide-in-from-top-4 backdrop-blur-md">
                    <div className="flex items-center gap-5 mb-6">
                        <div className="p-4 bg-[hsl(var(--admin-danger))/0.15] text-[hsl(var(--admin-danger))] rounded-[20px] animate-pulse">
                            <ShieldAlert size={40} />
                        </div>
                        <div>
                            <h2 className="text-[26px] font-black text-[hsl(var(--admin-danger))] uppercase tracking-wider leading-tight">
                                {status.type} PROTOCOL ACTIVE
                            </h2>
                            <p className="text-[16px] font-semibold text-[hsl(var(--admin-danger))]/80 dark:text-[hsl(var(--admin-danger))]/70 mt-1">
                                {status.message}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={clearEmergency}
                            className="bg-[hsl(var(--admin-text-main))] text-[hsl(var(--admin-surface))] px-8 py-4 rounded-[16px] font-bold tracking-widest uppercase hover:bg-[hsl(var(--admin-text-main))/0.8] active:scale-95 transition-all shadow-xl hover:shadow-2xl"
                        >
                            DE-ESCALATE / CLEAR ALL CLEAR
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <PanicButton
                        icon={Lock}
                        label="LOCKDOWN"
                        color="bg-red-600 hover:bg-red-700"
                        confirming={confirming === 'lockdown'}
                        onClick={() => handleTrigger('lockdown', 'high', 'LOCKDOWN IN EFFECT. SECURE ALL DOORS IMMEDIATELY.')}
                    />
                    <PanicButton
                        icon={Flame}
                        label="FIRE ALARM"
                        color="bg-orange-500 hover:bg-orange-600"
                        confirming={confirming === 'fire'}
                        onClick={() => handleTrigger('fire', 'medium', 'FIRE DRILL IN PROGRESS. EVACUATE TO ASSEMBLY POINTS.')}
                    />
                    <PanicButton
                        icon={Ambulance}
                        label="MEDICAL"
                        color="bg-blue-600 hover:bg-blue-700"
                        confirming={confirming === 'medical'}
                        onClick={() => handleTrigger('medical', 'low', 'MEDICAL EMERGENCY REPORTED. FIRST AID REQUIRED.')}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="ios-card overflow-hidden">
                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-[17px] tracking-tight text-[hsl(var(--admin-text-main))]">
                        <Bell size={20} className="text-[hsl(var(--admin-primary))]" />
                        Recent Alerts
                    </h3>
                    <div className="space-y-3">
                        <AlertLogItem type="Fire Drill" time="2 weeks ago" user="Admin" />
                        <AlertLogItem type="Lockdown Test" time="1 month ago" user="Principal Skinner" />
                    </div>
                </div>

                <div className="ios-card bg-[hsl(var(--admin-surface-alt))/0.3] border-dashed border-2 border-[hsl(var(--admin-border))] flex items-center justify-center min-h-[250px] overflow-hidden">
                    <p className="text-[15px] text-[hsl(var(--admin-text-muted))] font-medium">Incident Reporting Graph (Coming Soon)</p>
                </div>
            </div>
        </div>
    );
}

function PanicButton({ icon: Icon, label, color, onClick, confirming }: any) {
    return (
        <button
            onClick={onClick}
            className={`
                h-44 rounded-[24px] flex flex-col items-center justify-center gap-5 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.03] active:scale-95 border border-white/10
                ${confirming ? 'bg-[hsl(var(--admin-text-main))] animate-pulse' : color}
            `}
        >
            <Icon size={56} className="drop-shadow-md" />
            <span className="font-black tracking-widest text-[22px] drop-shadow-md">
                {confirming ? 'CONFIRM?' : label}
            </span>
        </button>
    )
}

function AlertLogItem({ type, time, user }: any) {
    return (
        <div className="flex justify-between items-center p-4 bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded-[16px] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors">
            <div>
                <p className="font-semibold text-[15px] text-[hsl(var(--admin-text-main))] tracking-tight">{type}</p>
                <p className="text-[13px] font-medium text-[hsl(var(--admin-text-sub))] mt-0.5">Triggered by {user}</p>
            </div>
            <span className="text-[13px] font-bold text-[hsl(var(--admin-text-muted))] bg-[hsl(var(--admin-surface-alt))] px-3 py-1.5 rounded-full">{time}</span>
        </div>
    )
}
