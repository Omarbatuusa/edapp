'use client';

import Link from 'next/link';

interface Thread {
    id: string;
    name: string;
    initials: string;
    message: string;
    time: string;
    unread?: boolean;
    color: string;
}

const MOCK_THREADS: Thread[] = [
    { id: '1', name: 'Mrs. Khumalo', initials: 'MK', message: 'The exam schedule has been updated for next week...', time: '2m', unread: true, color: 'bg-blue-500' },
    { id: '2', name: 'Mr. Naidoo', initials: 'RN', message: 'Thanks for the feedback on the report.', time: '1h', color: 'bg-green-500' },
    { id: '3', name: 'Admin Office', initials: 'AO', message: 'Reminder: Fee payments are due by Friday.', time: '3h', color: 'bg-purple-500' },
    { id: '4', name: 'Sports Dept', initials: 'SD', message: 'Sports day practice cancelled today.', time: '5h', color: 'bg-teal-500' },
];

interface QuickChatProps {
    basePath: string; // e.g. /tenant/lia/admin
}

export function QuickChat({ basePath }: QuickChatProps) {
    return (
        <div className="ios-card p-0 overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-primary))]">chat</span>
                    Messages
                </h3>
                <Link
                    href={`${basePath}/chat`}
                    className="text-[11px] font-semibold text-[hsl(var(--admin-primary))] hover:underline"
                >
                    View All
                </Link>
            </div>

            <div className="divide-y divide-[hsl(var(--admin-border)/0.5)]">
                {MOCK_THREADS.map(thread => (
                    <Link
                        key={thread.id}
                        href={`${basePath}/chat`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
                    >
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-full ${thread.color} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-[11px] font-bold text-white">{thread.initials}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className={`text-[13px] font-semibold truncate ${thread.unread ? 'text-[hsl(var(--admin-text-main))]' : 'text-[hsl(var(--admin-text-sub))]'}`}>
                                    {thread.name}
                                </span>
                                <span className="text-[10px] text-[hsl(var(--admin-text-muted))] flex-shrink-0 ml-2">{thread.time}</span>
                            </div>
                            <p className={`text-[11px] truncate mt-0.5 ${thread.unread ? 'text-[hsl(var(--admin-text-main))] font-medium' : 'text-[hsl(var(--admin-text-muted))]'}`}>
                                {thread.message}
                            </p>
                        </div>

                        {/* Unread badge */}
                        {thread.unread && (
                            <span className="w-2 h-2 rounded-full bg-[hsl(var(--admin-primary))] flex-shrink-0" />
                        )}
                    </Link>
                ))}
            </div>

            {/* New message button */}
            <div className="px-4 py-3 border-t border-[hsl(var(--admin-border)/0.5)]">
                <Link
                    href={`${basePath}/chat`}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-[hsl(var(--admin-primary)/0.08)] hover:bg-[hsl(var(--admin-primary)/0.15)] transition-colors"
                >
                    <span className="material-symbols-outlined text-[16px] text-[hsl(var(--admin-primary))]">edit_square</span>
                    <span className="text-[12px] font-semibold text-[hsl(var(--admin-primary))]">New Message</span>
                </Link>
            </div>
        </div>
    );
}
