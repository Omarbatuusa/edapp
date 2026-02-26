'use client';

import { useState } from 'react';
import {
    Search,
    Edit,
    Inbox,
    Send,
    Archive,
    Star,
    MoreVertical,
    Paperclip,
    Smile,
    Reply,
    ChevronLeft
} from 'lucide-react';

const MOCK_THREADS = [
    {
        id: 1,
        sender: 'Principal Skinner',
        subject: 'Term 1 Exam Schedule Finalized',
        preview: 'Dear Staff, please find attached the final exam schedule...',
        time: '10:42 AM',
        avatar: 'PS',
        unread: true,
        type: 'announcement'
    },
    {
        id: 2,
        sender: 'Marge Simpson',
        subject: 'Bart\'s Absence',
        preview: 'Hi, Bart will be unable to attend school next Tuesday due to...',
        time: 'Yesterday',
        avatar: 'MS',
        unread: false,
        type: 'dm'
    },
    {
        id: 3,
        sender: 'System',
        subject: 'Weekly Attendance Report',
        preview: 'Your class attendance for the week ending Feb 12 was 94%...',
        time: 'Feb 12',
        avatar: 'SYS',
        unread: false,
        type: 'notification'
    }
];

export default function MessagesPage() {
    const [selectedThread, setSelectedThread] = useState<number | null>(1);

    return (
        <div className="h-[calc(100vh-80px)] flex ios-card overflow-hidden p-0 max-w-[1600px] mx-auto w-full md:mt-6 border border-[hsl(var(--admin-border))] shadow-xl">
            {/* Left Pane: Folders (Hidden on mobile) */}
            <div className="w-64 border-r border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))] hidden md:flex flex-col">
                <div className="p-5">
                    <button className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--admin-primary))] text-white py-3 rounded-[12px] font-bold text-[15px] shadow-sm hover:bg-[hsl(var(--admin-primary))/0.9] active:scale-95 transition-all">
                        <Edit size={18} />
                        Compose
                    </button>
                </div>

                <nav className="flex-1 px-3 space-y-1.5 pt-2">
                    <NavItem icon={Inbox} label="Inbox" count={3} active />
                    <NavItem icon={Star} label="Starred" />
                    <NavItem icon={Send} label="Sent" />
                    <NavItem icon={Archive} label="Archived" />
                </nav>

                <div className="p-5 border-t border-[hsl(var(--admin-border))]">
                    <p className="text-[11px] font-bold text-[hsl(var(--admin-text-sub))] uppercase tracking-widest mx-1 mb-3">Labels</p>
                    <div className="space-y-1.5">
                        <LabelItem color="bg-[hsl(var(--admin-danger))]" label="Urgent" />
                        <LabelItem color="bg-[hsl(var(--admin-primary))]" label="Staff" />
                        <LabelItem color="bg-[hsl(var(--admin-success))]" label="Parents" />
                    </div>
                </div>
            </div>

            {/* Middle Pane: Thread List */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-[hsl(var(--admin-border))] flex flex-col bg-[hsl(var(--admin-surface))] ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-[hsl(var(--admin-border))]">
                    <div className="relative">
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--admin-text-muted))]" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full bg-[hsl(var(--admin-surface-alt))] pl-10 pr-4 py-2.5 rounded-[12px] text-[15px] font-medium border border-[hsl(var(--admin-border))] focus:ring-2 focus:ring-[hsl(var(--admin-primary))/0.3] outline-none transition-all placeholder:text-[hsl(var(--admin-text-muted))]"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {MOCK_THREADS.map(thread => (
                        <div
                            key={thread.id}
                            onClick={() => setSelectedThread(thread.id)}
                            className={`p-4 border-b border-[hsl(var(--admin-border))] cursor-pointer hover:bg-[hsl(var(--admin-surface-alt))] transition-colors ${selectedThread === thread.id ? 'bg-[hsl(var(--admin-primary))/0.05] border-l-4 border-l-[hsl(var(--admin-primary))]' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex justify-between items-start mb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold text-[15px] ${thread.unread ? 'text-[hsl(var(--admin-text-main))]' : 'text-[hsl(var(--admin-text-sub))]'}`}>{thread.sender}</span>
                                    {thread.unread && <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--admin-primary))]" />}
                                </div>
                                <span className="text-[12px] font-medium text-[hsl(var(--admin-text-muted))]">{thread.time}</span>
                            </div>
                            <h4 className={`text-[14px] mb-1.5 line-clamp-1 ${thread.unread ? 'font-bold text-[hsl(var(--admin-text-main))]' : 'font-semibold text-[hsl(var(--admin-text-sub))]'}`}>{thread.subject}</h4>
                            <p className="text-[13px] font-medium text-[hsl(var(--admin-text-muted))] line-clamp-2 leading-snug">{thread.preview}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Pane: Message Content */}
            <div className={`flex-1 flex flex-col bg-[hsl(var(--admin-surface))] ${!selectedThread ? 'hidden md:flex' : 'flex'}`}>
                {selectedThread ? (
                    <>
                        <div className="h-[72px] flex items-center justify-between px-6 border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))]">
                            <div className="flex items-center gap-4">
                                <button className="md:hidden" onClick={() => setSelectedThread(null)}>
                                    <ChevronLeft size={24} className="text-[hsl(var(--admin-text-sub))] hover:text-[hsl(var(--admin-text-main))]" />
                                </button>
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center font-bold text-[15px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))]">PS</div>
                                    <div>
                                        <h3 className="font-bold text-[16px] text-[hsl(var(--admin-text-main))] tracking-tight">Principal Skinner</h3>
                                        <p className="text-[13px] font-medium text-[hsl(var(--admin-text-sub))]">to Staff</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <IconButton icon={Star} />
                                <IconButton icon={Archive} />
                                <IconButton icon={MoreVertical} />
                            </div>
                        </div>

                        <div className="flex-1 p-8 overflow-y-auto">
                            <h2 className="text-[24px] font-bold mb-8 tracking-tight text-[hsl(var(--admin-text-main))]">Term 1 Exam Schedule Finalized</h2>
                            <div className="prose dark:prose-invert text-[15px] max-w-none text-[hsl(var(--admin-text-sub))] leading-relaxed font-medium">
                                <p>Dear Staff,</p>
                                <p>Please find attached the final exam schedule for Term 1. Note the changes to the Grade 10 Mathematics slot, which has been moved to Tuesday morning to accommodate the sports festival.</p>
                                <p>Please ensure all students are informed by Friday assembly.</p>
                                <p>Regards,<br />Seymour Skinner</p>
                            </div>

                            <div className="mt-10 p-4 rounded-[16px] bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border))] max-w-sm flex items-center gap-4 hover:border-[hsl(var(--admin-danger))/0.5] transition-colors cursor-pointer group">
                                <div className="w-12 h-12 bg-[hsl(var(--admin-danger))/0.1] rounded-[12px] flex items-center justify-center text-[hsl(var(--admin-danger))] group-hover:scale-110 transition-transform">
                                    <Paperclip size={22} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-bold truncate text-[hsl(var(--admin-text-main))] mb-0.5">Exam_Schedule_T1_Final_v2.pdf</p>
                                    <p className="text-[12px] font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider">245 KB</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))]">
                            <div className="flex gap-3 bg-[hsl(var(--admin-surface-alt))] p-2.5 rounded-[20px] border border-[hsl(var(--admin-border))]">
                                <button className="p-2.5 text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-surface))] rounded-[12px] transition-colors">
                                    <Paperclip size={22} />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Reply to Principal Skinner..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] font-medium text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))]"
                                />
                                <button className="p-2.5 text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-surface))] rounded-[12px] transition-colors">
                                    <Smile size={22} />
                                </button>
                                <button className="px-5 bg-[hsl(var(--admin-primary))] text-white rounded-[12px] font-bold text-[14px] hover:bg-[hsl(var(--admin-primary))/0.9] active:scale-95 transition-all shadow-sm">
                                    Reply
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[hsl(var(--admin-text-sub))]">
                        <Inbox size={64} className="mb-6 opacity-20 text-[hsl(var(--admin-text-muted))]" />
                        <p className="text-[17px] font-medium">Select a message to read</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function NavItem({ icon: Icon, label, count, active }: any) {
    return (
        <button className={`w-full flex items-center justify-between px-4 py-3 rounded-[12px] text-[15px] font-semibold transition-colors ${active ? 'bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-text-main))] shadow-sm' : 'text-[hsl(var(--admin-text-sub))] hover:text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-surface))/0.5]'}`}>
            <div className="flex items-center gap-4">
                <Icon size={20} className={active ? 'text-[hsl(var(--admin-primary))]' : ''} />
                {label}
            </div>
            {count && <span className="text-[12px] font-bold bg-[hsl(var(--admin-primary))] text-white px-2 py-0.5 rounded-full shadow-sm">{count}</span>}
        </button>
    )
}

function LabelItem({ color, label }: any) {
    return (
        <button className="w-full flex items-center gap-4 px-4 py-2.5 rounded-[12px] text-[14px] font-semibold text-[hsl(var(--admin-text-sub))] hover:text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-surface))/0.5] transition-colors">
            <span className={`w-3 h-3 rounded-full shadow-sm ${color}`} />
            {label}
        </button>
    )
}

function IconButton({ icon: Icon }: any) {
    return (
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text-main))] transition-colors active:scale-95">
            <Icon size={20} />
        </button>
    )
}
