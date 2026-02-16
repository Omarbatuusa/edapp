'use client';

import React, { useRef } from 'react';

interface AttachmentSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: string) => void;
}

const OPTIONS = [
    { id: 'document', icon: 'description', label: 'Document', bg: 'bg-[#7f66ff]' },
    { id: 'camera', icon: 'photo_camera', label: 'Camera', bg: 'bg-[#ff6680]' },
    { id: 'gallery', icon: 'image', label: 'Gallery', bg: 'bg-[#bf59cf]' },
    { id: 'audio', icon: 'headphones', label: 'Audio', bg: 'bg-[#ee7b30]' },
    { id: 'location', icon: 'location_on', label: 'Location', bg: 'bg-[#1fa855]' },
    { id: 'contact', icon: 'person', label: 'Contact', bg: 'bg-[#009de2]' },
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
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            <input ref={fileInputRef} type="file" accept="*/*" className="hidden" title="Select document" onChange={(e) => handleFileSelected(e, 'document')} />
            <input ref={imageInputRef} type="file" accept="image/*,video/*" className="hidden" title="Select image or video" onChange={(e) => handleFileSelected(e, 'gallery')} />

            <div className="relative w-full bg-white dark:bg-[#233138] rounded-t-2xl shadow-2xl px-6 pt-5 pb-8 animate-in slide-in-from-bottom duration-200">
                <div className="flex justify-center mb-5">
                    <div className="w-10 h-1 rounded-full bg-[#8696a0]/40" />
                </div>

                <div className="grid grid-cols-3 gap-y-6 gap-x-4 max-w-xs mx-auto">
                    {OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleOption(opt.id)}
                            className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                        >
                            <div className={`w-[54px] h-[54px] rounded-full ${opt.bg} flex items-center justify-center shadow-sm`}>
                                <span className="material-symbols-outlined text-[26px] text-white">{opt.icon}</span>
                            </div>
                            <span className="text-[12px] font-medium text-[#54656f] dark:text-[#8696a0]">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
