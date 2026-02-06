'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Shield, AlertTriangle, HeartPulse, MessageCircleWarning, Users, Phone } from 'lucide-react';

// ============================================================
// EMERGENCY HUB - Safeguarding ticket creation
// ============================================================

export interface EmergencyHubProps {
    tenantSlug: string;
    role: string;
    onClose?: () => void;
    isPanel?: boolean; // If shown as sheet/panel vs full page
}

interface EmergencyCategory {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const CATEGORIES: EmergencyCategory[] = [
    {
        id: 'bullying',
        label: 'Bullying / Harassment',
        description: 'Report bullying, teasing, or harassment',
        icon: <Users size={24} />,
        color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    },
    {
        id: 'unsafe',
        label: 'I feel unsafe',
        description: 'Something is making you feel unsafe',
        icon: <AlertTriangle size={24} />,
        color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
    },
    {
        id: 'sick',
        label: 'Sick / Need nurse',
        description: 'I\'m not feeling well and need help',
        icon: <HeartPulse size={24} />,
        color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
    },
    {
        id: 'counsellor',
        label: 'Need counsellor',
        description: 'I need to talk to someone',
        icon: <MessageCircleWarning size={24} />,
        color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
    },
    {
        id: 'incident',
        label: 'Report incident',
        description: 'Something happened that needs attention',
        icon: <Shield size={24} />,
        color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    },
];

export function EmergencyHub({ tenantSlug, role, onClose, isPanel = false }: EmergencyHubProps) {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!selectedCategory) return;

        setIsSubmitting(true);
        // TODO: Submit to API
        console.log('Creating safeguarding ticket:', { category: selectedCategory, description });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsSubmitting(false);
        // Navigate to the created ticket
        router.push(`/tenant/${tenantSlug}/${role}/chat/thread/safeguarding-new`);
    };

    const handleBack = () => {
        if (selectedCategory) {
            setSelectedCategory(null);
            setDescription('');
        } else if (onClose) {
            onClose();
        } else {
            router.back();
        }
    };

    return (
        <div className={`flex flex-col ${isPanel ? 'h-full' : 'min-h-screen'} bg-background`}>
            {/* Header */}
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border sticky top-0 bg-background z-10">
                <button
                    onClick={handleBack}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors -ml-2"
                    aria-label="Go back"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <h1 className="font-semibold text-lg">Emergency Hub</h1>
                    {selectedCategory && (
                        <p className="text-xs text-muted-foreground">
                            {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                        </p>
                    )}
                </div>
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <Shield size={20} className="text-red-600 dark:text-red-400" />
                </div>
            </header>

            {!selectedCategory ? (
                /* Category Selection */
                <div className="flex-1 p-4 overflow-y-auto">
                    {/* Trust Message */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-6">
                        <p className="text-blue-800 dark:text-blue-200 font-medium text-center">
                            ✨ This goes to the right people at school.
                        </p>
                        <p className="text-blue-600 dark:text-blue-300 text-sm text-center mt-1">
                            Your message will be handled with care and confidentiality.
                        </p>
                    </div>

                    {/* Categories */}
                    <div className="space-y-3">
                        {CATEGORIES.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:bg-secondary/50 transition-colors text-left"
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${category.color}`}>
                                    {category.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium">{category.label}</h3>
                                    <p className="text-sm text-muted-foreground">{category.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Emergency Call */}
                    <div className="mt-6 pt-6 border-t border-border">
                        <p className="text-sm text-muted-foreground text-center mb-3">
                            For immediate emergencies
                        </p>
                        <a
                            href="tel:911"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                        >
                            <Phone size={18} />
                            Call Emergency Services
                        </a>
                    </div>
                </div>
            ) : (
                /* Description Form */
                <div className="flex-1 p-4 flex flex-col">
                    <p className="text-sm text-muted-foreground mb-4">
                        Tell us what's happening. Share as much or as little as you feel comfortable with.
                    </p>

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What's going on? (optional)"
                        className="flex-1 min-h-[200px] p-4 bg-secondary/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />

                    <div className="mt-4 space-y-3">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Sending...' : 'Send to school'}
                        </button>
                        <p className="text-xs text-muted-foreground text-center">
                            🔒 This is private and will only be seen by trusted staff
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
