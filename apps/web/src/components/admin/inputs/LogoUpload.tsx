'use client';

import { useState, useRef, useEffect } from 'react';
import { uploadToGcs } from './uploadToGcs';
import { authFetch } from '@/lib/authFetch';

interface LogoUploadProps {
    label?: string;
    value: string;
    onChange: (objectKey: string) => void;
    required?: boolean;
}

/** Fetch a fresh signed read URL; falls back to the public serve endpoint. */
async function fetchReadUrl(objectKey: string): Promise<string> {
    const res = await authFetch(`/v1/storage/read-url?key=${encodeURIComponent(objectKey)}`);
    if (res.ok) {
        const { readUrl } = await res.json();
        if (readUrl) return readUrl;
    }
    // Signed URL unavailable (VM lacks signing permission) — serve directly.
    return `/v1/storage/serve?key=${encodeURIComponent(objectKey)}`;
}

export function LogoUpload({ label = 'School Logo', value, onChange, required }: LogoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // When value (objectKey) is set but no preview — fetch a signed URL (draft resume case)
    useEffect(() => {
        if (value && !previewUrl) {
            fetchReadUrl(value).then(url => {
                if (url) setPreviewUrl(url);
            });
        }
    }, [value, previewUrl]);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
        if (file.size > 2 * 1024 * 1024) { setError('File must be under 2 MB'); return; }
        setError('');
        setUploading(true);
        const blobUrl = URL.createObjectURL(file);
        setPreviewUrl(blobUrl);
        try {
            const { objectKey, previewUrl: signedUrl } = await uploadToGcs(file, 'logos');
            onChange(objectKey);
            if (signedUrl) {
                URL.revokeObjectURL(blobUrl);  // replaced by signed/serve URL — safe to free
                setPreviewUrl(signedUrl);
            }
        } catch (err: any) {
            setError(err.message || 'Upload failed');
            onChange('');
            // Keep previewUrl (blob URL) so the user can see their selection and tap to retry.
            // The blob URL is valid for the lifetime of this page session.
        } finally {
            setUploading(false);
        }
    };

    const hasImage = !!(previewUrl || value);
    const imgSrc = previewUrl;

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[hsl(var(--admin-text-sub))] px-1">
                {label}{required && <span className="text-red-500 text-[11px] ml-0.5">*</span>}
            </label>
            <div
                onClick={() => !uploading && inputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed p-5 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98] min-h-[120px] ${
                    hasImage
                        ? 'border-[hsl(var(--admin-primary)/0.3)] bg-[hsl(var(--admin-primary)/0.03)]'
                        : 'border-[hsl(var(--admin-border)/0.5)] hover:border-[hsl(var(--admin-primary)/0.4)] bg-[hsl(var(--admin-surface-alt)/0.3)]'
                }`}
            >
                {uploading && (
                    <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center z-10">
                        <div className="w-6 h-6 border-2 border-[hsl(var(--admin-primary)/0.2)] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin" />
                    </div>
                )}
                {hasImage ? (
                    <div className="flex flex-col items-center gap-2.5">
                        {imgSrc ? (
                            <img src={imgSrc} alt="Logo preview" className="w-20 h-20 object-contain rounded-xl border border-[hsl(var(--admin-border)/0.3)] bg-white" />
                        ) : (
                            <div className="w-20 h-20 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
                                <span className="material-symbols-outlined text-green-500 text-[24px]">check_circle</span>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); onChange(''); setPreviewUrl(''); }}
                            className="text-[12px] text-red-500 font-medium"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="w-11 h-11 bg-[hsl(var(--admin-surface-alt))] rounded-xl flex items-center justify-center mb-2">
                            <span className="material-symbols-outlined text-[22px] text-[hsl(var(--admin-text-muted))]">add_photo_alternate</span>
                        </div>
                        <p className="text-[13px] font-medium text-[hsl(var(--admin-text-sub))]">Tap to upload logo</p>
                        <p className="text-[11px] text-[hsl(var(--admin-text-muted))] mt-0.5">512 × 512px recommended · PNG, JPG or SVG</p>
                        <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">Max 2 MB · Auto-optimized for fast loading</p>
                    </>
                )}
                <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" aria-label="Upload logo image" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
            {error && <p className="text-[12px] text-red-500 font-medium px-1">{error}</p>}
        </div>
    );
}
