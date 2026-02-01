'use client';

import { CreditCard, Download, ArrowUpRight, ArrowDownLeft, Wallet, FileText } from 'lucide-react';

export default function FinanceHub() {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Finance Hub</h1>
                    <p className="text-muted-foreground">Manage school fees, payments, and wallet top-ups.</p>
                </div>
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
                    Top Up Wallet
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="surface-card p-6 border-l-4 border-red-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                            <CreditCard size={24} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-1 rounded">Due Soon</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Outstanding Fees</p>
                    <h2 className="text-3xl font-bold">R 12,450.00</h2>
                </div>

                <div className="surface-card p-6 border-l-4 border-green-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <Wallet size={24} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Wallet Balance</p>
                    <h2 className="text-3xl font-bold">R 450.00</h2>
                </div>

                <div className="surface-card p-6 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <ArrowUpRight size={24} />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Last Payment</p>
                    <h2 className="text-3xl font-bold">R 3,200.00</h2>
                    <p className="text-xs text-muted-foreground mt-2">Paid on 28 Jan 2024</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Invoices List */}
                <div className="lg:col-span-2 surface-card p-0 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border/40 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Invoices</h3>
                        <button className="text-sm text-primary font-medium hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-border/40">
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

                {/* Wallet History */}
                <div className="surface-card p-0 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border/40">
                        <h3 className="font-bold text-lg">Wallet History</h3>
                    </div>
                    <div className="divide-y divide-border/40 bg-secondary/10 flex-1">
                        <WalletItem type="expense" desc="Tuckshop" amount="-R 45.00" date="Today, 10:30" />
                        <WalletItem type="expense" desc="Printing" amount="-R 10.00" date="Yesterday" />
                        <WalletItem type="topup" desc="EFT Top-up" amount="+R 500.00" date="28 Jan" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function InvoiceItem({ id, desc, date, amount, status }: any) {
    return (
        <div className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-secondary rounded-lg text-muted-foreground">
                    <FileText size={20} />
                </div>
                <div>
                    <p className="font-medium text-sm">{desc}</p>
                    <p className="text-xs text-muted-foreground">{id} • {date}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="font-bold text-sm block text-right">{amount}</span>
                {status === 'paid' ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded uppercase">Paid</span>
                ) : (
                    <button className="px-3 py-1 bg-black text-white text-xs font-bold rounded hover:bg-black/80 transition-colors">Pay</button>
                )}
            </div>
        </div>
    )
}

function WalletItem({ type, desc, amount, date }: any) {
    const isExpense = type === 'expense';
    return (
        <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isExpense ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                    {isExpense ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                </div>
                <div>
                    <p className="text-sm font-medium">{desc}</p>
                    <p className="text-xs text-muted-foreground">{date}</p>
                </div>
            </div>
            <span className={`text-sm font-bold ${isExpense ? 'text-foreground' : 'text-green-600'}`}>{amount}</span>
        </div>
    )
}
