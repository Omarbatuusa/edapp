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
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Campus Safety Hub</h1>
                <p className="text-muted-foreground">Emergency broadcast system and incident logging.</p>
            </div>

            {status.active ? (
                <div className="surface-card p-8 border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20 mb-8 animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-full animate-pulse">
                            <ShieldAlert size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">
                                {status.type} PROTOCOL ACTIVE
                            </h2>
                            <p className="font-medium text-red-800 dark:text-red-300">
                                {status.message}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={clearEmergency}
                            className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-black/80 transition-colors shadow-lg"
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
                <div className="surface-card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Bell size={20} />
                        Recent Alerts
                    </h3>
                    <div className="space-y-4">
                        <AlertLogItem type="Fire Drill" time="2 weeks ago" user="Admin" />
                        <AlertLogItem type="Lockdown Test" time="1 month ago" user="Principal Skinner" />
                    </div>
                </div>

                <div className="surface-card p-6 bg-secondary/10 border-dashed border-2 border-border/50 flex items-center justify-center">
                    <p className="text-muted-foreground font-medium">Incident Reporting Graph (Coming Soon)</p>
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
                h-40 rounded-2xl flex flex-col items-center justify-center gap-4 text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-95
                ${confirming ? 'bg-black animate-pulse' : color}
            `}
        >
            <Icon size={48} />
            <span className="font-black tracking-widest text-xl">
                {confirming ? 'CONFIRM?' : label}
            </span>
        </button>
    )
}

function AlertLogItem({ type, time, user }: any) {
    return (
        <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
            <div>
                <p className="font-medium text-sm">{type}</p>
                <p className="text-xs text-muted-foreground">Triggered by {user}</p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">{time}</span>
        </div>
    )
}
