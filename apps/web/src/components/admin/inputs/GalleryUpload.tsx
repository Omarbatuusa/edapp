'use client';

import { useState, useRef } from 'react';
import { uploadToGcs } from './uploadToGcs';

interface GalleryItem {
    objectKey: string;
    previewUrl: string;
}

interface GalleryUploadProps {
    label?: string;
    value: string[];           // objectKeys stored in DB
    onChange: (keys: string[]) => void;
    max?: number;
}

export function GalleryUpload({ label = 'Image Gallery', value, onChange, max = 10 }: GalleryUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previews, setPreviews] = useState<GalleryItem[]>([]);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList) => {
        const toUpload = Array.from(files).slice(0, max - value.length);
        if (toUpload.length === 0) return;
        setUploading(true);
        setError('');
        const newKeys: string[] = [];
        const newPreviews: GalleryItem[] = [];
        for (const file of toUpload) {
            if (!file.type.startsWith('image/')) continue;
            if (file.size > 10 * 1024 * 1024) { setError('Each image must be under 10MB'); continue; }
            try {
                const { objectKey, previewUrl } = await uploadToGcs(file, 'logos');
                newKeys.push(objectKey);
                newPreviews.push({ objectKey, previewUrl });
            } catch { /* skip failed uploads */ }
        }
        onChange([...value, ...newKeys]);
        setPreviews(prev => [...prev, ...newPreviews]);
        setUploading(false);
    };

    const remove = (idx: number) => {
        onChange(value.filter((_, i) => i !== idx));
        setPreviews(prev => prev.filter(p => p.objectKey !== value[idx]));
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {label} <span className="text-slate-400 font-normal">(optional · max {max})</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {value.map((key, idx) => {
                    const preview = previews.find(p => p.objectKey === key);
                    const src = preview?.previewUrl || (key.startsWith('uploads/') ? '' : key);
                    return (
                    <div key={key} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                        {src ? (
                            <img src={src} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400 text-sm">image</span>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => remove(idx)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                    </div>
                    );
                })}
                {value.length < max && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group"
                    >
                        {uploading ? (
                            <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                        ) : (
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-500">add_photo_alternate</span>
                        )}
                    </button>
                )}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <input ref={inputRef} type="file" accept="image/*" multiple title="Upload gallery images" className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
        </div>
    );
}
