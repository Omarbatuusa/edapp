'use client';

import { useState, useRef } from 'react';
import { uploadToGcs } from './uploadToGcs';

interface CoverUploadProps {
    label?: string;
    value: string;
    onChange: (objectKey: string) => void;
}

export function CoverUpload({ label = 'Cover Photo', value, onChange }: CoverUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
        if (file.size > 10 * 1024 * 1024) { setError('File must be under 10MB'); return; }
        setError('');
        setUploading(true);
        const blobUrl = URL.createObjectURL(file);
        setPreviewUrl(blobUrl);
        try {
            const { objectKey, previewUrl: signedUrl } = await uploadToGcs(file, 'logos');
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

    const hasCustomCover = previewUrl || value;
    const displaySrc = previewUrl || (value && !value.startsWith('uploads/') ? value : '');

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label} <span className="text-slate-400 font-normal">(optional)</span></label>
            <div
                className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-[16/5] group cursor-pointer"
                onClick={() => !uploading && inputRef.current?.click()}
            >
                {displaySrc ? (
                    <img src={displaySrc} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white/70 text-xs font-medium">Default gradient · click to upload</span>
                    </div>
                )}
                {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <span className="px-4 py-2 bg-white text-slate-800 text-sm font-medium rounded-xl">
                        {hasCustomCover ? 'Change cover' : 'Upload cover'}
                    </span>
                    {hasCustomCover && (
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); onChange(''); setPreviewUrl(''); }}
                            className="px-4 py-2 bg-white/80 text-red-600 text-sm font-medium rounded-xl hover:bg-white transition-colors"
                        >
                            Remove
                        </button>
                    )}
                </div>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
