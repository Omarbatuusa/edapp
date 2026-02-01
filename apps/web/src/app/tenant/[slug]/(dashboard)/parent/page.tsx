'use client';

import { CreditCard, FileText, User } from 'lucide-react';

export default function ParentDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Parent Portal</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Child Card */}
                <div className="surface-card p-0 overflow-hidden">
                    <div className="bg-secondary/30 p-4 border-b border-border/50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">B</div>
                        <div>
                            <p className="font-bold">Bart Simpson</p>
                            <p className="text-xs text-muted-foreground">Grade 4 - Mrs. Krabappel</p>
                        </div>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-2">
                        <button className="flex flex-col items-center justify-center p-3 hover:bg-secondary/50 rounded-lg transition-colors">
                            <FileText size={20} className="text-muted-foreground mb-1" />
                            <span className="text-xs font-medium">Report Card</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-3 hover:bg-secondary/50 rounded-lg transition-colors">
                            <CreditCard size={20} className="text-muted-foreground mb-1" />
                            <span className="text-xs font-medium">Fees</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
