import { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, TrendingUp, Download, Eye, Loader } from 'lucide-react';
import { learnerService, type ResultsData } from '../services/learnerService';

interface ResultsViewProps {
    onBack: () => void;
}

export default function ResultsView({ onBack }: ResultsViewProps) {
    const [results, setResults] = useState<ResultsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadResults = async () => {
            try {
                const data = await learnerService.getResults();
                setResults(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load results');
            } finally {
                setLoading(false);
            }
        };
        loadResults();
    }, []);

    if (loading) return <div className="flex h-screen items-center justify-center dark:bg-slate-900"><Loader className="animate-spin text-blue-600" /></div>;
    if (error) return <div className="p-4 text-center text-red-500 dark:bg-slate-900 h-screen">{error}</div>;
    if (!results) return null;

    const { term, year, average, subjects } = results;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 font-sans">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 sticky top-0 z-30 px-4 py-3 shadow-sm border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">My Results</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{term} • {year}</p>
                    </div>
                </div>
                <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                    <Download className="h-5 w-5" />
                </button>
            </header>

            {/* Summary Card */}
            <div className="p-4">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-between">
                    <div>
                        <p className="text-emerald-100 text-sm font-medium mb-1">Term Average</p>
                        <h2 className="text-4xl font-black">{average}%</h2>
                        <div className="flex items-center gap-1 text-emerald-100 text-xs mt-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>+2% from Term 2</span>
                        </div>
                    </div>
                    <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                </div>
            </div>

            {/* Subject List */}
            <main className="px-4 pb-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 px-1">Subject Breakdown</h3>
                <div className="space-y-3">
                    {subjects.map((subject, index) => (
                        <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 dark:text-white">{subject.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{subject.teacher}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <span className={`text-xl font-black ${subject.mark >= 80 ? 'text-green-600' : subject.mark >= 50 ? 'text-blue-600' : 'text-orange-500'}`}>
                                        {subject.mark}%
                                    </span>
                                    <p className="text-xs text-slate-400 font-bold text-center">{subject.symbol}</p>
                                </div>
                                <button className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-primary transition-colors">
                                    <Eye className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
