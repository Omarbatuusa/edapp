'use client';

import { CreditCard, Download, ArrowUpRight, ArrowDownLeft, Wallet, FileText } from 'lucide-react';

export default function FinanceHub() {
    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--admin-text-main))] mb-1">Finance Hub</h1>
                    <p className="text-[15px] font-medium text-[hsl(var(--admin-text-sub))]">Manage school fees, payments, and wallet top-ups.</p>
                </div>
                <button className="bg-[hsl(var(--admin-primary))] text-white hover:bg-[hsl(var(--admin-primary))/0.9] active:scale-[0.96] px-6 py-2.5 rounded-[12px] font-semibold transition-all shadow-sm">
                    Top Up Wallet
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="ios-card overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[hsl(var(--admin-danger))]" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-[hsl(var(--admin-danger))/0.1] text-[hsl(var(--admin-danger))] rounded-[14px]">
                            <CreditCard size={26} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--admin-danger))] bg-[hsl(var(--admin-danger))/0.1] px-2.5 py-1 rounded-full">Due Soon</span>
                    </div>
                    <p className="text-[14px] text-[hsl(var(--admin-text-sub))] font-semibold mb-1 uppercase tracking-wider">Outstanding Fees</p>
                    <h2 className="text-[28px] font-bold tracking-tight text-[hsl(var(--admin-text-main))]">R 12,450.00</h2>
                </div>

                <div className="ios-card overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[hsl(var(--admin-success))]" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-[hsl(var(--admin-success))/0.1] text-[hsl(var(--admin-success))] rounded-[14px]">
                            <Wallet size={26} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--admin-success))] bg-[hsl(var(--admin-success))/0.1] px-2.5 py-1 rounded-full">Active</span>
                    </div>
                    <p className="text-[14px] text-[hsl(var(--admin-text-sub))] font-semibold mb-1 uppercase tracking-wider">Wallet Balance</p>
                    <h2 className="text-[28px] font-bold tracking-tight text-[hsl(var(--admin-text-main))]">R 450.00</h2>
                </div>

                <div className="ios-card overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[hsl(var(--admin-primary))]" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-[hsl(var(--admin-primary))/0.1] text-[hsl(var(--admin-primary))] rounded-[14px]">
                            <ArrowUpRight size={26} />
                        </div>
                    </div>
                    <p className="text-[14px] text-[hsl(var(--admin-text-sub))] font-semibold mb-1 uppercase tracking-wider">Last Payment</p>
                    <h2 className="text-[28px] font-bold tracking-tight text-[hsl(var(--admin-text-main))]">R 3,200.00</h2>
                    <p className="text-[13px] font-medium text-[hsl(var(--admin-text-sub))] mt-2">Paid on 28 Jan 2024</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Invoices List */}
                <div className="lg:col-span-2 ios-card p-0 flex flex-col">
                    <div className="p-5 px-6 border-b border-[hsl(var(--admin-border))] flex justify-between items-center bg-[hsl(var(--admin-surface-alt))]">
                        <h3 className="font-semibold text-[17px] tracking-tight text-[hsl(var(--admin-text-main))]">Invoices</h3>
                        <button className="text-[14px] text-[hsl(var(--admin-primary))] font-semibold hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-[hsl(var(--admin-border))]">
                        <InvoiceItem
                            id="INV-2024-001"
                            desc="Term 1 School Fees"
                            date="01 Feb 2024"
                            amount="R 8,500.00"
                            status="unpaid"
                        />
                        <InvoiceItem
                            id="INV-2024-002"
                            desc="Textbook Levy"
                            date="15 Jan 2024"
                            amount="R 1,200.00"
                            status="paid"
                        />
                        <InvoiceItem
                            id="INV-2024-003"
                            desc="Sports Uniform"
                            date="10 Jan 2024"
                            amount="R 850.00"
                            status="paid"
                        />
                    </div>
                </div>

            </div>

            {/* Wallet History */}
            <div className="ios-card p-0 flex flex-col">
                <div className="p-5 px-6 border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))]">
                    <h3 className="font-semibold text-[17px] tracking-tight text-[hsl(var(--admin-text-main))]">Wallet History</h3>
                </div>
                <div className="divide-y divide-[hsl(var(--admin-border))] bg-transparent flex-1">
                    <WalletItem type="expense" desc="Tuckshop" amount="-R 45.00" date="Today, 10:30" />
                    <WalletItem type="expense" desc="Printing" amount="-R 10.00" date="Yesterday" />
                    <WalletItem type="topup" desc="EFT Top-up" amount="+R 500.00" date="28 Jan" />
                </div>
            </div>
        </div>
    );
}

function InvoiceItem({ id, desc, date, amount, status }: any) {
    return (
        <div className="p-5 flex items-center justify-between hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-[hsl(var(--admin-surface-alt))] rounded-[12px] text-[hsl(var(--admin-text-muted))] group-hover:text-[hsl(var(--admin-primary))] group-hover:bg-[hsl(var(--admin-primary))/0.1] transition-colors">
                    <FileText size={22} className="transition-transform group-hover:-translate-y-0.5" />
                </div>
                <div>
                    <p className="font-semibold text-[15px] text-[hsl(var(--admin-text-main))] tracking-tight">{desc}</p>
                    <p className="text-[13px] font-medium text-[hsl(var(--admin-text-sub))]">{id} • {date}</p>
                </div>
            </div>
            <div className="flex items-center gap-5">
                <span className="font-bold text-[16px] text-[hsl(var(--admin-text-main))] tracking-tight block text-right">{amount}</span>
                {status === 'paid' ? (
                    <span className="px-3 py-1 bg-[hsl(var(--admin-success))/0.1] text-[hsl(var(--admin-success))] text-[12px] font-bold rounded-full uppercase tracking-wider">Paid</span>
                ) : (
                    <button className="px-4 py-1.5 bg-[hsl(var(--admin-text-main))] text-[hsl(var(--admin-surface))] text-[13px] font-bold rounded-full hover:bg-[hsl(var(--admin-text-main))/0.8] active:scale-95 transition-all shadow-sm">Pay</button>
                )}
            </div>
        </div>
    )
}

function WalletItem({ type, desc, amount, date }: any) {
    const isExpense = type === 'expense';
    return (
        <div className="p-5 flex items-center justify-between hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-[12px] ${isExpense ? 'bg-[hsl(var(--admin-warning))/0.1] text-[hsl(var(--admin-warning))]' : 'bg-[hsl(var(--admin-success))/0.1] text-[hsl(var(--admin-success))]'}`}>
                    {isExpense ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                <div>
                    <p className="font-semibold text-[15px] text-[hsl(var(--admin-text-main))] tracking-tight">{desc}</p>
                    <p className="text-[13px] font-medium text-[hsl(var(--admin-text-sub))]">{date}</p>
                </div>
            </div>
            <span className={`text-[16px] font-bold tracking-tight ${isExpense ? 'text-[hsl(var(--admin-text-main))]' : 'text-[hsl(var(--admin-success))]'}`}>{amount}</span>
        </div>
    )
}
