import React, { useState } from 'react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
}

export function ReportModal({ isOpen, onClose, onSubmit }: ReportModalProps) {
    const [reason, setReason] = useState<string | null>(null);
    const [details, setDetails] = useState('');

    const REASONS = [
        'Bullying or Harassment',
        'Hate Speech or Discrimination',
        'Inappropriate Content',
        'Spam or Scam',
        'Other'
    ];

    const handleSubmit = () => {
        if (reason) {
            onSubmit(reason);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />
            <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 fade-in duration-200">
                <div className="p-6 pb-0">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-2xl">flag</span>
                    </div>
                    <h2 className="text-xl font-bold">Report Content</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Reports are anonymous and reviewed by school administration within 24 hours.
                    </p>
                </div>

                <div className="p-4 space-y-2 mt-2 max-h-[50vh] overflow-y-auto">
                    {REASONS.map(r => (
                        <button
                            key={r}
                            onClick={() => setReason(r)}
                            className={`w-full p-3 text-left rounded-xl transition-colors font-medium text-sm flex justify-between items-center ${reason === r ? 'bg-primary text-white' : 'bg-secondary/50 hover:bg-secondary'
                                }`}
                        >
                            {r}
                            {reason === r && <span className="material-symbols-outlined text-[18px]">check</span>}
                        </button>
                    ))}
                    {reason === 'Other' && (
                        <textarea
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            placeholder="Please provide more details..."
                            className="w-full mt-2 p-3 bg-secondary/30 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                        />
                    )}
                </div>

                <div className="p-4 bg-secondary/30 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 font-bold text-muted-foreground hover:bg-secondary rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!reason}
                        className="flex-1 py-3 font-bold bg-red-600 text-white rounded-xl shadow-md disabled:opacity-50 disabled:shadow-none hover:bg-red-700 transition-colors"
                    >
                        Submit Report
                    </button>
                </div>
            </div>
        </div>
    );
}
