'use client';

import React, { useRef } from 'react';

interface AttachmentSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: string) => void;
}

const OPTIONS = [
    { id: 'camera', icon: 'photo_camera', label: 'Camera', bg: 'bg-[#ff6680]' },
    { id: 'gallery', icon: 'image', label: 'Gallery', bg: 'bg-[#bf59cf]' },
    { id: 'document', icon: 'description', label: 'Document', bg: 'bg-[#7f66ff]' },
];

export function AttachmentSheet({ isOpen, onClose, onSelect }: AttachmentSheetProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleOption = (id: string) => {
        if (id === 'document') {
            fileInputRef.current?.click();
        } else if (id === 'gallery') {
            imageInputRef.current?.click();
        } else {
            onSelect(id);
        }
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log(`Selected ${type}:`, file.name, file.size);
            onSelect(type);
        }
        e.target.value = '';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            <input ref={fileInputRef} type="file" accept="*/*" className="hidden" title="Select document" onChange={(e) => handleFileSelected(e, 'document')} />
            <input ref={imageInputRef} type="file" accept="image/*,video/*" className="hidden" title="Select image or video" onChange={(e) => handleFileSelected(e, 'gallery')} />

            {/* Constrained width sheet — not full-width on desktop */}
            <div className="relative w-full max-w-md bg-white dark:bg-[#1e293b] rounded-t-2xl shadow-2xl px-6 pt-4 pb-8">
                <div className="flex justify-center mb-4">
                    <div className="w-10 h-1 rounded-full bg-[#cbd5e1] dark:bg-[#475569]" />
                </div>

                <div className="grid grid-cols-3 gap-y-5 gap-x-4">
                    {OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleOption(opt.id)}
                            className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                        >
                            <div className={`w-[52px] h-[52px] rounded-full ${opt.bg} flex items-center justify-center shadow-sm`}>
                                <span className="material-symbols-outlined text-[24px] text-white">{opt.icon}</span>
                            </div>
                            <span className="text-[12px] font-medium text-[#475569] dark:text-[#94a3b8]">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
