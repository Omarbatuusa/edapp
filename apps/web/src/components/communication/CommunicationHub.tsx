'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Search, Plus } from 'lucide-react';

// ============================================================
// COMMUNICATION HUB - Redesigned with tabs and rich cards
// ============================================================

type TabType = 'announcements' | 'messages' | 'support';

interface CommunicationHubProps {
    officeHours?: string;
}

// Mock data for announcements
const MOCK_ANNOUNCEMENTS = [
    {
        id: 'ann-1',
        type: 'urgent',
        category: 'Alert',
        title: 'School Closed on Monday due to Weather',
        source: "Principal's Office",
        timestamp: '2 hours ago',
        image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
        likes: 42,
        hearts: 18,
    },
    {
        id: 'ann-2',
        type: 'event',
        category: 'EVENT',
        title: 'Annual Sports Day Registration Open',
        preview: 'Please register your child for the upcoming inter-house athletics competition...',
        source: 'Coach Sithole',
        sourceIcon: 'sports_soccer',
        timestamp: 'Yesterday',
        image: 'https://images.unsplash.com/photo-1461896836934- voices-in-the-wind-0?w=400&q=80',
    },
    {
        id: 'ann-3',
        type: 'academic',
        category: 'ACADEMIC',
        title: 'Term 2 Report Cards Available',
        preview: 'Report cards for the second term have been finalized and are now available for download.',
        source: 'Admin',
        sourceIcon: 'assignment',
        timestamp: '2 days ago',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80',
        hasDownload: true,
    },
];

export function CommunicationHub({
    officeHours = 'Mon-Fri, 8 AM - 3 PM',
}: CommunicationHubProps) {
    const params = useParams();
    const router = useRouter();
    const tenantSlug = params.slug as string;

    const [activeTab, setActiveTab] = useState<TabType>('announcements');
    const [searchQuery, setSearchQuery] = useState('');

    const unreadMessages = 3; // Mock unread count

    return (
        <div className="relative flex flex-col min-h-full bg-background">
            {/* ============================================ */}
            {/* TOP APP BAR */}
            {/* ============================================ */}
            <header className="flex items-center bg-background px-4 py-3 justify-between sticky top-0 z-20 border-b border-border">
                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="flex size-10 shrink-0 items-center justify-center text-foreground hover:opacity-70 transition-opacity"
                >
                    <ChevronLeft size={24} />
                </button>

                {/* Title */}
                <h2 className="text-foreground text-lg font-bold leading-tight tracking-tight flex-1 text-center">
                    Communication Hub
                </h2>

                {/* Translate button */}
                <button className="flex items-center gap-1 text-primary hover:opacity-80 transition-opacity">
                    <span className="material-symbols-outlined text-xl">translate</span>
                    <span className="text-sm font-bold hidden sm:block">Translate</span>
                </button>
            </header>

            {/* ============================================ */}
            {/* OFFICE HOURS BANNER */}
            {/* ============================================ */}
            <div className="bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                <p className="text-muted-foreground text-xs font-medium text-center">
                    Office Hours: {officeHours}. Responses may be delayed.
                </p>
            </div>

            {/* ============================================ */}
            {/* TABS */}
            {/* ============================================ */}
            <div className="bg-background sticky top-[57px] z-10">
                <div className="flex border-b border-border px-4">
                    <button
                        onClick={() => setActiveTab('announcements')}
                        className={`flex-1 py-3 text-sm font-bold border-b-[3px] transition-colors ${activeTab === 'announcements'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Announcements
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`flex-1 py-3 text-sm font-bold border-b-[3px] transition-colors relative ${activeTab === 'messages'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Messages
                        {unreadMessages > 0 && (
                            <span className="absolute top-2 right-1/4 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('support')}
                        className={`flex-1 py-3 text-sm font-bold border-b-[3px] transition-colors ${activeTab === 'support'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Support
                    </button>
                </div>
            </div>

            {/* ============================================ */}
            {/* SEARCH BAR */}
            {/* ============================================ */}
            <div className="px-4 py-4 bg-background">
                <div className="flex items-center h-12 rounded-xl bg-muted ring-1 ring-border focus-within:ring-2 focus-within:ring-primary transition-shadow">
                    <div className="flex items-center justify-center pl-4 text-muted-foreground">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${activeTab}...`}
                        className="flex-1 h-full bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <button className="flex items-center justify-center pr-4 text-muted-foreground hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">filter_list</span>
                    </button>
                </div>
            </div>

            {/* ============================================ */}
            {/* CONTENT AREA */}
            {/* ============================================ */}
            <div className="flex-1 overflow-y-auto pb-24 px-4 space-y-4">
                {activeTab === 'announcements' && (
                    <>
                        {/* Urgent Hero Card */}
                        <Link
                            href={`/tenant/${tenantSlug}/parent/announcements/ann-1`}
                            className="block relative group cursor-pointer"
                        >
                            <div
                                className="bg-cover bg-center flex flex-col items-stretch justify-end rounded-2xl pt-40 shadow-lg overflow-hidden relative transition-transform duration-300 hover:scale-[1.01]"
                                style={{
                                    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.8) 100%), url("https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80")`,
                                }}
                            >
                                {/* Urgent badge */}
                                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-pulse">
                                    URGENT
                                </div>

                                <div className="flex w-full flex-col gap-2 p-5 z-10">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-white/90 text-xs font-medium uppercase tracking-wider">Alert</p>
                                        <h3 className="text-white text-2xl font-bold leading-tight drop-shadow-sm">
                                            School Closed on Monday due to Weather
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="bg-white/20 backdrop-blur-sm p-1 rounded-full">
                                                <span className="material-symbols-outlined text-white text-sm">school</span>
                                            </div>
                                            <p className="text-white/90 text-xs font-medium">Principal&apos;s Office • 2 hours ago</p>
                                        </div>
                                    </div>

                                    {/* Reactions */}
                                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/20">
                                        <button className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full px-3 py-1.5 transition-colors">
                                            <span className="material-symbols-outlined text-white text-sm">thumb_up</span>
                                            <span className="text-white text-xs font-medium">42</span>
                                        </button>
                                        <button className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full px-3 py-1.5 transition-colors">
                                            <span className="material-symbols-filled text-red-400 text-sm">favorite</span>
                                            <span className="text-white text-xs font-medium">18</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Standard Cards */}
                        <StandardCard
                            href={`/tenant/${tenantSlug}/parent/announcements/ann-2`}
                            category="EVENT"
                            categoryColor="green"
                            title="Annual Sports Day Registration Open"
                            preview="Please register your child for the upcoming inter-house athletics competition..."
                            source="Coach Sithole"
                            sourceIcon="sports_soccer"
                            sourceIconBg="bg-indigo-100 text-indigo-600"
                            timestamp="Yesterday"
                            image="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80"
                        />

                        <StandardCard
                            href={`/tenant/${tenantSlug}/parent/announcements/ann-3`}
                            category="ACADEMIC"
                            categoryColor="blue"
                            title="Term 2 Report Cards Available"
                            preview="Report cards for the second term have been finalized and are now available for download."
                            source="Admin"
                            sourceIcon="assignment"
                            sourceIconBg="bg-purple-100 text-purple-600"
                            timestamp="2 days ago"
                            image="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80"
                            hasDownload
                        />

                        {/* End of list */}
                        <div className="flex flex-col items-center justify-center py-8">
                            <span className="material-symbols-outlined text-4xl text-muted-foreground/30 mb-2">check_circle</span>
                            <p className="text-muted-foreground/60 text-sm">You&apos;re all caught up!</p>
                        </div>
                    </>
                )}

                {activeTab === 'messages' && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <span className="material-symbols-outlined text-5xl text-muted-foreground/30 mb-3">chat</span>
                        <h3 className="text-base font-medium text-foreground mb-1">Messages</h3>
                        <p className="text-sm text-muted-foreground">Your direct messages will appear here</p>
                    </div>
                )}

                {activeTab === 'support' && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <span className="material-symbols-outlined text-5xl text-muted-foreground/30 mb-3">support_agent</span>
                        <h3 className="text-base font-medium text-foreground mb-1">Support Tickets</h3>
                        <p className="text-sm text-muted-foreground">Your support tickets will appear here</p>
                    </div>
                )}
            </div>

            {/* ============================================ */}
            {/* FLOATING ACTION BUTTON */}
            {/* ============================================ */}
            <button
                className="absolute bottom-6 right-6 z-30 flex items-center justify-center h-14 w-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg shadow-primary/40 transition-all hover:scale-105 active:scale-95"
                onClick={() => console.log('Create new')}
            >
                <span className="material-symbols-outlined text-2xl">edit_square</span>
            </button>
        </div>
    );
}

// ============================================================
// STANDARD CARD COMPONENT
// ============================================================

interface StandardCardProps {
    href: string;
    category: string;
    categoryColor: 'green' | 'blue' | 'amber' | 'purple';
    title: string;
    preview: string;
    source: string;
    sourceIcon: string;
    sourceIconBg: string;
    timestamp: string;
    image: string;
    hasDownload?: boolean;
}

const CATEGORY_COLORS = {
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

function StandardCard({
    href,
    category,
    categoryColor,
    title,
    preview,
    source,
    sourceIcon,
    sourceIconBg,
    timestamp,
    image,
    hasDownload,
}: StandardCardProps) {
    return (
        <Link
            href={href}
            className="block bg-muted rounded-2xl p-4 shadow-sm border border-border hover:shadow-md transition-shadow"
        >
            <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-secondary">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 justify-between py-0.5">
                    <div>
                        <div className="flex justify-between items-start">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${CATEGORY_COLORS[categoryColor]} mb-1`}>
                                {category}
                            </span>
                            <span className="text-xs text-muted-foreground">{timestamp}</span>
                        </div>
                        <h3 className="text-foreground font-bold text-base leading-snug">{title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{preview}</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
                <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${sourceIconBg}`}>
                        <span className="material-symbols-outlined text-[14px]">{sourceIcon}</span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{source}</span>
                </div>
                <div className="flex gap-3 text-muted-foreground">
                    {hasDownload ? (
                        <button
                            onClick={(e) => { e.preventDefault(); }}
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            <span className="text-xs font-bold uppercase">PDF</span>
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={(e) => { e.preventDefault(); }}
                                className="hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">add_reaction</span>
                            </button>
                            <button
                                onClick={(e) => { e.preventDefault(); }}
                                className="hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">share</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default CommunicationHub;
