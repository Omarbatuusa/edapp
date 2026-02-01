'use client';

import { useEmergency } from '@/contexts/EmergencyContext';
import { AlertTriangle, Info, XCircle } from 'lucide-react';

export function EmergencyBanner() {
    const { status, clearEmergency } = useEmergency();

    if (!status.active) return null;

    const styles: Record<string, string> = {
        low: 'bg-yellow-500 text-black',
        medium: 'bg-orange-600 text-white',
        high: 'bg-red-600 text-white animate-pulse',
        none: 'hidden'
    };

    return (
        <div className={`fixed inset-x-0 top-0 z-[100] px-4 py-3 shadow-lg flex items-center justify-between ${styles[status.level]}`}>
            <div className="flex items-center gap-3">
                <AlertTriangle size={24} className="animate-bounce" />
                <div>
                    <strong className="uppercase font-black tracking-widest text-lg md:text-xl">
                        {status.type} ALERT
                    </strong>
                    <span className="hidden md:inline mx-2">|</span>
                    <span className="font-medium">{status.message}</span>
                </div>
            </div>

            {/* Admin only button in real app */}
            <button
                onClick={clearEmergency}
                className="bg-black/20 hover:bg-black/30 text-current px-3 py-1 rounded text-sm font-semibold transition-colors"
            >
                Dismiss Test
            </button>
        </div>
    );
}
