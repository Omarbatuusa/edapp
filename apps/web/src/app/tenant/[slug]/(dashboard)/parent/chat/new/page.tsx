'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { SubPageWrapper } from '@/components/parent/SubPageHeader';

const CHAT_CATEGORIES = [
    {
        id: 'educator',
        label: 'Educator / Teacher',
        icon: 'school',
        description: 'Message your child\'s class teacher or subject educators',
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    },
    {
        id: 'grade-head',
        label: 'Grade Head',
        icon: 'supervisor_account',
        description: 'Contact the head of your child\'s grade',
        color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    },
    {
        id: 'accounts',
        label: 'Accounts / Fees',
        icon: 'payments',
        description: 'Queries about fees, payments, or statements',
        color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
    },
    {
        id: 'admissions',
        label: 'Admissions',
        icon: 'how_to_reg',
        description: 'Enrolment, documents, or transfer queries',
        color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
    },
    {
        id: 'transport',
        label: 'Transport',
        icon: 'directions_bus',
        description: 'Bus routes, pickup times, or changes',
        color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
    },
    {
        id: 'it-support',
        label: 'IT Support',
        icon: 'computer',
        description: 'App issues, login problems, technical help',
        color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    },
    {
        id: 'general',
        label: 'General Enquiry',
        icon: 'help',
        description: 'Other questions or feedback',
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
    },
];

const MOCK_EDUCATORS = [
    { id: 'edu-1', name: 'Mrs. Smith', role: 'Class Teacher', grade: 'Grade 5', avatar: 'MS', online: true },
    { id: 'edu-2', name: 'Mr. Johnson', role: 'Mathematics', grade: 'Grade 5', avatar: 'MJ', online: false },
    { id: 'edu-3', name: 'Ms. Williams', role: 'English', grade: 'Grade 5', avatar: 'MW', online: true },
    { id: 'edu-4', name: 'Mrs. Brown', role: 'Science', grade: 'Grade 5', avatar: 'MB', online: false },
    { id: 'edu-5', name: 'Mr. Davis', role: 'History', grade: 'Grade 5', avatar: 'MD', online: false },
];

export default function NewChatPage() {
    const params = useParams();
    const router = useRouter();
    const tenantSlug = params.slug as string;
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleCategorySelect = (categoryId: string) => {
        if (categoryId === 'educator' || categoryId === 'grade-head') {
            setSelectedCategory(categoryId);
        } else {
            // For support categories, go to support ticket creation
            router.push(`/tenant/${tenantSlug}/parent/chat/support/new?category=${categoryId}`);
        }
    };

    const handleEducatorSelect = (educatorId: string) => {
        // Start new chat with educator
        router.push(`/tenant/${tenantSlug}/parent/chat/${educatorId}`);
    };

    const filteredEducators = MOCK_EDUCATORS.filter(edu =>
        edu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        edu.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SubPageWrapper>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href={`/tenant/${tenantSlug}/parent/chat`}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors -ml-2"
                >
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-xl font-bold">
                        {selectedCategory ? 'Select Contact' : 'New Chat'}
                    </h1>
                    {selectedCategory && (
                        <p className="text-xs text-muted-foreground">
                            {CHAT_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                        </p>
                    )}
                </div>
            </div>

            {!selectedCategory ? (
                /* Category Selection */
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-4">Who would you like to contact?</p>
                    {CHAT_CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategorySelect(category.id)}
                            className="flex items-center gap-3 w-full p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all active:scale-[0.98] text-left"
                        >
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${category.color}`}>
                                <span className="material-symbols-outlined">{category.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{category.label}</p>
                                <p className="text-xs text-muted-foreground">{category.description}</p>
                            </div>
                            <ChevronRight size={20} className="text-muted-foreground shrink-0" />
                        </button>
                    ))}
                </div>
            ) : (
                /* Educator/Contact Selection */
                <div>
                    {/* Back to categories */}
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="flex items-center gap-1 text-sm text-primary mb-4 hover:underline"
                    >
                        <ChevronLeft size={16} />
                        Back to categories
                    </button>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search educators..."
                            className="w-full h-11 pl-10 pr-4 bg-secondary rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Educator List */}
                    <div className="space-y-2">
                        {filteredEducators.map((educator) => (
                            <button
                                key={educator.id}
                                onClick={() => handleEducatorSelect(educator.id)}
                                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-secondary/50 transition-all active:scale-[0.98] text-left"
                            >
                                <div className="relative">
                                    <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0" style={{ color: '#fff' }}>
                                        <span className="font-semibold text-sm">{educator.avatar}</span>
                                    </div>
                                    {educator.online && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{educator.name}</p>
                                    <p className="text-xs text-muted-foreground">{educator.role} • {educator.grade}</p>
                                </div>
                                <ChevronRight size={18} className="text-muted-foreground shrink-0" />
                            </button>
                        ))}
                        {filteredEducators.length === 0 && (
                            <div className="text-center py-8">
                                <span className="material-symbols-outlined text-3xl text-muted-foreground">search_off</span>
                                <p className="text-sm text-muted-foreground mt-2">No educators found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </SubPageWrapper>
    );
}
