import React from 'react';

interface PermissionModalProps {
    isOpen: boolean;
    type: 'camera' | 'microphone' | 'storage';
    onAllow: () => void;
    onDeny: () => void;
}

const PERM_CONFIG = {
    camera: {
        icon: 'photo_camera',
        bg: 'bg-blue-100 text-blue-600',
        title: 'Allow "EdApp" to access your camera?',
        desc: 'This allows you to take photos and videos directly within the app.',
    },
    microphone: {
        icon: 'mic',
        bg: 'bg-red-100 text-red-600',
        title: 'Allow "EdApp" to access your microphone?',
        desc: 'This allows you to record voice notes directly within the app.',
    },
    storage: {
        icon: 'folder_open',
        bg: 'bg-purple-100 text-purple-600',
        title: 'Allow "EdApp" to access your photos and files?',
        desc: 'This allows you to attach documents, photos, and videos from your device.',
    },
};

export function PermissionModal({ isOpen, type, onAllow, onDeny }: PermissionModalProps) {
    if (!isOpen) return null;

    const config = PERM_CONFIG[type] || PERM_CONFIG.camera;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
            <div className="relative w-full max-w-xs bg-background rounded-2xl shadow-2xl p-6 text-center animate-slide-up">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${config.bg}`}>
                    <span className="material-symbols-outlined text-3xl">{config.icon}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{config.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{config.desc}</p>
                <div className="flex flex-col gap-3">
                    <button onClick={onAllow} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity">
                        Allow Access
                    </button>
                    <button onClick={onDeny} className="w-full py-3 text-primary font-bold hover:bg-secondary rounded-xl transition-colors">
                        Don&apos;t Allow
                    </button>
                </div>
            </div>
        </div>
    );
}
