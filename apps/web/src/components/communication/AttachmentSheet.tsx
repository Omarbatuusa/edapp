import React from 'react';

interface AttachmentSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: string) => void;
}

export function AttachmentSheet({ isOpen, onClose, onSelect }: AttachmentSheetProps) {
    if (!isOpen) return null;

    const OPTIONS = [
        { id: 'camera', icon: 'photo_camera', label: 'Camera', color: 'text-primary bg-blue-50 dark:bg-blue-900/20' },
        { id: 'gallery', icon: 'image', label: 'Gallery', color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
        { id: 'document', icon: 'folder', label: 'Document', color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' },
        { id: 'voice', icon: 'mic', label: 'Voice Note', color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
    ];

    return (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />
            <div className="relative w-full bg-background rounded-t-[24px] shadow-2xl p-4 pb-8 animate-slide-up">
                {/* Handle */}
                <div className="w-full flex justify-center mb-4">
                    <div className="w-12 h-1.5 rounded-full bg-secondary"></div>
                </div>

                {/* Header */}
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-lg font-bold text-foreground">Attachments</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary text-muted-foreground">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Outstanding Request */}
                <div className="mb-6">
                    <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 group active:scale-[0.98] transition-all">
                        <div className="size-10 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-200 flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-[20px]">assignment_late</span>
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Upload Required Doc</p>
                            <p className="text-xs text-muted-foreground">Permission Slip for Science Fair</p>
                        </div>
                        <span className="material-symbols-outlined text-orange-400">chevron_right</span>
                    </button>
                </div>

                {/* Grid Options */}
                <div className="grid grid-cols-4 gap-4 px-1">
                    {OPTIONS.map(opt => (
                        <button key={opt.id} onClick={() => onSelect(opt.id)} className="flex flex-col items-center gap-2 group">
                            <div className={`size-14 rounded-2xl ${opt.color} flex items-center justify-center group-hover:opacity-80 transition-opacity`}>
                                <span className="material-symbols-outlined text-[28px]">{opt.icon}</span>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
