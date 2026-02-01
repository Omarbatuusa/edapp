'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Download, Calculator } from 'lucide-react';
import Link from 'next/link';

// Mock Data
const STUDENTS = [
    { id: 1, name: 'Lisa Simpson', t1: 95, t2: 98, t3: 92 },
    { id: 2, name: 'Bart Simpson', t1: 45, t2: 52, t3: 48 },
    { id: 3, name: 'Milhouse Van Houten', t1: 65, t2: 68, t3: 70 },
    { id: 4, name: 'Ralph Wiggum', t1: 30, t2: 35, t3: 25 },
    { id: 5, name: 'Martin Prince', t1: 98, t2: 99, t3: 97 },
];

export default function GradebookPage({ params }: { params: { slug: string, subjectId: string } }) {
    // In a real app we would use subjectId to fetch data
    const [marks, setMarks] = useState(STUDENTS);

    const handleMarkChange = (id: number, term: string, value: string) => {
        const numValue = Math.min(100, Math.max(0, Number(value)));
        setMarks(marks.map(s =>
            s.id === id ? { ...s, [term]: numValue } : s
        ));
    };

    const calculateAverage = (student: any) => {
        return Math.round((student.t1 + student.t2 + student.t3) / 3);
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/tenant/${params.slug}/academics`}
                        className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Mathematics Grade 10</h1>
                        <p className="text-muted-foreground text-sm">Term 1 Assessment Record</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 hover:bg-secondary/50 text-sm font-medium">
                        <Download size={16} />
                        Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium">
                        <Save size={16} />
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="flex-1 surface-card overflow-hidden p-0 flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/30 text-xs uppercase font-semibold text-muted-foreground sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 min-w-[200px]">Student Name</th>
                                <th className="px-4 py-4 w-32 text-center bg-blue-50/50 dark:bg-blue-900/10">Term 1 (33%)</th>
                                <th className="px-4 py-4 w-32 text-center bg-green-50/50 dark:bg-green-900/10">Term 2 (33%)</th>
                                <th className="px-4 py-4 w-32 text-center bg-orange-50/50 dark:bg-orange-900/10">Term 3 (33%)</th>
                                <th className="px-4 py-4 w-32 text-center font-bold text-foreground">Final Avg</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {marks.map((student) => {
                                const avg = calculateAverage(student);
                                let colorClass = 'text-foreground';
                                if (avg >= 80) colorClass = 'text-green-600 font-bold';
                                if (avg < 50) colorClass = 'text-red-500 font-bold';

                                return (
                                    <tr key={student.id} className="hover:bg-secondary/20 transition-colors group">
                                        <td className="px-6 py-3 font-medium">{student.name}</td>
                                        <td className="px-4 py-2 text-center">
                                            <input
                                                type="number"
                                                value={student.t1}
                                                onChange={(e) => handleMarkChange(student.id, 't1', e.target.value)}
                                                className="w-16 text-center bg-transparent border border-transparent hover:border-border focus:border-primary rounded px-2 py-1 focus:ring-1 focus:ring-primary outline-none transition-all"
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <input
                                                type="number"
                                                value={student.t2}
                                                onChange={(e) => handleMarkChange(student.id, 't2', e.target.value)}
                                                className="w-16 text-center bg-transparent border border-transparent hover:border-border focus:border-primary rounded px-2 py-1 focus:ring-1 focus:ring-primary outline-none transition-all"
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <input
                                                type="number"
                                                value={student.t3}
                                                onChange={(e) => handleMarkChange(student.id, 't3', e.target.value)}
                                                className="w-16 text-center bg-transparent border border-transparent hover:border-border focus:border-primary rounded px-2 py-1 focus:ring-1 focus:ring-primary outline-none transition-all"
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`inline-block w-12 py-1 rounded-md bg-secondary/50 text-center ${colorClass}`}>
                                                {avg}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-border/50 bg-secondary/10 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> Distinction (80%+)</span>
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> At Risk (&lt;50%)</span>
                    </div>
                    <div>
                        Last saved: Just now
                    </div>
                </div>
            </div>
        </div>
    );
}
