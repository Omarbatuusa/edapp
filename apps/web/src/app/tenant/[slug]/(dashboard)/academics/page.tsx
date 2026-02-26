'use client';

import { BookOpen, Users, Clock, ArrowRight, BarChart } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

const SUBJECTS = [
    { id: 'math-10', name: 'Mathematics', grade: 'Grade 10', students: 28, average: '64%', teacher: 'Mrs. Krabappel', icon: BarChart, color: 'text-blue-600 bg-blue-50' },
    { id: 'sci-11', name: 'Physical Science', grade: 'Grade 11', students: 24, average: '58%', teacher: 'Prof. Frink', icon: BookOpen, color: 'text-green-600 bg-green-50' },
    { id: 'hist-09', name: 'History', grade: 'Grade 9', students: 32, average: '72%', teacher: 'Mr. Bergstrom', icon: Clock, color: 'text-orange-600 bg-orange-50' }
];

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function AcademicsHub({ params }: PageProps) {
    const { slug } = use(params);

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--admin-text-main))] mb-1">Academics Hub</h1>
                    <p className="text-[15px] font-medium text-[hsl(var(--admin-text-sub))]">Manage subjects, assessments, and marks.</p>
                </div>
                <button className="bg-[hsl(var(--admin-primary))] text-white hover:bg-[hsl(var(--admin-primary))/0.9] active:scale-[0.96] px-5 py-2.5 rounded-[12px] font-semibold transition-all shadow-sm">
                    + New Subject
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SUBJECTS.map((subject) => (
                    <div key={subject.id} className="ios-card p-6 flex flex-col hover:border-[hsl(var(--admin-primary))/0.3] transition-all group">
                        <div className="flex items-start justify-between mb-5">
                            <div className={`p-3.5 rounded-[16px] shadow-sm ${subject.color}`}>
                                <subject.icon size={26} />
                            </div>
                            <span className="px-3 py-1 bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] text-[12px] font-bold rounded-full border border-[hsl(var(--admin-border))] tracking-wide">
                                {subject.grade}
                            </span>
                        </div>

                        <h3 className="text-[20px] font-bold tracking-tight text-[hsl(var(--admin-text-main))] mb-1.5">{subject.name}</h3>
                        <p className="text-[14px] font-medium text-[hsl(var(--admin-text-sub))] mb-6">{subject.teacher}</p>

                        <div className="flex items-center gap-5 mb-8 text-[14px]">
                            <div className="flex items-center gap-2 font-medium text-[hsl(var(--admin-text-main))]">
                                <Users size={18} className="text-[hsl(var(--admin-text-muted))]" />
                                {subject.students} <span className="text-[hsl(var(--admin-text-muted))] font-normal">Students</span>
                            </div>
                            <div className="flex items-center gap-2 font-bold">
                                <span className={parseInt(subject.average) > 60 ? 'text-[hsl(var(--admin-success))]' : 'text-[hsl(var(--admin-warning))]'}>
                                    {subject.average}
                                </span>
                                <span className="text-[hsl(var(--admin-text-muted))] font-normal">Avg</span>
                            </div>
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-[hsl(var(--admin-border))]">
                            <Link
                                href={`/tenant/${slug}/academics/gradebook/${subject.id}`}
                                className="flex items-center justify-center py-2.5 px-4 rounded-[10px] bg-[hsl(var(--admin-primary))/0.1] text-[hsl(var(--admin-primary))] font-bold text-[14px] hover:bg-[hsl(var(--admin-primary))/0.15] active:scale-95 transition-all"
                            >
                                Gradebook
                            </Link>
                            <button className="flex items-center justify-center py-2.5 px-4 rounded-[10px] bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface-alt))] active:scale-95 transition-all text-[14px] font-bold text-[hsl(var(--admin-text-main))]">
                                Plan
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
