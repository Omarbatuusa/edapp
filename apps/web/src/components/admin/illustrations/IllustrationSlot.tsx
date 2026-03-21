'use client';

import { useState, useRef, useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { uploadToGcs } from '../inputs/uploadToGcs';
import { authFetch } from '@/lib/authFetch';

const SUPER_ADMIN_ROLES = ['platform_super_admin', 'app_super_admin'];

// Module-level cache: slotKey → signed URL (or null = no override confirmed)
const urlCache = new Map<string, string | null>();

interface IllustrationSlotProps {
    /** Unique key for this illustration slot (e.g. 'brand_step_1') */
    slotKey: string;
}

/**
 * Illustration slot backed by the backend illustration_overrides table.
 * - Super admin: sees an upload placeholder when no override exists,
 *   and Replace / Remove controls when one is set.
 * - Everyone else: renders the override image if one exists, nothing if not.
 * Changes sync across all devices because the source of truth is the DB,
 * not localStorage.
 */
export function IllustrationSlot({ slotKey }: IllustrationSlotProps) {
    const { fullRole } = useRole();
    const isSuperAdmin = SUPER_ADMIN_ROLES.some(r => fullRole.includes(r));
    const inputRef = useRef<HTMLInputElement>(null);
    const [displayUrl, setDisplayUrl] = useState<string | null>(null);
    const [objectKey, setObjectKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [showControls, setShowControls] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Auto-dismiss touch overlay after 3 s
    useEffect(() => {
        if (showControls) {
            hideTimer.current = setTimeout(() => setShowControls(false), 3000);
            return () => clearTimeout(hideTimer.current);
        }
    }, [showControls]);

    // On slotKey change: instantly show cached URL (or clear to null) to prevent flash
    useEffect(() => {
        if (urlCache.has(slotKey)) {
            setDisplayUrl(urlCache.get(slotKey) ?? null);
            setObjectKey(null);
            setLoading(false);
        } else {
            setDisplayUrl(null);
            setObjectKey(null);
            setLoading(true);
        }
    }, [slotKey]);

    // Fetch current override from backend when slotKey changes and not cached
    useEffect(() => {
        if (urlCache.has(slotKey)) return; // already populated by cache effect

        const load = async () => {
            try {
                const res = await authFetch(`/v1/admin/illustrations/${slotKey}`);
                if (res.ok) {
                    const data = await res.json();
                    const url = data.url || null;
                    urlCache.set(slotKey, url);
                    setDisplayUrl(url);
                    setObjectKey(data.object_key || null);
                } else {
                    urlCache.set(slotKey, null);
                }
            } catch {
                urlCache.set(slotKey, null);
            }

            // One-time migration: move old localStorage key to backend
            const oldKey = typeof window !== 'undefined'
                ? localStorage.getItem(`illustration_key_${slotKey}`)
                : null;
            if (oldKey) {
                try {
                    await authFetch(`/v1/admin/illustrations/${slotKey}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ object_key: oldKey }),
                    });
                } catch { /* best-effort */ }
                localStorage.removeItem(`illustration_key_${slotKey}`);
                localStorage.removeItem(`illustration_${slotKey}`);
            }

            setLoading(false);
        };
        load();
    }, [slotKey]);

    const handleUpload = async (file: File) => {
        if (!file.type.includes('svg')) { setError('Only SVG files are allowed'); return; }
        if (file.size > 2 * 1024 * 1024) { setError('SVG must be under 2 MB'); return; }
        setError('');
        // Clear immediately so old image doesn't linger while uploading
        setDisplayUrl(null);
        setObjectKey(null);
        setUploading(true);
        try {
            const { objectKey: newKey, previewUrl } = await uploadToGcs(file, 'logos');
            if (newKey) {
                await authFetch(`/v1/admin/illustrations/${slotKey}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ object_key: newKey }),
                });
                setObjectKey(newKey);
                if (previewUrl) {
                    urlCache.set(slotKey, previewUrl);
                    setDisplayUrl(previewUrl);
                } else {
                    // Fetch fresh signed URL from backend
                    const r = await authFetch(`/v1/admin/illustrations/${slotKey}`);
                    if (r.ok) {
                        const d = await r.json();
                        const url = d.url || null;
                        urlCache.set(slotKey, url);
                        if (url) setDisplayUrl(url);
                    }
                }
            }
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const handleRemove = async () => {
        urlCache.set(slotKey, null);
        setObjectKey(null);
        setDisplayUrl(null);
        setError('');
        setShowControls(false);
        try {
            await authFetch(`/v1/admin/illustrations/${slotKey}`, { method: 'DELETE' });
        } catch { /* best effort */ }
    };

    // Still fetching initial state — render nothing to avoid flash
    if (loading) return null;

    // No override set
    if (!displayUrl) {
        // Non-super-admin: render nothing
        if (!isSuperAdmin) return null;

        // Super admin: render upload placeholder
        return (
            <div className="w-full max-w-[220px] mx-auto">
                <div className="h-[100px] rounded-2xl border-2 border-dashed border-[hsl(var(--admin-border)/0.45)] bg-[hsl(var(--admin-surface-alt)/0.25)] flex flex-col items-center justify-center">
                    {uploading ? (
                        <div className="w-7 h-7 border-2 border-[hsl(var(--admin-primary)/0.2)] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin" />
                    ) : (
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="flex flex-col items-center gap-1.5 px-4 py-2 text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-primary))] transition-colors"
                        >
                            <span className="material-symbols-outlined text-[26px]">add_photo_alternate</span>
                            <span className="text-[11px] font-medium">Add illustration</span>
                        </button>
                    )}
                </div>
                {error && <p className="text-[11px] text-red-500 text-center mt-1">{error}</p>}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/svg+xml"
                    className="hidden"
                    aria-label="Upload custom illustration"
                    onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
            </div>
        );
    }

    // Override exists — render image with super-admin controls
    return (
        <div
            className="relative group w-full max-w-[220px] mx-auto"
            onClick={() => { if (isSuperAdmin) setShowControls(prev => !prev); }}
        >
            <img
                src={displayUrl}
                alt="Custom illustration"
                className="w-full max-h-[160px] object-contain"
                onError={() => { setDisplayUrl(null); }}
            />

            {isSuperAdmin && (
                <div className={`absolute inset-0 flex items-end justify-center pb-1.5 transition-opacity duration-150 ${showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className="flex items-center gap-0.5 bg-white/95 rounded-xl shadow border border-[hsl(var(--admin-border)/0.35)] px-1 py-1">
                        {uploading ? (
                            <div className="w-4 h-4 border-2 border-[hsl(var(--admin-primary)/0.2)] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin mx-2" />
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary)/0.08)] rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[13px]">upload</span>
                                    Replace
                                </button>
                                <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); handleRemove(); }}
                                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[13px]">delete</span>
                                    Remove
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/svg+xml"
                className="hidden"
                aria-label="Upload custom illustration"
                onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
            {error && <p className="text-[11px] text-red-500 text-center mt-1">{error}</p>}
        </div>
    );
}
