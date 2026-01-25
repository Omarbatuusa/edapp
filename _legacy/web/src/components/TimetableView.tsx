import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, MapPin, Calendar, Loader } from 'lucide-react';
import { learnerService, type TimeTableItem } from '../services/learnerService';

interface TimetableViewProps {
    onBack: () => void;
}

export default function TimetableView({ onBack }: TimetableViewProps) {
    const [schedule, setSchedule] = useState<TimeTableItem[]>([]);
    const [dateStr, setDateStr] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadTimetable = async () => {
            try {
                const data = await learnerService.getTimetable();
                setSchedule(data.schedule);
                // Use backend date string or fallback to local
                const backendDate = new Date(data.date);
                setDateStr(backendDate.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' }));
            } catch (err) {
                console.error(err);
                setError('Failed to load timetable');
            } finally {
                setLoading(false);
            }
        };
        loadTimetable();
    }, []);

    if (loading) return <div className="flex h-screen items-center justify-center dark:bg-slate-900"><Loader className="animate-spin text-blue-600" /></div>;
    if (error) return <div className="p-4 text-center text-red-500 dark:bg-slate-900 h-screen">{error}</div>;

    // Use fetched date or today fallback
    const displayDate = dateStr || new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });

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
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">My Timetable</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{displayDate}</p>
                    </div>
                </div>
                <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                    <Calendar className="h-5 w-5" />
                </button>
            </header>

            {/* Current Class Hero (Optional, good for "Now") */}
            <div className="p-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold backdrop-blur-sm">NOW</span>
                        <Clock className="h-5 w-5 opacity-80" />
                    </div>
                    <h2 className="text-2xl font-bold mb-1">Mathematics</h2>
                    <div className="flex items-center gap-2 opacity-90 text-sm mb-4">
                        <MapPin className="h-4 w-4" />
                        <span>Room 12 • Mr. Dlamini</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-white/90 w-2/3 h-full rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-xs mt-2 opacity-75">
                        <span>08:00</span>
                        <span>09:00</span>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <main className="px-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 px-1">Rest of Today</h3>
                <div className="space-y-4">
                    {schedule.slice(2).map((item, index) => (
                        <div key={index} className="flex gap-4 relative">
                            {/* Time Column */}
                            <div className="flex flex-col items-center w-12 pt-1 shrink-0">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.time}</span>
                                {index !== schedule.slice(2).length - 1 && (
                                    <div className="w-0.5 grow bg-slate-200 dark:bg-slate-700 mt-2 rounded-full"></div>
                                )}
                            </div>

                            {/* Card */}
                            <div className={`flex-1 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 ${item.subject === 'Break' ? 'opacity-80' : ''}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{item.subject}</h4>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span>{item.room}</span>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${item.color}`}>
                                        {item.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
