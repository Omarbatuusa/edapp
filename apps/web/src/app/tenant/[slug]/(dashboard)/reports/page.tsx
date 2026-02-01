'use client';

import { FileText, Download, Printer } from 'lucide-react';

export default function ReportsHub() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Reports Engine</h1>
                <p className="text-muted-foreground">Generate official academic reports and schedules.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Term Reports */}
                <div className="surface-card p-8 flex flex-col items-center text-center hover:border-primary/50 transition-colors group cursor-pointer">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Term Reports</h3>
                    <p className="text-sm text-muted-foreground mb-6">Generate standard term performance reports for all grades.</p>

                    <div className="w-full space-y-3">
                        <select className="w-full p-2 bg-secondary/30 rounded-lg border-none text-sm">
                            <option>Term 1 - 2024</option>
                            <option>Term 4 - 2023</option>
                        </select>
                        <select className="w-full p-2 bg-secondary/30 rounded-lg border-none text-sm">
                            <option>Transition Phase (Gr R-3)</option>
                            <option>Senior Phase (Gr 7-9)</option>
                            <option>FET Phase (Gr 10-12)</option>
                        </select>
                        <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                            Generate PDF Bundle
                        </button>
                    </div>
                </div>

                {/* SA-SAMS Export */}
                <div className="surface-card p-8 flex flex-col items-center text-center hover:border-orange-500/50 transition-colors group cursor-pointer">
                    <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                        <Download size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">SA-SAMS Export</h3>
                    <p className="text-sm text-muted-foreground mb-6">Export data for government compliance systems.</p>

                    <div className="w-full p-4 bg-secondary/10 rounded-xl border border-dashed border-border mb-4">
                        <p className="text-xs font-mono text-muted-foreground">Compatible with v23.1.0</p>
                    </div>

                    <button className="w-full py-2 border border-border/50 hover:bg-secondary transition-colors rounded-lg font-medium">
                        Download XML
                    </button>
                </div>
            </div>
        </div>
    );
}
