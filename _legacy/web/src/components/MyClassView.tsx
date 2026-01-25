import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, MoreVertical, Loader, User } from 'lucide-react';
import { educatorService, type Student } from '../services/educatorService';

interface MyClassViewProps {
    onBack: () => void;
}

export default function MyClassView({ onBack }: MyClassViewProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [className, setClassName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const loadClass = async () => {
            try {
                const data = await educatorService.getClassList();
                setStudents(data.students);
                setClassName(data.className);
            } catch (err) {
                console.error(err);
                setError('Failed to load class list');
            } finally {
                setLoading(false);
            }
        };
        loadClass();
    }, []);

    const filteredStudents = students.filter(s =>
        (s.first_name + ' ' + s.last_name).toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 font-sans">
            <header className="bg-white dark:bg-slate-800 px-4 py-3 shadow-sm border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
            </header>
            <main className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
    if (error) return <div className="p-4 text-center text-red-500 dark:bg-slate-900 h-screen">{error}</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 font-sans">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 sticky top-0 z-30 px-4 py-3 shadow-sm border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">My Class</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Grade {className} • {students.length} Students</p>
                </div>
                <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                    <Filter className="h-5 w-5" />
                </button>
            </header>

            {/* Search */}
            <div className="p-4 sticky top-[60px] z-20 bg-slate-50 dark:bg-slate-900">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* List */}
            <main className="px-4 space-y-3">
                {filteredStudents.map((student) => (
                    <div key={student.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-lg overflow-hidden">
                            {student.avatar ? <img src={student.avatar} alt={student.first_name} className="h-full w-full object-cover" /> : <User className="h-6 w-6" />}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{student.first_name} {student.last_name}</h3>
                            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                                <span className={student.attendance < 90 ? 'text-red-500' : 'text-green-600'}>
                                    {student.attendance}% Attendance
                                </span>
                                <span>•</span>
                                <span className={student.average < 50 ? 'text-red-500' : 'text-blue-600'}>
                                    avg: {student.average}%
                                </span>
                            </div>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <MoreVertical className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </main>
        </div>
    );
}
