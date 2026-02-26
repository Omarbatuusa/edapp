'use client';

import { FileText, Download, Printer } from 'lucide-react';

export default function ReportsHub() {
    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--admin-text-main))] mb-2">Reports Engine</h1>
                <p className="text-[15px] font-medium text-[hsl(var(--admin-text-sub))]">Generate official academic reports and schedules.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                {/* Term Reports */}
                <div className="ios-card p-8 flex flex-col items-center text-center hover:border-[hsl(var(--admin-primary))/0.5] transition-colors group cursor-pointer">
                    <div className="w-20 h-20 bg-[hsl(var(--admin-primary))/0.1] rounded-full flex items-center justify-center text-[hsl(var(--admin-primary))] mb-6 group-hover:scale-110 transition-transform shadow-sm">
                        <FileText size={36} />
                    </div>
                    <h3 className="text-[20px] font-bold tracking-tight text-[hsl(var(--admin-text-main))] mb-2">Term Reports</h3>
                    <p className="text-[14px] font-medium text-[hsl(var(--admin-text-sub))] mb-8 leading-relaxed">Generate standard term performance reports for all grades.</p>

                    <div className="w-full space-y-4">
                        <select className="w-full p-3.5 bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded-[12px] text-[15px] font-semibold text-[hsl(var(--admin-text-main))] outline-none focus:ring-2 focus:ring-[hsl(var(--admin-primary))/0.3] transition-all cursor-pointer">
                            <option>Term 1 - 2024</option>
                            <option>Term 4 - 2023</option>
                        </select>
                        <select className="w-full p-3.5 bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded-[12px] text-[15px] font-semibold text-[hsl(var(--admin-text-main))] outline-none focus:ring-2 focus:ring-[hsl(var(--admin-primary))/0.3] transition-all cursor-pointer">
                            <option>Transition Phase (Gr R-3)</option>
                            <option>Senior Phase (Gr 7-9)</option>
                            <option>FET Phase (Gr 10-12)</option>
                        </select>
                        <button className="w-full py-3.5 mt-2 bg-[hsl(var(--admin-primary))] text-white rounded-[12px] font-bold text-[15px] hover:bg-[hsl(var(--admin-primary))/0.9] active:scale-[0.98] transition-all shadow-sm">
                            Generate PDF Bundle
                        </button>
                    </div>
                </div>

                {/* SA-SAMS Export */}
                <div className="ios-card p-8 flex flex-col items-center text-center hover:border-[hsl(var(--admin-warning))] transition-colors group cursor-pointer">
                    <div className="w-20 h-20 bg-[hsl(var(--admin-warning))/0.1] rounded-full flex items-center justify-center text-[hsl(var(--admin-warning))] mb-6 group-hover:scale-110 transition-transform shadow-sm">
                        <Download size={36} />
                    </div>
                    <h3 className="text-[20px] font-bold tracking-tight text-[hsl(var(--admin-text-main))] mb-2">SA-SAMS Export</h3>
                    <p className="text-[14px] font-medium text-[hsl(var(--admin-text-sub))] mb-8 leading-relaxed">Export data for government compliance systems.</p>

                    <div className="w-full p-4 bg-[hsl(var(--admin-surface-alt))] rounded-[16px] border border-dashed border-[hsl(var(--admin-border))] mb-6">
                        <p className="text-[13px] font-bold font-mono text-[hsl(var(--admin-text-sub))]">Compatible with v23.1.0</p>
                    </div>

                    <button className="w-full py-3.5 bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-text-main))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-text-main))] hover:text-[hsl(var(--admin-surface))] transition-all rounded-[12px] font-bold text-[15px] active:scale-[0.98]">
                        Download XML
                    </button>
                </div>
            </div>
        </div>
    );
}
