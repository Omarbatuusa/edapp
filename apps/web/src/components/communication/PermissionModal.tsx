import React from 'react';

interface PermissionModalProps {
    isOpen: boolean;
    type: 'camera' | 'microphone';
    onAllow: () => void;
    onDeny: () => void;
}

export function PermissionModal({ isOpen, type, onAllow, onDeny }: PermissionModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
            <div className="relative w-full max-w-xs bg-background rounded-2xl shadow-2xl p-6 text-center animate-slide-up">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${type === 'camera' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                    <span className="material-symbols-outlined text-3xl">{type === 'camera' ? 'photo_camera' : 'mic'}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">Allow "{type === 'camera' ? 'EdApp' : 'EdApp'}" to access your {type}?</h3>
                <p className="text-sm text-muted-foreground mb-6">This allows you to {type === 'camera' ? 'take photos and videos' : 'record voice notes'} directly within the app.</p>
                <div className="flex flex-col gap-3">
                    <button onClick={onAllow} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity">
                        Allow Access
                    </button>
                    <button onClick={onDeny} className="w-full py-3 text-primary font-bold hover:bg-secondary rounded-xl transition-colors">
                        Don't Allow
                    </button>
                </div>
            </div>
        </div>
    );
}
