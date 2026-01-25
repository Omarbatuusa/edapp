import { GraduationCap } from 'lucide-react';

export default function ApplyLanding() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 text-center max-w-md">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">School Admissions</h1>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                    Welcome to the application portal. Please proceed to start your admission process.
                </p>
                <button className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors">
                    Start Application
                </button>
            </div>
        </div>
    );
}
