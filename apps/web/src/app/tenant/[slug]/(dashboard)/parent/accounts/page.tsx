'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SubPageHeader } from '@/components/parent/SubPageHeader';
import { MOCK_FEES_BALANCE, MOCK_PAYMENTS, MOCK_CHILDREN, formatCurrency } from '@/lib/parent';

export default function AccountsPage() {
    const params = useParams();
    const tenantSlug = params.slug as string;
    const fees = MOCK_FEES_BALANCE;

    return (
        <div>
            <SubPageHeader
                title="Account Statement"
                backHref={`/tenant/${tenantSlug}/parent`}
                actions={
                    <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-lg">download</span>
                        Download
                    </button>
                }
            />

            {/* Account Summary */}
            <div className="bg-card border border-border rounded-2xl p-5 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Current Balance</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(fees.totalDue, fees.currency)}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                        Due {fees.dueDate}
                    </span>
                </div>

                <Link
                    href={`/tenant/${tenantSlug}/parent/pay`}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">payments</span>
                    Make a Payment
                </Link>
            </div>

            {/* Balance Breakdown */}
            <h2 className="font-semibold text-base mb-3">Balance by Child</h2>
            <div className="space-y-2 mb-6">
                {fees.children.map((child) => {
                    const childData = MOCK_CHILDREN.find(c => c.id === child.childId);
                    return (
                        <div key={child.childId} className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
                            <img
                                src={childData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(child.childName)}&size=40&background=6366f1&color=fff`}
                                alt={child.childName}
                                className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                                <p className="font-medium text-sm">{child.childName}</p>
                                <p className="text-xs text-muted-foreground">{childData?.grade} • {childData?.class}</p>
                            </div>
                            <p className="font-semibold text-red-600 dark:text-red-400">
                                {formatCurrency(child.amount, fees.currency)}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Transaction History */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-base">Transaction History</h2>
                <button className="text-sm text-primary font-medium hover:underline">View All</button>
            </div>
            <div className="space-y-2">
                {MOCK_PAYMENTS.map((payment) => (
                    <div key={payment.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg">arrow_downward</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Payment Received</p>
                            <p className="text-xs text-muted-foreground">{payment.date} • {payment.reference}</p>
                        </div>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                            -{formatCurrency(payment.amount, payment.currency)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
