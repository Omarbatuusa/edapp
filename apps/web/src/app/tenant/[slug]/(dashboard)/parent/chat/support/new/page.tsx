'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SubPageHeader, SubPageWrapper } from '@/components/parent/SubPageHeader';

const SUPPORT_CATEGORIES = [
    { id: 'fees', label: 'Fees & Payments', icon: 'payments', description: 'Payment plans, invoices, refunds' },
    { id: 'admissions', label: 'Admissions', icon: 'how_to_reg', description: 'Enrolment, documents, transfers' },
    { id: 'transport', label: 'Transport', icon: 'directions_bus', description: 'Routes, pickup times, changes' },
    { id: 'it', label: 'IT Support', icon: 'computer', description: 'App issues, login problems' },
    { id: 'general', label: 'General Enquiry', icon: 'help', description: 'Other questions' },
];

export default function NewSupportTicketPage() {
    const params = useParams();
    const router = useRouter();
    const tenantSlug = params.slug as string;
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCategory && message.trim()) {
            console.log('Submit ticket:', { category: selectedCategory, message });
            router.push(`/tenant/${tenantSlug}/parent/chat`);
        }
    };

    return (
        <SubPageWrapper>
            <SubPageHeader
                title="New Support Ticket"
                backHref={`/tenant/${tenantSlug}/parent/chat`}
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div>
                    <h2 className="font-semibold text-sm mb-3">What do you need help with?</h2>
                    <div className="grid grid-cols-1 gap-2">
                        {SUPPORT_CATEGORIES.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${selectedCategory === category.id
                                        ? 'bg-primary/10 border-primary'
                                        : 'bg-card border-border hover:bg-secondary/30'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedCategory === category.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary text-muted-foreground'
                                    }`}>
                                    <span className="material-symbols-outlined">{category.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{category.label}</p>
                                    <p className="text-xs text-muted-foreground">{category.description}</p>
                                </div>
                                {selectedCategory === category.id && (
                                    <span className="material-symbols-outlined text-primary">check_circle</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message */}
                {selectedCategory && (
                    <div>
                        <h2 className="font-semibold text-sm mb-3">Describe your issue</h2>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Please provide details about your query..."
                            rows={4}
                            className="w-full p-4 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                    </div>
                )}

                {/* Submit */}
                {selectedCategory && (
                    <button
                        type="submit"
                        disabled={!message.trim()}
                        className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
                    >
                        Submit Ticket
                    </button>
                )}
            </form>
        </SubPageWrapper>
    );
}
