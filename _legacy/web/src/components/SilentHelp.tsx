import {
    X,
    ShieldAlert,
    MessageCircle,
    HeartPulse,
    User,
    MapPin,
    Send
} from 'lucide-react';

interface SilentHelpProps {
    onDismiss: () => void;
}

export default function SilentHelp({ onDismiss }: SilentHelpProps) {
    return (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-end sm:justify-center">
            {/* Dimmed Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
                onClick={onDismiss}
            ></div>

            {/* Bottom Sheet Modal */}
            <div className="relative w-full max-w-md mx-auto transform transition-transform duration-300 ease-out animate-in slide-in-from-bottom">
                <div className="flex flex-col rounded-t-3xl sm:rounded-3xl bg-background-light dark:bg-background-dark shadow-2xl max-h-[90vh] overflow-y-auto">

                    {/* Header */}
                    <div className="sticky top-0 z-30 flex flex-col items-center bg-background-light dark:bg-background-dark pt-3 pb-2 rounded-t-3xl">
                        <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600 mb-4"></div>
                        <button
                            onClick={onDismiss}
                            aria-label="Close"
                            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 px-6 pb-8 overflow-y-auto scrollbar-thin">
                        <div className="mb-2 text-center">
                            <h2 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight leading-tight">How can we help?</h2>
                        </div>
                        <div className="mb-8 text-center px-2">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-relaxed">
                                This request is <span className="font-medium text-slate-700 dark:text-slate-300">private</span> and goes directly to the counseling team.
                            </p>
                        </div>

                        {/* Selection Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {/* Card 1: Unsafe Situation */}
                            <button className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#1a242d] p-5 shadow-sm hover:border-primary/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:shadow-md transition-all active:scale-[0.98]">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-primary dark:bg-blue-900/20 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <ShieldAlert className="h-7 w-7" />
                                </div>
                                <h3 className="text-slate-800 dark:text-slate-100 text-sm font-semibold leading-tight text-center">Unsafe<br />Situation</h3>
                            </button>
                            {/* Card 2: Bullying */}
                            <button className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#1a242d] p-5 shadow-sm hover:border-primary/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:shadow-md transition-all active:scale-[0.98]">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-primary dark:bg-blue-900/20 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <MessageCircle className="h-7 w-7" />
                                </div>
                                <h3 className="text-slate-800 dark:text-slate-100 text-sm font-semibold leading-tight text-center">Bullying /<br />Harassment</h3>
                            </button>
                            {/* Card 3: Health/Anxiety */}
                            <button className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#1a242d] p-5 shadow-sm hover:border-primary/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:shadow-md transition-all active:scale-[0.98]">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-primary dark:bg-blue-900/20 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <HeartPulse className="h-7 w-7" />
                                </div>
                                <h3 className="text-slate-800 dark:text-slate-100 text-sm font-semibold leading-tight text-center">Anxiety /<br />Health</h3>
                            </button>
                            {/* Card 4: Counselor */}
                            <button className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#1a242d] p-5 shadow-sm hover:border-primary/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:shadow-md transition-all active:scale-[0.98]">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-primary dark:bg-blue-900/20 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <User className="h-7 w-7" />
                                </div>
                                <h3 className="text-slate-800 dark:text-slate-100 text-sm font-semibold leading-tight text-center">Counselor<br />Chat</h3>
                            </button>
                        </div>

                        {/* Text Field */}
                        <div className="mb-6">
                            <label className="block w-full">
                                <span className="sr-only">Additional Details</span>
                                <textarea
                                    className="w-full resize-none rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#1a242d] p-4 text-base text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow"
                                    placeholder="Add details (optional)..."
                                    rows={3}
                                ></textarea>
                            </label>
                        </div>

                        {/* Primary Action Button */}
                        <button
                            onClick={onDismiss}
                            className="w-full rounded-xl bg-primary py-4 px-6 text-center text-base font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                        >
                            <Send className="h-5 w-5" />
                            Send Confidential Request
                        </button>

                        {/* Microcopy */}
                        <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Your location will be shared with the safety officer.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
