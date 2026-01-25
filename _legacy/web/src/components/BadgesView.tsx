import { useState, useEffect } from 'react';
import { ArrowLeft, Award, Star, Lock, Loader } from 'lucide-react';
import { learnerService, type BadgesData, type Badge } from '../services/learnerService';

interface BadgesViewProps {
    onBack: () => void;
}

export default function BadgesView({ onBack }: BadgesViewProps) {
    const [data, setData] = useState<BadgesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadBadges = async () => {
            try {
                const result = await learnerService.getBadges();
                setData(result);
            } catch (err) {
                console.error(err);
                setError('Failed to load badges');
            } finally {
                setLoading(false);
            }
        };
        loadBadges();
    }, []);

    if (loading) return <div className="flex h-screen items-center justify-center dark:bg-slate-900"><Loader className="animate-spin text-blue-600" /></div>;
    if (error) return <div className="p-4 text-center text-red-500 dark:bg-slate-900 h-screen">{error}</div>;
    if (!data) return null;

    const { totalMerits, badges } = data;

    return (
        <div className="min-h-screen bg-[#F0F9FF] font-comic p-4 pb-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-300 rounded-full blur-3xl opacity-30 translate-y-1/3 -translate-x-1/3"></div>

            {/* Header */}
            <header className="relative z-10 flex items-center gap-3 mb-6">
                <button
                    onClick={onBack}
                    className="p-3 bg-white rounded-full shadow-md text-slate-600 active:scale-95 transition-transform"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Badges</h1>
                </div>
                <div className="bg-white rounded-full px-3 py-1 shadow-sm border-2 border-yellow-200 flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-bold text-slate-700">{totalMerits}</span>
                </div>
            </header>

            {/* Badge Grid */}
            <main className="relative z-10 grid grid-cols-2 gap-4">
                {badges.map((badge) => (
                    <div
                        key={badge.id}
                        className={`bg-white rounded-2xl p-4 shadow-lg border-b-4 flex flex-col items-center text-center transition-transform hover:-translate-y-1 ${badge.unlocked ? 'border-blue-200' : 'border-slate-200 opacity-75'}`}
                    >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 ${badge.unlocked ? 'bg-blue-50' : 'bg-slate-100 grayscale'}`}>
                            {badge.unlocked ? badge.icon : <Lock className="h-6 w-6 text-slate-400" />}
                        </div>

                        <h3 className="font-bold text-slate-800 leading-tight mb-1">{badge.name}</h3>
                        <p className="text-xs text-slate-500 font-medium leading-snug mb-2">{badge.desc}</p>

                        {badge.unlocked ? (
                            <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                Unlocked {badge.date}
                            </span>
                        ) : (
                            <div className="w-full mt-auto">
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1">
                                    <div className="bg-slate-300 h-full w-[60%]"></div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Locked</span>
                            </div>
                        )}
                    </div>
                ))}
            </main>
        </div>
    );
}
