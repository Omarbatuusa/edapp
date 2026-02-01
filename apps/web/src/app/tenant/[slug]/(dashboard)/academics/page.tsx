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
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Academics Hub</h1>
                    <p className="text-muted-foreground">Manage subjects, assessments, and marks.</p>
                </div>
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                    + New Subject
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SUBJECTS.map((subject) => (
                    <div key={subject.id} className="surface-card p-6 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${subject.color}`}>
                                <subject.icon size={24} />
                            </div>
                            <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full">
                                {subject.grade}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold mb-1">{subject.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{subject.teacher}</p>

                        <div className="flex items-center gap-4 mb-6 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Users size={16} />
                                {subject.students}
                            </div>
                            <div className="flex items-center gap-1.5 font-medium">
                                <span className={parseInt(subject.average) > 60 ? 'text-green-600' : 'text-orange-600'}>
                                    {subject.average}
                                </span>
                                Avg
                            </div>
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-3">
                            <Link
                                href={`/tenant/${slug}/academics/gradebook/${subject.id}`}
                                className="flex items-center justify-center py-2 px-3 rounded-lg bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors"
                            >
                                Gradebook
                            </Link>
                            <button className="flex items-center justify-center py-2 px-3 rounded-lg border border-border/50 hover:bg-secondary transition-colors text-sm font-medium">
                                Plan
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
