'use client';

import { useState, useRef } from 'react';
import { uploadToGcs } from './uploadToGcs';

interface LogoUploadProps {
    label?: string;
    value: string;
    onChange: (objectKey: string) => void;
    required?: boolean;
}

export function LogoUpload({ label = 'School Logo', value, onChange, required }: LogoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
        if (file.size > 5 * 1024 * 1024) { setError('File must be under 5MB'); return; }
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

    const hasImage = previewUrl || (value && !value.startsWith('uploads/'));
    const imgSrc = previewUrl || value;

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}{required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div
                onClick={() => !uploading && inputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${hasImage ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-slate-50 dark:bg-slate-800/50'}`}
            >
                {uploading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 rounded-2xl flex items-center justify-center z-10">
                        <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                )}
                {hasImage ? (
                    <div className="flex flex-col items-center gap-2">
                        <img src={imgSrc} alt="Logo preview" className="w-24 h-24 object-contain rounded-xl border border-slate-200 bg-white" />
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); onChange(''); setPreviewUrl(''); }}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-3">
                            <span className="material-symbols-outlined text-slate-400 text-3xl">add_photo_alternate</span>
                        </div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Click to upload logo</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG or SVG · Max 5MB</p>
                    </>
                )}
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
