import { useState, useEffect } from 'react';
import { Star, AlertOctagon, History, UserCheck, Search, Loader2 } from 'lucide-react';
import { get, post } from '../../services/api';

interface Category {
    id: string;
    name: string;
    type: 'merit' | 'demerit';
    points: number;
    severity_level?: string;
}

interface Student {
    id: string;
    first_name: string;
    last_name: string;
    grade?: string;
    // Mock balance for now as it's computed
    balance?: number;
}

export default function DisciplineDashboard() {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);

    // Load Categories on Mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await get('/discipline/categories');
                setCategories(data);
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        loadCategories();
    }, []);

    // Search Students
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length < 2) {
                setStudents([]);
                return;
            }
            setSearching(true);
            try {
                const data = await get(`/students/search?query=${searchQuery}`);
                setStudents(data);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);


    // State for History
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Load History when student selected
    useEffect(() => {
        if (selectedStudent?.id) {
            loadHistory(selectedStudent.id);
        }
    }, [selectedStudent]);

    const loadHistory = async (studentId: string) => {
        setLoadingHistory(true);
        try {
            const data = await get(`/discipline/student/${studentId}/history`);
            setHistory(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleIssue = async (cat: Category) => {
        if (!selectedStudent) return;

        try {
            await post('/discipline/issue', {
                studentId: selectedStudent.id,
                categoryId: cat.id,
                note: `Issued via Staff Portal`,
                date: new Date().toISOString()
            });
            alert(`Previously Issued: ${cat.name} (${cat.points} pts)`);
            loadHistory(selectedStudent.id); // Refresh history
        } catch (err) {
            console.error("Issue failed", err);
            alert("Failed to issue discipline record");
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 pb-20">
            {/* Header */}
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Discipline & Conduct</h1>
            <p className="text-slate-500 mb-6">Manage student behaviour and merits.</p>

            {/* Student Search */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Select Student</label>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:outline-none dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Search Results */}
                {searching ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary" /></div>
                ) : (
                    <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                        {students.length > 0 ? students.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedStudent(s)}
                                className={`flex flex-col items-center min-w-[100px] p-3 rounded-xl border transition-all ${selectedStudent?.id === s.id
                                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'
                                    }`}
                            >
                                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 mb-2 flex items-center justify-center font-bold text-slate-500">
                                    {s.first_name[0]}
                                </div>
                                <span className="text-xs font-semibold text-center leading-tight">{s.first_name} {s.last_name}</span>
                                <span className="text-[10px] text-slate-400 mt-1">{s.grade || 'Student'}</span>
                            </button>
                        )) : (
                            searchQuery.length >= 2 && <p className="text-sm text-slate-400 p-2">No students found.</p>
                        )}
                    </div>
                )}
            </div>

            {selectedStudent && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Actions for {selectedStudent.first_name}
                        </h2>
                        <button onClick={() => setSelectedStudent(null)} className="text-xs text-red-500">Cancel</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleIssue(cat)}
                                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all active:scale-95 ${cat.type === 'merit'
                                    ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800 hover:border-green-300'
                                    : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800 hover:border-red-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {cat.type === 'merit' ? <Star className="text-green-500 h-6 w-6" /> : <AlertOctagon className="text-red-500 h-6 w-6" />}
                                    <div className="text-left">
                                        <span className={`block font-bold ${cat.type === 'merit' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                            {cat.name}
                                        </span>
                                        <span className="text-[10px] text-slate-500 uppercase">{cat.type}</span>
                                    </div>
                                </div>
                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/50 dark:bg-black/20">
                                    {cat.points} pts
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* History Section */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <History className="h-4 w-4" /> Recent Activity
                        </h3>

                        {loadingHistory ? (
                            <div className="flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                        ) : (
                            <div className="space-y-3">
                                {history.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic">No recent records.</p>
                                ) : (
                                    history.map((record: any) => (
                                        <div key={record.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center gap-3">
                                                {record.category_type === 'merit'
                                                    ? <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><Star className="h-4 w-4 text-green-600" /></div>
                                                    : <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><AlertOctagon className="h-4 w-4 text-red-600" /></div>
                                                }
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{record.category_name}</p>
                                                    <p className="text-xs text-slate-500">{new Date(record.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-bold ${record.category_type === 'merit' ? 'text-green-600' : 'text-red-600'}`}>
                                                {record.points_at_time > 0 ? '+' : ''}{record.points_at_time}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!selectedStudent && !searching && students.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-50">
                    <UserCheck className="h-12 w-12 mb-4" />
                    <p>Search and select a student above</p>
                </div>
            )}
        </div>
    );
}
