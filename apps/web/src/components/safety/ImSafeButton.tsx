'use client';

import React, { useState } from 'react';

// ============================================================
// I'M SAFE BUTTON — Emergency acknowledgement component
// iOS-premium admin design tokens, material-symbols-outlined icons
// ============================================================

interface ImSafeButtonProps {
    tenantSlug: string;
    tenantId: string;
    emergencyId: string;
}

// --------------- Helpers ---------------

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

function Icon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
    return <span className={`material-symbols-outlined ${className || ''}`} style={style}>{name}</span>;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function ImSafeButton({ tenantSlug, tenantId, emergencyId }: ImSafeButtonProps) {
    const [state, setState] = useState<'idle' | 'submitting' | 'confirmed'>('idle');
    const [confirmedAt, setConfirmedAt] = useState<string>('');
    const [confirmedStatus, setConfirmedStatus] = useState<'SAFE' | 'NEED_HELP'>('SAFE');

    const submit = async (status: 'SAFE' | 'NEED_HELP') => {
        setState('submitting');
        try {
            const res = await fetch(`/v1/admin/tenants/${tenantId}/emergencies/${emergencyId}/acknowledgements`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status }),
            });

            if (!res.ok) throw new Error('Failed');

            setConfirmedStatus(status);
            setConfirmedAt(new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }));
            setState('confirmed');
        } catch {
            setState('idle');
        }
    };

    // --------------- Submitting state ---------------

    if (state === 'submitting') {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div
                    className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mb-4"
                    style={{ borderColor: 'hsl(var(--admin-primary))', borderTopColor: 'transparent' }}
                />
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--admin-text-muted))' }}>Sending your response...</p>
            </div>
        );
    }

    // --------------- Confirmed state ---------------

    if (state === 'confirmed') {
        const isSafe = confirmedStatus === 'SAFE';
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isSafe ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}
                >
                    <Icon
                        name={isSafe ? 'check_circle' : 'front_hand'}
                        className={isSafe ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}
                        style={{ fontSize: 48 }}
                    />
                </div>
                <h2 className="text-xl font-bold mb-1" style={{ color: 'hsl(var(--admin-text-main))' }}>
                    {isSafe ? 'Received' : 'Help Requested'}
                </h2>
                <p className="text-sm mb-1" style={{ color: 'hsl(var(--admin-text-muted))' }}>
                    Response recorded at {confirmedAt}
                </p>
                <p className="text-sm" style={{ color: 'hsl(var(--admin-text-muted))' }}>
                    Your school has been notified.
                </p>
            </div>
        );
    }

    // --------------- Idle state ---------------

    return (
        <div className="space-y-3">
            {/* Big green I'm Safe button */}
            <button
                onClick={() => submit('SAFE')}
                className="w-full py-6 rounded-2xl text-xl font-bold text-white transition-all active:scale-[0.98] bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
            >
                <span className="flex items-center justify-center gap-3">
                    <Icon name="verified_user" style={{ fontSize: 28 }} />
                    I&apos;m Safe
                </span>
            </button>

            {/* Smaller orange I Need Help button */}
            <button
                onClick={() => submit('NEED_HELP')}
                className="w-full py-3.5 rounded-2xl text-base font-semibold transition-all active:scale-[0.98] border-2 border-orange-400 dark:border-orange-600 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30"
            >
                <span className="flex items-center justify-center gap-2">
                    <Icon name="front_hand" style={{ fontSize: 22 }} />
                    I Need Help
                </span>
            </button>
        </div>
    );
}
