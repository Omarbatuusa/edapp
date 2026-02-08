import React, { useState } from 'react';
import { ScreenStackBase } from './ScreenStack';
import { MOCK_ACTIONS } from './mockData';
import { ApprovalModal } from './ApprovalModal';

export function ActionRequiredView({ onClose }: { onClose: () => void }) {
    const [activeTab, setActiveTab] = useState('all');
    const [selectedAction, setSelectedAction] = useState<any>(null);

    const TABS = [
        { id: 'all', label: 'All' },
        { id: 'acknowledgement', label: 'Acknowledge' },
        { id: 'approval', label: 'Approve' },
        { id: 'payment', label: 'Pay' },
        { id: 'review', label: 'Review' },
        { id: 'upload', label: 'Upload' },
    ];

    const filteredActions = activeTab === 'all'
        ? MOCK_ACTIONS
        : MOCK_ACTIONS.filter(a => a.type === activeTab);

    const handleActionClick = (action: any) => {
        if (action.type === 'approval') {
            setSelectedAction(action);
        }
    };

    return (
        <ScreenStackBase>
            {/* Header */}
            <div className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border/50">
                <div className="flex items-center px-4 h-14 gap-3">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-secondary/80 transition-colors"
                    >
                        <span className="material-symbols-outlined text-foreground">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold flex-1">Action Center</h1>
                </div>

                {/* Tabs - CSS instead of framer-motion layoutId */}
                <div className="flex overflow-x-auto no-scrollbar px-4 pb-0 mask-fade-right gap-6 border-b border-border/50">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-sm font-medium transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full transition-all duration-300" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 pb-20">
                {filteredActions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <span className="material-symbols-outlined text-4xl mb-2">assignment_turned_in</span>
                        <p className="text-sm">No pending actions</p>
                    </div>
                ) : (
                    filteredActions.map(action => (
                        <ActionCard
                            key={action.id}
                            action={action}
                            onClick={() => handleActionClick(action)}
                        />
                    ))
                )}
            </div>

            {/* Approval Modal */}
            <ApprovalModal
                isOpen={!!selectedAction}
                onClose={() => setSelectedAction(null)}
                item={selectedAction}
                onApprove={(comment) => console.log('Approved:', selectedAction?.id, comment)}
                onReject={(reason) => console.log('Rejected:', selectedAction?.id, reason)}
            />
        </ScreenStackBase>
    );
}

function ActionCard({ action, onClick }: { action: any, onClick: () => void }) {
    const iconMap: any = {
        acknowledgement: 'visibility',
        approval: 'check_circle',
        payment: 'payments',
        review: 'rate_review',
        upload: 'upload_file'
    };

    const colorMap: any = {
        acknowledgement: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        approval: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        payment: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        upload: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    };

    return (
        <div
            onClick={onClick}
            className="bg-card border border-border rounded-2xl p-4 flex gap-4 shadow-sm active:scale-[0.99] transition-transform cursor-pointer hover:border-primary/50"
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[action.type] || 'bg-secondary'}`}>
                <span className="material-symbols-outlined text-2xl">{iconMap[action.type] || 'task'}</span>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{action.type}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${action.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-secondary text-muted-foreground'
                        }`}>
                        {action.due}
                    </span>
                </div>
                <h3 className="font-bold text-base leading-tight mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{action.subtitle}</p>

                <div className="mt-3 flex gap-2">
                    <button className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors">
                        {getActionLabel(action.type)}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // Logic for 'Later'
                        }}
                        className="px-3 bg-secondary text-foreground text-xs font-bold py-2 rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                        Later
                    </button>
                </div>
            </div>
        </div>
    );
}

function getActionLabel(type: string) {
    if (type === 'acknowledgement') return 'Read & Acknowledge';
    if (type === 'approval') return 'Review Request';
    if (type === 'payment') return 'Pay Now';
    if (type === 'upload') return 'Upload Document';
    return 'Complete Action';
}
