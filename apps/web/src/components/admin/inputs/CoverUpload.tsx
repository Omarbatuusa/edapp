'use client';

import { useState, useRef, useEffect } from 'react';
import { uploadToGcs } from './uploadToGcs';

interface CoverUploadProps {
    label?: string;
    value: string;
    onChange: (objectKey: string) => void;
}

/** Fetch a fresh signed read URL for an existing objectKey */
async function fetchReadUrl(objectKey: string): Promise<string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/v1/storage/read-url?key=${encodeURIComponent(objectKey)}`, { headers });
    if (res.ok) {
        const { readUrl } = await res.json();
        return readUrl || '';
    }
    return '';
}

export function CoverUpload({ label = 'Cover Photo', value, onChange }: CoverUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch preview when value (objectKey) exists but no previewUrl (draft resume)
    useEffect(() => {
        if (value && !previewUrl) {
            fetchReadUrl(value).then(url => {
                if (url) setPreviewUrl(url);
            });
        }
    }, [value, previewUrl]);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
        if (file.size > 5 * 1024 * 1024) { setError('File must be under 5 MB'); return; }
        setError('');
        setUploading(true);
        const blobUrl = URL.createObjectURL(file);
        setPreviewUrl(blobUrl);
        try {
            const { objectKey, previewUrl: signedUrl } = await uploadToGcs(file, 'covers');
            onChange(objectKey);
            if (signedUrl) setPreviewUrl(signedUrl);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
            onChange('');
            setPreviewUrl('');
            URL.revokeObjectURL(blobUrl);
        } finally {
            setUploading(false);
        }
    };

    const hasCover = !!(previewUrl || value);
    const displaySrc = previewUrl;

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[hsl(var(--admin-text-sub))] px-1">
                {label} <span className="text-[hsl(var(--admin-text-muted))] font-normal">(optional)</span>
            </label>
            <div
                className="relative rounded-2xl overflow-hidden border border-[hsl(var(--admin-border)/0.4)] aspect-[16/5] group cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => !uploading && inputRef.current?.click()}
            >
                {displaySrc ? (
                    <img src={displaySrc} alt="Cover" className="w-full h-full object-cover" />
                ) : hasCover ? (
                    /* Has objectKey but no preview yet — show uploaded indicator */
                    <div className="w-full h-full bg-green-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-500 text-[28px]">check_circle</span>
                    </div>
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[hsl(var(--admin-primary)/0.08)] to-[hsl(210_100%_50%/0.15)] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-1.5 px-4 text-center">
                            <span className="material-symbols-outlined text-[20px] text-[hsl(var(--admin-text-muted))]">panorama</span>
                            <span className="text-[11px] font-medium text-[hsl(var(--admin-text-muted))]">Tap to upload cover</span>
                            <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">1200 × 400px recommended · PNG, JPG or WebP · Max 5 MB</span>
                            <span className="text-[9px] text-[hsl(var(--admin-text-muted))]">Auto-optimized for fast loading</span>
                        </div>
                    </div>
                )}
                {uploading && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    </div>
                )}
                {!uploading && hasCover && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <span className="px-3 py-1.5 bg-white/90 text-[hsl(var(--admin-text-main))] text-[12px] font-medium rounded-lg">Change</span>
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); onChange(''); setPreviewUrl(''); }}
                            className="px-3 py-1.5 bg-white/90 text-red-500 text-[12px] font-medium rounded-lg"
                        >
                            Remove
                        </button>
                    </div>
                )}
                <input ref={inputRef} type="file" accept="image/*" className="hidden" aria-label="Upload cover image" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
            {error && <p className="text-[12px] text-red-500 font-medium px-1">{error}</p>}
        </div>
    );
}
