'use client';

import { useState, useRef } from 'react';
import { FieldWrapper } from './FieldWrapper';

interface EmailInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    draftId: string;
    onVerified?: (email: string) => void;
    required?: boolean;
    placeholder?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type OtpPhase = 'idle' | 'prompt' | 'sending' | 'awaiting' | 'verified';

export function EmailInput({
    label,
    value,
    onChange,
    draftId,
    onVerified,
    required,
    placeholder = 'school@example.com',
}: EmailInputProps) {
    const [phase, setPhase] = useState<OtpPhase>('idle');
    const [otp, setOtp] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [error, setError] = useState('');
    const [fieldState, setFieldState] = useState<'idle' | 'success' | 'error'>('idle');
    const cooldownRef = useRef<NodeJS.Timeout | null>(null);

    const isValidEmail = EMAIL_REGEX.test(value);

    const handleChange = (v: string) => {
        onChange(v);
        setFieldState('idle');
        if (phase === 'verified') setPhase('idle');
    };

    const handleBlur = () => {
        if (!value && required) {
            setFieldState('error');
            return;
        }
        if (value && !isValidEmail) {
            setFieldState('error');
            return;
        }
        if (isValidEmail && phase === 'idle') {
            setPhase('prompt');
            setFieldState('idle');
        }
    };

    const startCooldown = () => {
        setCooldown(30);
        const tick = () => {
            setCooldown(prev => {
                if (prev <= 1) return 0;
                cooldownRef.current = setTimeout(tick, 1000);
                return prev - 1;
            });
        };
        cooldownRef.current = setTimeout(tick, 1000);
    };

    const sendCode = async () => {
        setPhase('sending');
        setError('');
        try {
            const res = await fetch('/v1/admin/email-verify/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: value, draft_id: draftId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send');
            setPhase('awaiting');
            startCooldown();
        } catch (err: any) {
            setError(err.message || 'Failed to send verification code');
            setPhase('prompt');
        }
    };

    const verifyCode = async () => {
        setError('');
        try {
            const res = await fetch('/v1/admin/email-verify/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: value, otp, draft_id: draftId }),
            });
            const data = await res.json();
            if (data.verified) {
                setPhase('verified');
                setFieldState('success');
                setOtp('');
                onVerified?.(value);
            } else {
                setError('Incorrect code. Please try again.');
            }
        } catch {
            setError('Verification failed. Please try again.');
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <FieldWrapper
                label={label}
                required={required}
                state={phase === 'verified' ? 'success' : fieldState}
                error={fieldState === 'error' && !value ? 'Email is required' : fieldState === 'error' ? 'Invalid email address' : ''}
            >
                <div className="flex items-center">
                    <input
                        type="email"
                        value={value}
                        onChange={e => handleChange(e.target.value)}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        className="flex-1 px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                    />
                    {phase === 'verified' && (
                        <div className="flex items-center gap-1 pr-3 text-green-600 text-xs font-medium">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            Verified
                        </div>
                    )}
                </div>
            </FieldWrapper>

            {/* OTP prompt card */}
            {phase === 'prompt' && isValidEmail && (
                <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">mark_email_unread</span>
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Verify this email <span className="font-normal text-blue-500">(recommended)</span></p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={sendCode}
                            className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Send code
                        </button>
                        <button
                            type="button"
                            onClick={() => setPhase('idle')}
                            className="text-xs px-3 py-1.5 text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            Skip
                        </button>
                    </div>
                </div>
            )}

            {phase === 'sending' && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                    <span className="text-sm text-slate-500">Sending verification code...</span>
                </div>
            )}

            {phase === 'awaiting' && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex flex-col gap-3">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Enter the 6-digit code sent to <strong>{value}</strong>
                    </p>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            className="w-36 px-3 py-2 text-center text-lg font-mono tracking-widest border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none focus:border-blue-500 transition-colors"
                        />
                        <button
                            type="button"
                            onClick={verifyCode}
                            disabled={otp.length < 6}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Verify
                        </button>
                        <button
                            type="button"
                            onClick={sendCode}
                            disabled={cooldown > 0}
                            className="text-xs text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed transition-colors"
                        >
                            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
                        </button>
                    </div>
                    {error && (
                        <p className="text-xs text-red-500">{error}</p>
                    )}
                </div>
            )}
        </div>
    );
}
