'use client';

import { useParams } from 'next/navigation';
import { SubPageHeader, SubPageWrapper } from '@/components/parent/SubPageHeader';

const MOCK_CHATS = [
    { id: '1', name: 'Mrs. Smith (Class Teacher)', avatar: 'MS', lastMessage: 'Thank you for the update!', time: '10:30 AM', unread: 2 },
    { id: '2', name: 'Sports Department', avatar: 'SD', lastMessage: 'Soccer practice moved to 3pm', time: 'Yesterday', unread: 0 },
    { id: '3', name: 'Admin Office', avatar: 'AO', lastMessage: 'Your payment has been received', time: 'Mon', unread: 0 },
];

export default function ChatPage() {
    const params = useParams();
    const tenantSlug = params.slug as string;

    return (
        <SubPageWrapper>
            <SubPageHeader
                title="Messages"
                backHref={`/tenant/${tenantSlug}/parent`}
            />

            <div className="space-y-2">
                {MOCK_CHATS.map((chat) => (
                    <div
                        key={chat.id}
                        className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-secondary/30 transition-colors cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-primary font-semibold text-sm">{chat.avatar}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm truncate">{chat.name}</h4>
                                <span className="text-xs text-muted-foreground shrink-0">{chat.time}</span>
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                                {chat.unread > 0 && (
                                    <span className="ml-2 min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                                        {chat.unread}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {MOCK_CHATS.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <span className="material-symbols-outlined text-4xl mb-2">chat</span>
                    <p className="font-medium">No messages yet</p>
                    <p className="text-sm mt-1">Start a conversation with a teacher or staff</p>
                </div>
            )}
        </SubPageWrapper>
    );
}
