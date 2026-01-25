import React, { useState } from 'react';
import { MOCK_BEHAVIOUR_CATEGORIES, type BehaviourCategory } from '../utils/mockPolicies';
import { ArrowLeft, User, Search, Check, AlertTriangle } from 'lucide-react';
// Mock Student List
const MOCK_STUDENTS = [
    { id: 's1', name: 'John Doe', grade: '8A' },
    { id: 's2', name: 'Jane Smith', grade: '8A' },
    { id: 's3', name: 'Michael Johnson', grade: '8A' },
];

interface DisciplineCaptureProps {
    onBack: () => void;
}

export default function DisciplineCapture({ onBack }: DisciplineCaptureProps) {
    const [step, setStep] = useState<'student' | 'category' | 'details'>('student');
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<BehaviourCategory | null>(null);
    const [note, setNote] = useState('');

    const toggleStudent = (id: string) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(s => s !== id));
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    };

    const handleCategorySelect = (category: BehaviourCategory) => {
        setSelectedCategory(category);
        setStep('details');
    };

    const handleSubmit = async () => {
        if (!selectedCategory || selectedStudents.length === 0) return;

        try {
            const promises = selectedStudents.map(studentId => {
                return fetch('/v1/discipline', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentId,
                        categoryId: selectedCategory.id,
                        note: note,
                        date: new Date().toISOString()
                    })
                });
            });

            await Promise.all(promises);
            // In a real app, check for individual failures, but for now assume success
            alert(`Recorded ${selectedCategory.name} for ${selectedStudents.length} students.`);
            onBack();
        } catch (e) {
            console.error(e);
            alert('Failed to record behaviour. Please try again.');
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex items-center space-x-3 sticky top-0 z-10">
                <button onClick={step === 'student' ? onBack : () => setStep(prev => prev === 'details' ? 'category' : 'student')} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <div>
                    <h1 className="font-semibold text-gray-900 dark:text-white">Record Behaviour</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {step === 'student' && 'Select Learners'}
                        {step === 'category' && 'Select Category'}
                        {step === 'details' && 'Add Details'}
                    </p>
                </div>
            </div>

            {step === 'student' && (
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search learner (type 3+ chars)..."
                            onChange={(e) => {
                                const q = e.target.value;
                                if (q.length >= 3) {
                                    fetch(`/v1/students/search?query=${q}`)
                                        .then(res => res.json())
                                        .then(data => setStudents(data)) // Assume state is named students
                                        .catch(console.error);
                                }
                            }}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        {students.map((student: any) => (
                            <div
                                key={student.id}
                                onClick={() => toggleStudent(student.id)}
                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedStudents.includes(student.id) ? 'bg-primary/5 border-primary' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">{student.first_name} {student.last_name}</p>
                                        <p className="text-xs text-gray-500">{student.email}</p>
                                    </div>
                                </div>
                                {selectedStudents.includes(student.id) && (
                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-in zoom-in">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {students.length === 0 && <p className="text-center text-sm text-gray-400 mt-4">Type to search students...</p>}
                    </div>

                    {selectedStudents.length > 0 && (
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => setStep('category')}
                                className="w-full py-3 bg-primary text-white font-medium rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                            >
                                Next ({selectedStudents.length})
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Step 2: Category Select */}
            {step === 'category' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Merits (Positive)</h3>
                    {MOCK_BEHAVIOUR_CATEGORIES.filter(c => c.type === 'merit').map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat)}
                            className={`w-full text-left p-4 rounded-xl border border-transparent ${cat.color} active:scale-98 transition-transform`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">{cat.name}</span>
                                <span className="text-sm font-bold">+{cat.points}</span>
                            </div>
                        </button>
                    ))}

                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Demerits (Negative)</h3>
                    {MOCK_BEHAVIOUR_CATEGORIES.filter(c => c.type === 'demerit').map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat)}
                            className={`w-full text-left p-4 rounded-xl border border-transparent ${cat.color} active:scale-98 transition-transform`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">{cat.name}</span>
                                <span className="text-sm font-bold">{cat.points}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Step 3: Details & Submit */}
            {step === 'details' && selectedCategory && (
                <div className="flex-1 overflow-y-auto p-4">
                    <div className={`p-4 rounded-xl mb-6 ${selectedCategory.color} flex items-center justify-between`}>
                        <div>
                            <p className="text-sm font-medium opacity-80">Selected Category</p>
                            <p className="text-lg font-bold">{selectedCategory.name}</p>
                        </div>
                        <span className="text-2xl font-bold">{selectedCategory.points > 0 ? '+' : ''}{selectedCategory.points}</span>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Add Note (Optional)
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Describe what happened..."
                            className="w-full h-32 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                    </div>

                    {selectedCategory.points <= -5 && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center space-x-2 mb-6">
                            <AlertTriangle className="w-4 h-4" />
                            <span>This severity will trigger an automatic notification to parents.</span>
                        </div>
                    )}

                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={handleSubmit}
                            className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl shadow-lg active:scale-95 transition-transform"
                        >
                            Confirm & Submit
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
