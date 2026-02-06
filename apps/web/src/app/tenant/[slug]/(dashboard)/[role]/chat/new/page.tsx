'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Search, X, UserPlus, Users } from 'lucide-react';

// ============================================================
// NEW CHAT / DIRECTORY - Messenger-style contact selection
// ============================================================

interface Contact {
    id: string;
    name: string;
    avatar?: string;
    role: string;
    department?: string;
    isRecent?: boolean;
    isSuggested?: boolean;
}

const MOCK_CONTACTS: Contact[] = [
    // Suggested (Child's teachers)
    { id: 'teacher-1', name: 'Mrs. Smith', role: 'Class Teacher • Grade 5', isSuggested: true },
    { id: 'teacher-2', name: 'Mr. Johnson', role: 'Math Teacher', isSuggested: true },
    { id: 'teacher-3', name: 'Ms. Davis', role: 'Science Teacher', isSuggested: true },
    // Recent
    { id: 'admin-1', name: 'Admin Office', role: 'Administration', isRecent: true },
    { id: 'nurse-1', name: 'School Nurse', role: 'Health Services', isRecent: true },
    // Staff Directory
    { id: 'principal', name: 'Mr. Thompson', role: 'Principal', department: 'Leadership' },
    { id: 'vp', name: 'Mrs. Roberts', role: 'Vice Principal', department: 'Leadership' },
    { id: 'counsellor', name: 'Dr. Wilson', role: 'School Counsellor', department: 'Support' },
    { id: 'finance', name: 'Finance Office', role: 'Fees & Payments', department: 'Administration' },
    { id: 'transport', name: 'Transport Office', role: 'Bus Services', department: 'Operations' },
];

const QUICK_ACTIONS = [
    { id: 'support', label: 'Support Ticket', icon: 'support_agent', href: '/chat/support' },
];

export default function NewChatPage() {
    const params = useParams();
    const router = useRouter();
    const tenantSlug = params.slug as string;
    const role = params.role as string || 'parent';

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

    const basePath = `/tenant/${tenantSlug}/${role}`;

    // Filter contacts by search
    const filteredContacts = useMemo(() => {
        if (!searchQuery.trim()) return MOCK_CONTACTS;
        const q = searchQuery.toLowerCase();
        return MOCK_CONTACTS.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.role.toLowerCase().includes(q) ||
            c.department?.toLowerCase().includes(q)
        );
    }, [searchQuery]);

    // Group contacts
    const suggested = filteredContacts.filter(c => c.isSuggested);
    const recent = filteredContacts.filter(c => c.isRecent);
    const directory = filteredContacts.filter(c => !c.isSuggested && !c.isRecent);

    // Start conversation
    const handleSelectContact = (contactId: string) => {
        // For DM, navigate directly to a new thread
        router.push(`${basePath}/chat/thread/new-${contactId}`);
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <header className="flex items-center gap-3 px-2 sm:px-4 py-3 border-b border-border sticky top-0 bg-background z-10">
                <Link
                    href={`${basePath}/chat`}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors -ml-1"
                    aria-label="Go back"
                >
                    <ChevronLeft size={24} />
                </Link>
                <div className="flex-1">
                    <h1 className="font-semibold text-base">New Message</h1>
                    {selectedContacts.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {selectedContacts.length} selected
                        </p>
                    )}
                </div>
            </header>

            {/* Search */}
            <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2 px-3 py-2.5 bg-secondary/50 border border-border rounded-xl">
                    <Search size={18} className="text-muted-foreground shrink-0" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search staff..."
                        className="flex-1 bg-transparent text-sm focus:outline-none"
                        autoFocus
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')}>
                            <X size={16} className="text-muted-foreground" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Quick Actions (Support ticket, etc.) */}
                {!searchQuery && role === 'parent' && (
                    <div className="p-4 border-b border-border">
                        <div className="flex gap-2">
                            {QUICK_ACTIONS.map((action) => (
                                <Link
                                    key={action.id}
                                    href={`${basePath}${action.href}`}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-secondary/70 rounded-full text-sm font-medium hover:bg-secondary transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg text-primary">
                                        {action.icon}
                                    </span>
                                    {action.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Suggested Contacts */}
                {suggested.length > 0 && (
                    <div className="p-4">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Suggested
                        </h3>
                        <div className="space-y-1">
                            {suggested.map((contact) => (
                                <ContactRow
                                    key={contact.id}
                                    contact={contact}
                                    onSelect={() => handleSelectContact(contact.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Contacts */}
                {recent.length > 0 && !searchQuery && (
                    <div className="p-4 pt-0">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Recent
                        </h3>
                        <div className="space-y-1">
                            {recent.map((contact) => (
                                <ContactRow
                                    key={contact.id}
                                    contact={contact}
                                    onSelect={() => handleSelectContact(contact.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Staff Directory */}
                {directory.length > 0 && (
                    <div className="p-4 pt-0">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Staff Directory
                        </h3>
                        <div className="space-y-1">
                            {directory.map((contact) => (
                                <ContactRow
                                    key={contact.id}
                                    contact={contact}
                                    onSelect={() => handleSelectContact(contact.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {filteredContacts.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                        <span className="material-symbols-outlined text-5xl text-muted-foreground/50 mb-3">
                            person_search
                        </span>
                        <p className="text-muted-foreground font-medium">No contacts found</p>
                        <p className="text-sm text-muted-foreground/70">
                            Try a different search term
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================
// CONTACT ROW
// ============================================================

interface ContactRowProps {
    contact: Contact;
    onSelect: () => void;
    selected?: boolean;
}

function ContactRow({ contact, onSelect, selected = false }: ContactRowProps) {
    return (
        <button
            onClick={onSelect}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${selected ? 'bg-primary/10' : 'hover:bg-secondary/50'
                }`}
        >
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {contact.avatar || contact.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-[15px] truncate">{contact.name}</p>
                <p className="text-xs text-muted-foreground truncate">{contact.role}</p>
            </div>
            {selected && (
                <span className="material-symbols-outlined text-primary">check_circle</span>
            )}
        </button>
    );
}
