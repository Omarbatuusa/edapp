
import {
    Bell,
    MapPin,
    Share2,
    CheckCircle,
    XCircle,
    Info,
    Phone,
    ShieldAlert,
    Lock
} from 'lucide-react';

interface EmergencyAlertProps {
    onDismiss?: () => void; // Optional for now, usually strictly controlled
}

export default function EmergencyAlert({ onDismiss }: EmergencyAlertProps) {
    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-background-light dark:bg-[#221010] text-[#1c0d0d] dark:text-white font-display overflow-hidden animate-in fade-in duration-300">

            {/* Urgent Header */}
            <header className="bg-red-600 px-5 py-4 flex items-center justify-between text-white shadow-md z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full animate-pulse">
                        <Bell className="h-7 w-7 fill-current" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-wide leading-none">EMERGENCY ALERT</h1>
                        <p className="text-xs font-medium text-white/90 mt-0.5">Updated 2m ago</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <button
                        onClick={onDismiss}
                        className="p-1 -mr-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <XCircle className="h-6 w-6" />
                    </button>
                    <div className="flex flex-col items-end">
                        <span className="text-lg font-bold leading-none">10:42</span>
                        <span className="text-[10px] opacity-80 uppercase leading-none">AM</span>
                    </div>
                </div>
            </header>

            {/* Main Content Scrollable Area */}
            <main className="flex-1 overflow-y-auto pb-32">
                {/* Alert Status Card */}
                <div className="p-4 pt-6">
                    <div className="relative flex flex-col items-start justify-start rounded-xl shadow-lg bg-white dark:bg-[#2a1515] overflow-hidden border-t-4 border-red-600">
                        {/* Urgency Indicator */}
                        <div className="absolute top-0 right-0 p-3">
                            <span className="flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                            </span>
                        </div>
                        <div className="p-5 w-full flex flex-col gap-2">
                            <span className="inline-flex items-center gap-1.5 text-red-600 text-xs font-bold tracking-wider uppercase bg-red-600/10 w-fit px-2 py-1 rounded">
                                <Lock className="h-4 w-4" />
                                Critical Incident
                            </span>
                            <h2 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white mt-1">SCHOOL LOCKDOWN</h2>
                            <div className="flex flex-col gap-1 mt-1 text-gray-600 dark:text-gray-300">
                                <p className="text-base font-medium flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-red-600" />
                                    Green Valley Campus • Main Wing
                                </p>
                                <p className="text-sm mt-2 leading-relaxed">
                                    A security incident has been reported on campus grounds. Local law enforcement has been notified and is en route.
                                </p>
                            </div>
                        </div>

                        {/* Integrated Map Preview */}
                        <div className="w-full h-32 bg-gray-200 relative">
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-80"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBhnmevjkvK0jTiYZTfXcprJ2ENZsMKGRwvBpZ6VjdPrAoRU84j5IeUiu2b1irc4iRCT-skkRN8wQa6iZ9AGzZtKO_4709nxsryc-oedByN8FoinolsseD2INj1Fg8yfoUSMydQlKvvgr7D6GE4hgknwXEDP7n1ECDBtTBw07ORRpxDhGZap_K4btU9wyIXoSJCFpGP1bMv5ZlLwSfoA7xCIRXnDpit6-o30aR-n4d8--jI4OQAJNqugw7dQXYGycDrADbTaYihIMc")' }}
                            ></div>
                            <div className="absolute inset-0 bg-red-600/10 flex items-center justify-center">
                                <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg">
                                    <Share2 className="text-red-600 h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Parent View: My Children Status (Adapted from Staff View) */}
                <div className="px-4 pb-2">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wide flex items-center gap-2">
                                <ShieldAlert className="h-[18px] w-[18px]" />
                                My Children Status
                            </h3>
                            <span className="text-[10px] font-bold bg-white dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded shadow-sm">LIVE</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            {/* Child 1: Safe */}
                            <div className="flex items-center justify-between bg-white dark:bg-[#2a1515] p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBUvWGhdnFTHnNWhmy7HMx3D1aVyZ9IjyL49OYMImFj-sanAvzCBAKi4Uf3voBKTl9wmAo-YIDBk7uymO5-eIuX5xOiaiYwysK_QSUocZQ1oicjCGrwcG-JqhKPLRLk861Zy-wu1YLscP6BwIBHZqiA5tToD4dDXPB-OkQ5sTwkVSkMfy-ZSrfwLdN67fIe64YQ9mDRHNvZpMRNy-raPT9Ky4KP4M05HfH3eOwxCT6NQ8SA6OhCa23w6nPIhfMLuWBQQ95oQiwuagI")' }}></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Zola M.</p>
                                        <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" /> Marked Safe
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Child 2: Unaccounted (Simulated Anxiety for Demo) */}
                            <div className="flex items-center justify-between bg-white dark:bg-[#2a1515] p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                                <div className="absolute inset-0 bg-red-600/5 pointer-events-none"></div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDV6SWXMcMvwG7daVg4ryYHTGmj2dFLeqTgl14DPqrBLq3jW2l0Wt0NinWQapThji4xOGzVA4rxIeejlNYWtX3HLnK_XjKG8OYyqra15OjPvjZzKAvGwg7Z7it0BbyI61EN4eIBZMZkaRs7wcyTQI1ZNGRgK9cyA3IYLoIjnIG56WLEG5cD-6gjTFHwYIYcEttw7I0ie0sIAybTMYtWKtPvJQAdj6-JmIsR-YuO3xWylkndeWkORYP9uhjC0fzWkfl25K4eZoPWn8g")' }}></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Lefu K.</p>
                                        <span className="text-xs text-red-600 font-bold flex items-center gap-1">
                                            <XCircle className="h-3 w-3" /> Status Unknown
                                        </span>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/50">
                                    Check
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions Section */}
                <div className="px-4 py-4">
                    <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                        <Info className="h-5 w-5 text-gray-400" />
                        Immediate Instructions
                    </h3>
                    <div className="flex flex-col gap-4">
                        {/* Step 1 */}
                        <div className="flex gap-4 items-start bg-white dark:bg-[#2a1515] p-4 rounded-xl shadow-sm border-l-4 border-l-[#e8cece]">
                            <div className="flex-shrink-0 size-8 rounded-full bg-red-600/10 text-red-600 flex items-center justify-center font-bold text-sm">1</div>
                            <div>
                                <p className="text-red-600 text-sm font-bold mb-1">Stay Away</p>
                                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">Do clearly not approach the school premises. Roads are blocked.</p>
                            </div>
                        </div>
                        {/* Step 2 */}
                        <div className="flex gap-4 items-start bg-white dark:bg-[#2a1515] p-4 rounded-xl shadow-sm border-l-4 border-l-[#e8cece]">
                            <div className="flex-shrink-0 size-8 rounded-full bg-red-600/10 text-red-600 flex items-center justify-center font-bold text-sm">2</div>
                            <div>
                                <p className="text-red-600 text-sm font-bold mb-1">Wait for Updates</p>
                                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">We will notify you via this app when it is safe to collect children.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-6"></div>
            </main>

            {/* Fixed Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white/95 dark:bg-[#221010]/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 p-5 pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-30">
                <div className="flex flex-col gap-3">
                    <button className="group w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all duration-200 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-red-500/30 flex items-center justify-center gap-3 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <CheckCircle className="h-7 w-7" />
                        <span>I ACKNOWLEDGE</span>
                    </button>
                    <button className="w-full py-3 text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 hover:text-red-600 transition-colors">
                        <Phone className="h-[18px] w-[18px]" />
                        Emergency Contacts
                    </button>
                </div>
            </div>
        </div>
    );
}
