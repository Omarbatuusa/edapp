import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: any;
    onApprove: (comment?: string) => void;
    onReject: (reason: string) => void;
}

export function ApprovalModal({ isOpen, onClose, item, onApprove, onReject }: ApprovalModalProps) {
    const [comment, setComment] = useState('');
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);

    const handleSubmit = () => {
        if (action === 'approve') {
            onApprove(comment);
        } else if (action === 'reject') {
            onReject(comment);
        }
        onClose();
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative z-10"
            >
                {/* Header */}
                <div className="p-6 pb-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${item.type === 'approval' ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'
                        }`}>
                        <span className="material-symbols-outlined text-2xl">
                            {item.type === 'approval' ? 'verified' : 'fact_check'}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold">{item.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{item.subtitle}</p>
                </div>

                {/* Details (Mock) */}
                <div className="p-6 py-4 space-y-3">
                    <div className="bg-secondary/30 rounded-xl p-3 text-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Requested By</span>
                            <span className="font-bold">Mrs. Krabappel</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Date</span>
                            <span className="font-bold">Oct 12, 2025</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <span className="font-bold capitalize">{item.type}</span>
                        </div>
                    </div>

                    {/* Action Selector */}
                    {!action ? (
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => setAction('reject')}
                                className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl border-2 border-transparent bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                                <span className="material-symbols-outlined text-3xl">cancel</span>
                                <span className="font-bold text-sm">Reject</span>
                            </button>
                            <button
                                onClick={() => setAction('approve')}
                                className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl border-2 border-transparent bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                            >
                                <span className="material-symbols-outlined text-3xl">check_circle</span>
                                <span className="font-bold text-sm">Approve</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-2 font-bold">
                                <button onClick={() => setAction(null)} className="text-muted-foreground hover:text-foreground">
                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                </button>
                                <span className={action === 'approve' ? 'text-green-600' : 'text-red-600'}>
                                    {action === 'approve' ? 'Approve Request' : 'Reject Request'}
                                </span>
                            </div>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder={action === 'approve' ? "Optional comment..." : "Reason for rejection..."}
                                className="w-full p-3 bg-secondary/30 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                                autoFocus
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={action === 'reject' && !comment}
                                className={`w-full py-3 font-bold text-white rounded-xl shadow-md disabled:opacity-50 transition-colors ${action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
