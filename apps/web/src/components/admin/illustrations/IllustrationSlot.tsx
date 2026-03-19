'use client';

import { ReactNode, useState, useRef, useEffect, useCallback, useId } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { uploadToGcs } from '../inputs/uploadToGcs';

const SUPER_ADMIN_ROLES = ['platform_super_admin', 'app_super_admin'];

interface IllustrationSlotProps {
    /** Unique key for this illustration (e.g. 'brand_step_1') */
    slotKey: string;
    /** Default inline SVG component */
    fallback: ReactNode;
}

/**
 * Wraps an illustration SVG with super-admin replace functionality.
 * Stores the GCS object key in localStorage (not the signed URL, which expires).
 * Fetches a fresh signed read URL each time the component mounts.
 */
export function IllustrationSlot({ slotKey, fallback }: IllustrationSlotProps) {
    const { fullRole } = useRole();
    const isSuperAdmin = SUPER_ADMIN_ROLES.some(r => fullRole.includes(r));
    const inputRef = useRef<HTMLInputElement>(null);
    const [displayUrl, setDisplayUrl] = useState<string | null>(null);
    const [objectKey, setObjectKey] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [showControls, setShowControls] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout>>();

    // Auto-dismiss touch overlay after 3 seconds
    useEffect(() => {
        if (showControls) {
            hideTimer.current = setTimeout(() => setShowControls(false), 3000);
            return () => clearTimeout(hideTimer.current);
        }
    }, [showControls]);

    // Fetch a fresh signed read URL for a stored object key
    const fetchReadUrl = useCallback(async (key: string) => {
        try {
            const token = localStorage.getItem('session_token');
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`/v1/storage/read-url?key=${encodeURIComponent(key)}`, { headers });
            if (res.ok) {
                const { readUrl } = await res.json();
                if (readUrl) setDisplayUrl(readUrl);
            }
        } catch {
            // Silently fail — will show fallback
        }
    }, []);

    // Load stored object key and fetch fresh URL on mount
    useEffect(() => {
        const storedKey = localStorage.getItem(`illustration_key_${slotKey}`);
        if (storedKey) {
            setObjectKey(storedKey);
            fetchReadUrl(storedKey);
        }
        // Migrate: remove old signed URL entries
        localStorage.removeItem(`illustration_${slotKey}`);
    }, [slotKey, fetchReadUrl]);

    const handleUpload = async (file: File) => {
        if (!file.type.includes('svg')) {
            setError('Only SVG files are allowed');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError('SVG must be under 2 MB');
            return;
        }
        setError('');
        setUploading(true);
        try {
            const { objectKey: newKey, previewUrl } = await uploadToGcs(file, 'logos');
            if (newKey) {
                localStorage.setItem(`illustration_key_${slotKey}`, newKey);
                setObjectKey(newKey);
                setDisplayUrl(previewUrl || null);
                // If no preview URL came back, fetch one
                if (!previewUrl) fetchReadUrl(newKey);
            }
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleRevert = () => {
        localStorage.removeItem(`illustration_key_${slotKey}`);
        localStorage.removeItem(`illustration_${slotKey}`); // cleanup old format
        setObjectKey(null);
        setDisplayUrl(null);
        setError('');
    };

    return (
        <div
            className="relative group"
            onClick={() => { if (isSuperAdmin) setShowControls(prev => !prev); }}
        >
            {/* Render custom SVG or default fallback */}
            {displayUrl ? (
                <img
                    src={displayUrl}
                    alt="Custom illustration"
                    className="w-full max-w-[200px] max-h-[160px] object-contain mx-auto"
                    onError={() => handleRevert()}
                />
            ) : (
                fallback
            )}

            {/* Super admin overlay controls */}
            {isSuperAdmin && (
                <div className={`absolute inset-0 flex items-end justify-center pb-1 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className="flex items-center gap-1 bg-white/90 rounded-lg shadow-sm border border-[hsl(var(--admin-border)/0.4)] px-1.5 py-1">
                        {uploading ? (
                            <div className="w-4 h-4 border-2 border-[hsl(var(--admin-primary)/0.2)] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin mx-2" />
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => inputRef.current?.click()}
                                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary)/0.08)] rounded transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[14px]">upload</span>
                                    Replace
                                </button>
                                {objectKey && (
                                    <button
                                        type="button"
                                        onClick={handleRevert}
                                        className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-surface-alt))] rounded transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                                        Default
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/svg+xml"
                        className="hidden"
                        aria-label="Upload custom illustration"
                        onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
                    />
                </div>
            )}

            {error && (
                <p className="text-[11px] text-red-500 text-center mt-1">{error}</p>
            )}
        </div>
    );
}
