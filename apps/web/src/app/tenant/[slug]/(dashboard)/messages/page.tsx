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
    Reply
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
        <div className="h-[calc(100vh-80px)] flex surface-card overflow-hidden p-0">
            {/* Left Pane: Folders (Hidden on mobile) */}
            <div className="w-64 border-r border-border/40 bg-secondary/10 hidden md:flex flex-col">
                <div className="p-4">
                    <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity">
                        <Edit size={16} />
                        Compose
                    </button>
                </div>

                <nav className="flex-1 px-2 space-y-1">
                    <NavItem icon={Inbox} label="Inbox" count={3} active />
                    <NavItem icon={Star} label="Starred" />
                    <NavItem icon={Send} label="Sent" />
                    <NavItem icon={Archive} label="Archived" />
                </nav>

                <div className="p-4 border-t border-border/40">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Labels</p>
                    <div className="space-y-1">
                        <LabelItem color="bg-red-500" label="Urgent" />
                        <LabelItem color="bg-blue-500" label="Staff" />
                        <LabelItem color="bg-green-500" label="Parents" />
                    </div>
                </div>
            </div>

            {/* Middle Pane: Thread List */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-border/40 flex flex-col ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-3 border-b border-border/40">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full bg-secondary/50 pl-9 pr-4 py-2 rounded-lg text-sm border-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {MOCK_THREADS.map(thread => (
                        <div
                            key={thread.id}
                            onClick={() => setSelectedThread(thread.id)}
                            className={`p-4 border-b border-border/40 cursor-pointer hover:bg-secondary/40 transition-colors ${selectedThread === thread.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <span className={`font-semibold text-sm ${thread.unread ? 'text-foreground' : 'text-muted-foreground'}`}>{thread.sender}</span>
                                    {thread.unread && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                                </div>
                                <span className="text-xs text-muted-foreground">{thread.time}</span>
                            </div>
                            <h4 className={`text-sm mb-1 ${thread.unread ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>{thread.subject}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{thread.preview}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Pane: Message Content */}
            <div className={`flex-1 flex flex-col bg-white dark:bg-[#101922] ${!selectedThread ? 'hidden md:flex' : 'flex'}`}>
                {selectedThread ? (
                    <>
                        <div className="h-16 flex items-center justify-between px-6 border-b border-border/40">
                            <div className="flex items-center gap-4">
                                <button className="md:hidden" onClick={() => setSelectedThread(null)}>
                                    <Reply size={20} className="text-muted-foreground" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">PS</div>
                                    <div>
                                        <h3 className="font-bold text-sm">Principal Skinner</h3>
                                        <p className="text-xs text-muted-foreground">to Staff</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <IconButton icon={Star} />
                                <IconButton icon={Archive} />
                                <IconButton icon={MoreVertical} />
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto">
                            <h2 className="text-xl font-bold mb-6">Term 1 Exam Schedule Finalized</h2>
                            <div className="prose dark:prose-invert text-sm max-w-none text-foreground/90">
                                <p>Dear Staff,</p>
                                <p>Please find attached the final exam schedule for Term 1. Note the changes to the Grade 10 Mathematics slot, which has been moved to Tuesday morning to accommodate the sports festival.</p>
                                <p>Please ensure all students are informed by Friday assembly.</p>
                                <p>Regards,<br />Seymour Skinner</p>
                            </div>

                            <div className="mt-8 p-4 rounded-lg bg-secondary/30 border border-border/50 max-w-sm flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center text-red-600">
                                    <Paperclip size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">Exam_Schedule_T1_Final_v2.pdf</p>
                                    <p className="text-xs text-muted-foreground">245 KB</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-border/40">
                            <div className="flex gap-2 bg-secondary/30 p-2 rounded-xl border border-border/50">
                                <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/5 rounded-lg transition-colors">
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Reply to Principal Skinner..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                                />
                                <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/5 rounded-lg transition-colors">
                                    <Smile size={20} />
                                </button>
                                <button className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <Inbox size={48} className="mb-4 opacity-20" />
                        <p>Select a message to read</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function NavItem({ icon: Icon, label, count, active }: any) {
    return (
        <button className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>
            <div className="flex items-center gap-3">
                <Icon size={18} />
                {label}
            </div>
            {count && <span className="text-xs font-bold bg-background px-1.5 py-0.5 rounded-md shadow-sm">{count}</span>}
        </button>
    )
}

function LabelItem({ color, label }: any) {
    return (
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            {label}
        </button>
    )
}

function IconButton({ icon: Icon }: any) {
    return (
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
            <Icon size={18} />
        </button>
    )
}
