'use client';

import { useState, useEffect, use } from 'react';
import { useParams } from 'next/navigation';
import { User, Palette, Building, Save, Upload, Shield } from 'lucide-react';
import { authFetch } from '@/lib/authFetch';

export default function SettingsHub() {
    const params = useParams();
    const slug = params?.slug as string || '';
    const isPlatform = slug === 'edapp';

    const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'profile'>('general');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    // Platform settings
    const [platformLogo, setPlatformLogo] = useState<string | null>(null);
    const [platformName, setPlatformName] = useState('EdApp Platform');

    // Tenant settings
    const [tenantName, setTenantName] = useState('');
    const [tenantEmail, setTenantEmail] = useState('');
    const [tenantPhone, setTenantPhone] = useState('');

    // Profile
    const [displayName, setDisplayName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        // Load user profile from localStorage
        setDisplayName(localStorage.getItem('display_name') || 'Admin User');
        setUserEmail(localStorage.getItem('user_email') || '');
        setUserRole(localStorage.getItem('user_role') || 'platform_super_admin');

        if (isPlatform) {
            // Load platform settings
            authFetch('/v1/admin/platform-settings')
                .then(r => r.ok ? r.json() : {})
                .then((data: any) => {
                    if (data.platform_name) setPlatformName(data.platform_name);
                    if (data.platform_logo?.file_key) {
                        authFetch(`/v1/storage/read-url?key=${encodeURIComponent(data.platform_logo.file_key)}`)
                            .then(r => r.ok ? r.json() : null)
                            .then(d => { if (d?.url) setPlatformLogo(d.url); })
                            .catch(() => {});
                    }
                })
                .catch(() => {});
        } else {
            // Load tenant settings
            const tid = localStorage.getItem('tenant_id') || localStorage.getItem(`edapp_tenant_id_${slug}`);
            if (tid) {
                authFetch(`/v1/admin/tenants/${tid}`)
                    .then(r => r.ok ? r.json() : null)
                    .then(t => {
                        if (t) {
                            setTenantName(t.school_name || '');
                            setTenantEmail(t.contact_email || '');
                            setTenantPhone(t.phone_e164 || t.contact_phone || '');
                        }
                    })
                    .catch(() => {});
            }
        }
    }, [slug, isPlatform]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSaving(true);
        setMsg('');
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await authFetch('/v1/admin/platform-settings/logo', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                const data = await res.json();
                if (data.url) setPlatformLogo(data.url);
                setMsg('Logo uploaded successfully!');
            } else {
                const err = await res.json().catch(() => ({}));
                setMsg(err.message || 'Upload failed');
            }
        } catch { setMsg('Upload failed'); }
        setSaving(false);
    };

    const handleSavePlatformName = async () => {
        setSaving(true);
        try {
            await authFetch('/v1/admin/platform-settings/platform_name', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: platformName }),
            });
            setMsg('Saved!');
        } catch { setMsg('Save failed'); }
        setSaving(false);
        setTimeout(() => setMsg(''), 3000);
    };

    const roleLabel = userRole.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Settings</h1>
                <p className="text-[14px] text-[hsl(var(--admin-text-muted))] mt-1">
                    {isPlatform ? 'Platform configuration, branding, and your profile.' : 'School configuration and your personal profile.'}
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar */}
                <div className="w-full md:w-56 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                    <TabBtn active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={Building} label={isPlatform ? 'Platform' : 'General'} />
                    <TabBtn active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} icon={Palette} label="Branding" />
                    <TabBtn active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} label="My Profile" />
                </div>

                {/* Content */}
                <div className="flex-1 ios-card p-5 md:p-6 min-h-[320px]">
                    {msg && (
                        <div className="mb-4 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-[13px] font-medium">
                            {msg}
                        </div>
                    )}

                    {activeTab === 'general' && isPlatform && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-bold text-[hsl(var(--admin-text-main))]">Platform Settings</h2>
                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="text-[13px] font-semibold text-[hsl(var(--admin-text-sub))] block mb-1.5">Platform Name</label>
                                    <input value={platformName} onChange={e => setPlatformName(e.target.value)}
                                        className="w-full h-[44px] px-3 rounded-[10px] border-[1.5px] border-[hsl(var(--admin-border)/0.55)] bg-[hsl(var(--admin-surface))] text-[15px] text-[hsl(var(--admin-text-main))] outline-none focus:border-[hsl(var(--admin-focus-ring)/0.7)] transition-all" />
                                </div>
                                <button onClick={handleSavePlatformName} disabled={saving}
                                    className="h-10 px-5 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50">
                                    <Save size={15} /> {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'general' && !isPlatform && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-bold text-[hsl(var(--admin-text-main))]">School Details</h2>
                            <div className="space-y-4 max-w-md">
                                <Field label="School Name" value={tenantName} onChange={setTenantName} />
                                <Field label="Contact Email" value={tenantEmail} onChange={setTenantEmail} type="email" />
                                <Field label="Phone Number" value={tenantPhone} onChange={setTenantPhone} type="tel" />
                                <button className="h-10 px-5 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all">
                                    <Save size={15} /> Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'branding' && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-bold text-[hsl(var(--admin-text-main))]">
                                {isPlatform ? 'Platform Branding' : 'School Branding'}
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-[13px] font-semibold text-[hsl(var(--admin-text-sub))] block mb-2">
                                        {isPlatform ? 'Platform Logo' : 'School Logo'}
                                    </label>
                                    <div className="flex items-start gap-4">
                                        {platformLogo ? (
                                            <img src={platformLogo} alt="Logo" className="w-20 h-20 rounded-xl border border-[hsl(var(--admin-border)/0.4)] object-contain bg-white" />
                                        ) : (
                                            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-[hsl(var(--admin-border)/0.4)] flex items-center justify-center bg-[hsl(var(--admin-surface-alt)/0.5)]">
                                                <Building size={28} className="text-[hsl(var(--admin-text-muted))]" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <label className="inline-flex items-center gap-2 h-10 px-4 bg-[hsl(var(--admin-primary))] text-white text-[13px] font-bold rounded-xl cursor-pointer active:scale-95 transition-all">
                                                <Upload size={15} />
                                                {saving ? 'Uploading...' : 'Upload Logo'}
                                                <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={handleLogoUpload} className="hidden" />
                                            </label>
                                            <p className="text-[11px] text-[hsl(var(--admin-text-muted))] mt-1.5">PNG, JPG, SVG, WebP — max 2MB</p>
                                        </div>
                                    </div>
                                </div>

                                {!isPlatform && (
                                    <div>
                                        <label className="text-[13px] font-semibold text-[hsl(var(--admin-text-sub))] block mb-2">Primary Brand Color</label>
                                        <div className="flex gap-2.5 flex-wrap">
                                            {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'].map(color => (
                                                <button key={color} className="w-9 h-9 rounded-full border-2 border-transparent hover:scale-110 transition-transform ring-offset-2 focus:ring-2 focus:ring-[hsl(var(--admin-primary))]"
                                                    style={{ backgroundColor: color }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-bold text-[hsl(var(--admin-text-main))]">My Profile</h2>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-14 h-14 rounded-full bg-[hsl(var(--admin-primary)/0.12)] flex items-center justify-center text-[hsl(var(--admin-primary))] text-lg font-bold flex-shrink-0">
                                    {displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-[16px] font-bold text-[hsl(var(--admin-text-main))]">{displayName}</p>
                                    <p className="text-[13px] text-[hsl(var(--admin-text-muted))]">{roleLabel}</p>
                                </div>
                            </div>
                            <div className="space-y-4 max-w-md">
                                <Field label="Display Name" value={displayName} onChange={setDisplayName} />
                                <Field label="Email" value={userEmail} onChange={() => {}} type="email" disabled />
                                <div className="pt-3 border-t border-[hsl(var(--admin-border)/0.4)]">
                                    <p className="text-[13px] font-semibold text-[hsl(var(--admin-text-sub))] mb-3 flex items-center gap-1.5"><Shield size={14} /> Security</p>
                                    <div className="space-y-2">
                                        <button className="text-[13px] text-[hsl(var(--admin-primary))] font-medium hover:underline">Change Password</button>
                                        <button className="text-[13px] text-[hsl(var(--admin-primary))] font-medium hover:underline block">Enable 2FA</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TabBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
    return (
        <button onClick={onClick}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                active
                    ? 'bg-[hsl(var(--admin-primary))] text-white shadow-sm'
                    : 'text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-surface-alt))] hover:text-[hsl(var(--admin-text-main))]'
            }`}>
            <Icon size={16} />
            {label}
        </button>
    );
}

function Field({ label, value, onChange, type = 'text', disabled }: { label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean }) {
    return (
        <div>
            <label className="text-[13px] font-semibold text-[hsl(var(--admin-text-sub))] block mb-1.5">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
                className="w-full h-[44px] px-3 rounded-[10px] border-[1.5px] border-[hsl(var(--admin-border)/0.55)] bg-[hsl(var(--admin-surface))] text-[15px] text-[hsl(var(--admin-text-main))] outline-none focus:border-[hsl(var(--admin-focus-ring)/0.7)] transition-all disabled:opacity-50" />
        </div>
    );
}
