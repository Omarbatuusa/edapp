'use client';

import { useState, useRef } from 'react';
import { uploadToGcs } from './uploadToGcs';
import { FieldWrapper } from './FieldWrapper';

export interface DocFile {
    doc_type: string;
    object_key: string;
    filename: string;
}

interface DocumentUploadProps {
    label: string;
    value: DocFile[];
    onChange: (docs: DocFile[]) => void;
    docTypes: Array<{ code: string; label: string }>;
    maxFiles?: number;
    maxSizeMb?: number;
    accept?: string;
    required?: boolean;
}

export function DocumentUpload({
    label,
    value,
    onChange,
    docTypes,
    maxFiles = 20,
    maxSizeMb = 10,
    accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
    required,
}: DocumentUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [selectedType, setSelectedType] = useState(docTypes[0]?.code || '');
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > maxSizeMb * 1024 * 1024) {
            setError(`File too large. Maximum ${maxSizeMb}MB allowed.`);
            return;
        }

        if (value.length >= maxFiles) {
            setError(`Maximum ${maxFiles} files allowed.`);
            return;
        }

        setUploading(true);
        setError('');

        try {
            const result = await uploadToGcs(file, 'attachments');
            const newDoc: DocFile = {
                doc_type: selectedType,
                object_key: result.objectKey,
                filename: file.name,
            };
            onChange([...value, newDoc]);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handleRemove = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const getTypeLabel = (code: string) => {
        return docTypes.find(t => t.code === code)?.label || code;
    };

    return (
        <FieldWrapper
            label={label}
            required={required}
            state={error ? 'error' : value.length > 0 ? 'success' : 'idle'}
            error={error}
            helper={`Accepted: ${accept}. Max ${maxSizeMb}MB per file.`}
        >
            <div className="p-3 space-y-3">
                {/* Uploaded files */}
                {value.length > 0 && (
                    <div className="space-y-2">
                        {value.map((doc, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm"
                            >
                                <span className="material-symbols-outlined text-slate-400 text-lg">description</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{doc.filename}</p>
                                    <p className="text-xs text-slate-400">{getTypeLabel(doc.doc_type)}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    className="p-1 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload controls */}
                {value.length < maxFiles && (
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedType}
                            onChange={e => setSelectedType(e.target.value)}
                            className="h-9 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm flex-1"
                        >
                            {docTypes.map(t => (
                                <option key={t.code} value={t.code}>{t.label}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            disabled={uploading}
                            className="flex items-center gap-1 h-9 px-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
                        >
                            {uploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">upload_file</span>
                                    Upload
                                </>
                            )}
                        </button>
                        <input
                            ref={fileRef}
                            type="file"
                            accept={accept}
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                )}
            </div>
        </FieldWrapper>
    );
}
