import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Save, CheckCircle, XCircle, Clock, Loader, User } from 'lucide-react';
import { educatorService, type Student, type AttendanceRecord } from '../services/educatorService';

interface AttendanceViewProps {
    onBack: () => void;
}

export default function AttendanceView({ onBack }: AttendanceViewProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [date] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const loadClass = async () => {
            // Fetch class list to populate grid
            try {
                const data = await educatorService.getClassList();
                setStudents(data.students);
                // Default to all Present
                const initial: Record<string, 'Present' | 'Absent' | 'Late'> = {};
                data.students.forEach(s => initial[s.id] = 'Present');
                setAttendance(initial);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadClass();
    }, []);

    const toggleStatus = (id: string) => {
        setAttendance(prev => {
            const current = prev[id];
            let next: 'Present' | 'Absent' | 'Late' = 'Present';
            if (current === 'Present') next = 'Absent';
            else if (current === 'Absent') next = 'Late';
            return { ...prev, [id]: next };
        });
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const records: AttendanceRecord[] = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status }));
            await educatorService.submitAttendance(date, records);
            alert('Attendance Saved!');
            onBack();
        } catch (e) {
            alert('Failed to save');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center dark:bg-slate-900"><Loader className="animate-spin text-blue-600" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 font-sans">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 sticky top-0 z-30 px-4 py-3 shadow-sm border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div className="text-center">
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Attendance</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{date}</p>
                </div>
                <button className="p-2 w-10"></button> {/* Spacer */}
            </header>

            {/* List */}
            <main className="px-4 py-4 space-y-3">
                {students.map(student => (
                    <div
                        key={student.id}
                        onClick={() => toggleStatus(student.id)}
                        className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all select-none ${attendance[student.id] === 'Present' ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' :
                                attendance[student.id] === 'Absent' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900' :
                                    'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                                {student.avatar ? <img src={student.avatar} className="h-full w-full object-cover" /> : <User className="h-5 w-5" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{student.first_name} {student.last_name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Grade {student.grade}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {attendance[student.id] === 'Present' && <CheckCircle className="h-6 w-6 text-green-500" />}
                            {attendance[student.id] === 'Absent' && <XCircle className="h-6 w-6 text-red-500" />}
                            {attendance[student.id] === 'Late' && <Clock className="h-6 w-6 text-orange-500" />}
                            <span className={`text-sm font-bold w-16 text-right ${attendance[student.id] === 'Present' ? 'text-green-600' :
                                    attendance[student.id] === 'Absent' ? 'text-red-600' : 'text-orange-600'
                                }`}>{attendance[student.id]}</span>
                        </div>
                    </div>
                ))}
            </main>

            {/* FAB */}
            <div className="fixed bottom-6 left-0 right-0 px-6 flex justify-center z-40">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
                >
                    {submitting ? <Loader className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                    Submit Register
                </button>
            </div>
        </div>
    );
}
