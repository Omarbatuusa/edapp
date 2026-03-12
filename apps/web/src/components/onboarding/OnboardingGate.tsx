'use client';

import { useState, useEffect } from 'react';

interface OnboardingGateProps {
  children: React.ReactNode;
  tenantId: string | null;
  slug: string;
}

interface OnboardingStatus {
  emailVerified: boolean;
  mustChangePassword: boolean;
  policiesAccepted: boolean;
  email: string;
  displayName: string;
  complete: boolean;
}

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{}|;:',.<>?\/\\`~""]/.test(p) },
];

export function OnboardingGate({ children, tenantId, slug }: OnboardingGateProps) {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<'verify-email' | 'set-password' | 'accept-policies' | 'complete'>('complete');

  useEffect(() => {
    checkStatus();
  }, [tenantId]);

  async function checkStatus() {
    const token = localStorage.getItem('session_token');
    if (!token) { setLoading(false); return; }
    try {
      const params = tenantId ? `?tenantId=${tenantId}` : '';
      const res = await fetch(`/v1/auth/onboarding/status${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.complete) {
          setCurrentStep('complete');
        } else if (!data.emailVerified) {
          setCurrentStep('verify-email');
        } else if (data.mustChangePassword) {
          setCurrentStep('set-password');
        } else if (!data.policiesAccepted) {
          setCurrentStep('accept-policies');
        } else {
          setCurrentStep('complete');
        }
      }
    } catch {}
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-[hsl(var(--admin-background))]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[hsl(var(--admin-primary)/0.3)] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin" />
          <p className="text-sm text-[hsl(var(--admin-text-muted))] animate-pulse">Checking account setup...</p>
        </div>
      </div>
    );
  }

  if (!status || currentStep === 'complete') {
    return <>{children}</>;
  }

  const stepNumber = currentStep === 'verify-email' ? 1 : currentStep === 'set-password' ? 2 : 3;
  const totalSteps = (!status.emailVerified ? 1 : 0) + (status.mustChangePassword ? 1 : 0) + (!status.policiesAccepted ? 1 : 0);

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-[hsl(var(--admin-background))] p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--admin-primary)/0.12)] flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[28px] text-[hsl(var(--admin-primary))]">
              {currentStep === 'verify-email' ? 'mark_email_read' : currentStep === 'set-password' ? 'lock_reset' : 'policy'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-[hsl(var(--admin-text-main))] tracking-tight">
            {currentStep === 'verify-email' ? 'Verify Your Email' : currentStep === 'set-password' ? 'Set Your Password' : 'Accept Policies'}
          </h1>
          <p className="text-[13px] text-[hsl(var(--admin-text-muted))] mt-1">
            {currentStep === 'verify-email'
              ? `We'll send a code to ${status.email}`
              : currentStep === 'set-password'
              ? 'Create a strong password for your account'
              : 'Review and accept the required policies to continue'}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i < stepNumber ? 'w-8 bg-[hsl(var(--admin-primary))]' : 'w-4 bg-[hsl(var(--admin-primary)/0.2)]'}`} />
            ))}
          </div>
        </div>

        {currentStep === 'verify-email' && (
          <EmailVerificationStep
            email={status.email}
            onComplete={() => {
              setStatus({ ...status, emailVerified: true });
              if (status.mustChangePassword) setCurrentStep('set-password');
              else if (!status.policiesAccepted) setCurrentStep('accept-policies');
              else setCurrentStep('complete');
            }}
          />
        )}

        {currentStep === 'set-password' && (
          <PasswordSetupStep
            isFirstLogin={status.mustChangePassword}
            onComplete={() => {
              setStatus({ ...status, mustChangePassword: false });
              if (!status.policiesAccepted) setCurrentStep('accept-policies');
              else setCurrentStep('complete');
            }}
          />
        )}

        {currentStep === 'accept-policies' && (
          <PolicyAcceptanceStep
            tenantId={tenantId}
            slug={slug}
            onComplete={() => {
              setStatus({ ...status, policiesAccepted: true });
              setCurrentStep('complete');
            }}
          />
        )}
      </div>
    </div>
  );
}

function EmailVerificationStep({ email, onComplete }: { email: string; onComplete: () => void }) {
  const [otpKey, setOtpKey] = useState('');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  async function sendCode() {
    setSending(true);
    setError('');
    const token = localStorage.getItem('session_token');
    const res = await fetch('/v1/auth/onboarding/send-verification', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token || ''}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.alreadyVerified) { onComplete(); return; }
      setOtpKey(data.otpKey);
      setSent(true);
      setCountdown(60);
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.message || 'Failed to send code');
    }
    setSending(false);
  }

  async function verify() {
    setVerifying(true);
    setError('');
    const token = localStorage.getItem('session_token');
    const res = await fetch('/v1/auth/onboarding/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
      body: JSON.stringify({ otpKey, code }),
    });
    if (res.ok) {
      onComplete();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.message || 'Invalid code');
    }
    setVerifying(false);
  }

  return (
    <div className="ios-card p-5 space-y-4">
      {!sent ? (
        <>
          <p className="text-[14px] text-[hsl(var(--admin-text-sub))]">
            A 6-digit verification code will be sent to <strong className="text-[hsl(var(--admin-text-main))]">{email}</strong>
          </p>
          <button type="button" onClick={sendCode} disabled={sending}
            className="w-full h-11 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-bold rounded-xl active:scale-95 disabled:opacity-50 transition-all">
            {sending ? 'Sending...' : 'Send Verification Code'}
          </button>
        </>
      ) : (
        <>
          <p className="text-[13px] text-[hsl(var(--admin-text-sub))]">
            Enter the 6-digit code sent to <strong>{email}</strong>
          </p>
          <input
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="w-full h-14 text-center text-2xl font-mono font-bold tracking-[0.5em] rounded-xl bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))] focus:ring-2 focus:ring-[hsl(var(--admin-primary)/0.15)]"
            autoFocus
          />
          <button type="button" onClick={verify} disabled={verifying || code.length !== 6}
            className="w-full h-11 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-bold rounded-xl active:scale-95 disabled:opacity-50 transition-all">
            {verifying ? 'Verifying...' : 'Verify Email'}
          </button>
          <button type="button" onClick={sendCode} disabled={countdown > 0 || sending}
            className="w-full text-[13px] text-[hsl(var(--admin-primary))] font-semibold disabled:text-[hsl(var(--admin-text-muted))]">
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </button>
        </>
      )}
      {error && <p className="text-[13px] text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
    </div>
  );
}

function PasswordSetupStep({ isFirstLogin, onComplete }: { isFirstLogin: boolean; onComplete: () => void }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit() {
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setSaving(true);
    setError('');
    const token = localStorage.getItem('session_token');
    const res = await fetch('/v1/auth/onboarding/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
      body: JSON.stringify({
        newPassword: password,
        ...(!isFirstLogin && currentPassword ? { currentPassword } : {}),
      }),
    });
    if (res.ok) {
      onComplete();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.message || 'Failed to set password');
    }
    setSaving(false);
  }

  return (
    <div className="ios-card p-5 space-y-4">
      {!isFirstLogin && (
        <div>
          <label className="block text-[13px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1">Current Password</label>
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))] text-[14px]" />
        </div>
      )}

      <div>
        <label className="block text-[13px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1">
          {isFirstLogin ? 'Create Password' : 'New Password'}
        </label>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
            className="w-full h-11 px-4 pr-11 rounded-xl bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))] text-[14px]" />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--admin-text-muted))]">
            <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1">Confirm Password</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
          className="w-full h-11 px-4 rounded-xl bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))] text-[14px]" />
      </div>

      {/* Password strength checklist */}
      <div className="space-y-1.5 pt-1">
        {PASSWORD_RULES.map(rule => {
          const passes = password.length > 0 && rule.test(password);
          return (
            <div key={rule.label} className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-[16px] ${passes ? 'text-green-600' : 'text-[hsl(var(--admin-text-muted))]'}`}>
                {passes ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className={`text-[12px] font-medium ${passes ? 'text-green-600' : 'text-[hsl(var(--admin-text-muted))]'}`}>
                {rule.label}
              </span>
            </div>
          );
        })}
        {confirm.length > 0 && (
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-[16px] ${password === confirm ? 'text-green-600' : 'text-red-500'}`}>
              {password === confirm ? 'check_circle' : 'cancel'}
            </span>
            <span className={`text-[12px] font-medium ${password === confirm ? 'text-green-600' : 'text-red-500'}`}>
              Passwords match
            </span>
          </div>
        )}
      </div>

      {error && <p className="text-[13px] text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <button type="button" onClick={handleSubmit}
        disabled={saving || !PASSWORD_RULES.every(r => r.test(password)) || password !== confirm}
        className="w-full h-11 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-bold rounded-xl active:scale-95 disabled:opacity-50 transition-all">
        {saving ? 'Setting Password...' : 'Set Password'}
      </button>
    </div>
  );
}

function PolicyAcceptanceStep({ tenantId, slug, onComplete }: { tenantId: string | null; slug: string; onComplete: () => void }) {
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [childSafety, setChildSafety] = useState(false);
  const [communications, setCommunications] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const allRequired = terms && privacy && childSafety;

  async function handleAccept() {
    setSaving(true);
    setError('');
    const token = localStorage.getItem('session_token');
    const role = localStorage.getItem('user_role') || 'unknown';
    const res = await fetch('/v1/auth/onboarding/accept-policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
      body: JSON.stringify({
        tenantId: tenantId || localStorage.getItem('admin_tenant_id') || '',
        role,
        consents: {
          terms_version: '1.0',
          privacy_version: '1.0',
          child_safety_version: '1.0',
          communications_version: '1.0',
          notifications: communications,
          email: communications,
          sms: false,
        },
      }),
    });
    if (res.ok) {
      onComplete();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.message || 'Failed to accept policies');
    }
    setSaving(false);
  }

  return (
    <div className="ios-card p-5 space-y-4">
      <p className="text-[13px] text-[hsl(var(--admin-text-sub))]">
        Please review and accept the following policies to continue using the platform.
      </p>

      <div className="space-y-3">
        <PolicyCheckbox
          checked={terms}
          onChange={setTerms}
          label="Terms of Service"
          description="I agree to the Terms of Service and Acceptable Use Policy"
          required
          href={`/tenant/${slug}/terms`}
        />
        <PolicyCheckbox
          checked={privacy}
          onChange={setPrivacy}
          label="Privacy Policy & POPIA Notice"
          description="I consent to the collection and processing of my data as described"
          required
          href={`/tenant/${slug}/privacy`}
        />
        <PolicyCheckbox
          checked={childSafety}
          onChange={setChildSafety}
          label="Child Safety Policy"
          description="I acknowledge the child safety and safeguarding guidelines"
          required
          href={`/tenant/${slug}/child-safety`}
        />
        <PolicyCheckbox
          checked={communications}
          onChange={setCommunications}
          label="Communications & Notifications"
          description="I agree to receive platform notifications and updates"
          href={`/tenant/${slug}/communications-notices`}
        />
      </div>

      {error && <p className="text-[13px] text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <button type="button" onClick={handleAccept} disabled={saving || !allRequired}
        className="w-full h-11 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-bold rounded-xl active:scale-95 disabled:opacity-50 transition-all">
        {saving ? 'Accepting...' : 'Accept & Continue'}
      </button>
    </div>
  );
}

function PolicyCheckbox({ checked, onChange, label, description, required, href }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
  required?: boolean;
  href?: string;
}) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer">
      <div className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        checked ? 'bg-[hsl(var(--admin-primary))] border-[hsl(var(--admin-primary))]' : 'border-[hsl(var(--admin-border))]'
      }`}>
        {checked && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={() => onChange(!checked)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-semibold text-[hsl(var(--admin-text-main))]">{label}</span>
          {required && <span className="text-[10px] font-bold text-red-500 uppercase">Required</span>}
        </div>
        <p className="text-[12px] text-[hsl(var(--admin-text-muted))] mt-0.5 leading-snug">{description}</p>
        {href && (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="text-[11px] text-[hsl(var(--admin-primary))] font-semibold mt-1 inline-block hover:underline">
            Read full policy
          </a>
        )}
      </div>
    </label>
  );
}
