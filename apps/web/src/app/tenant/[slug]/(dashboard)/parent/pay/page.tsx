'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SubPageHeader, SubPageWrapper } from '@/components/parent/SubPageHeader';
import { MOCK_FEES_BALANCE, MOCK_PAYMENTS, formatCurrency } from '@/lib/parent';

export default function PayPage() {
    const params = useParams();
    const tenantSlug = params.slug as string;
    const fees = MOCK_FEES_BALANCE;

    return (
        <SubPageWrapper>
            <SubPageHeader
                title="Pay Fees"
                backHref={`/tenant/${tenantSlug}/parent`}
            />

            {/* Balance Summary */}
            <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-2xl p-5 mb-6">
                <p className="text-sm text-white/80">Total Outstanding</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(fees.totalDue, fees.currency)}</p>
                <p className="text-xs text-white/70 mt-2">Payment due by {fees.dueDate}</p>
            </div>

            {/* Payment Methods */}
            <h2 className="font-semibold text-base mb-3">Payment Methods</h2>
            <div className="space-y-3 mb-6">
                <button className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-secondary/30 transition-colors text-left">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">credit_card</span>
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-sm">Pay with Card</p>
                        <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                    </div>
                    <span className="material-symbols-outlined text-muted-foreground">chevron_right</span>
                </button>

                <button className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-secondary/30 transition-colors text-left">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">account_balance</span>
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-sm">EFT / Bank Transfer</p>
                        <p className="text-xs text-muted-foreground">Get banking details</p>
                    </div>
                    <span className="material-symbols-outlined text-muted-foreground">chevron_right</span>
                </button>

                <button className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-secondary/30 transition-colors text-left">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">qr_code_2</span>
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-sm">Scan to Pay</p>
                        <p className="text-xs text-muted-foreground">SnapScan, Zapper</p>
                    </div>
                    <span className="material-symbols-outlined text-muted-foreground">chevron_right</span>
                </button>
            </div>

            {/* Recent Payments */}
            <h2 className="font-semibold text-base mb-3">Recent Payments</h2>
            <div className="space-y-2">
                {MOCK_PAYMENTS.map((payment) => (
                    <div key={payment.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg">check_circle</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{formatCurrency(payment.amount, payment.currency)}</p>
                            <p className="text-xs text-muted-foreground">{payment.date} • {payment.method}</p>
                        </div>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Paid</span>
                    </div>
                ))}
            </div>
        </SubPageWrapper>
    );
}
