import { useState } from 'react';
import {
    ArrowLeft,
    Languages,
    Clock,
    Search,
    ListFilter,
    ThumbsUp,
    Heart,
    Calendar,
    Share2,
    Download,
    CheckCircle,
    Edit,
    GraduationCap
} from 'lucide-react';

interface CommunicationHubProps {
    onBack: () => void;
}

type Tab = 'announcements' | 'messages' | 'support';

export default function CommunicationHub({ onBack }: CommunicationHubProps) {
    const [activeTab, setActiveTab] = useState<Tab>('announcements');

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col max-w-2xl mx-auto bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            {/* Top App Bar */}
            <div className="flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 pb-2 justify-between sticky top-0 z-40 border-b border-slate-100 dark:border-slate-800 shadow-sm">
                <button
                    onClick={onBack}
                    className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-start cursor-pointer transition-opacity hover:opacity-70"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Communication Hub</h2>
                <div className="flex items-center justify-end gap-1 cursor-pointer group">
                    <Languages className="text-primary h-5 w-5 group-hover:scale-110 transition-transform" />
                    <p className="text-primary text-sm font-bold leading-normal tracking-[0.015em] hidden sm:block">Translate</p>
                </div>
            </div>

            {/* Office Hours Banner */}
            <div className="bg-blue-50 dark:bg-slate-800 border-b border-blue-100 dark:border-slate-700 px-4 py-2 flex items-center justify-center gap-2">
                <Clock className="text-primary h-4 w-4" />
                <p className="text-slate-600 dark:text-slate-300 text-xs font-medium leading-normal text-center">
                    Office Hours: Mon-Fri, 8 AM - 3 PM. Responses may be delayed.
                </p>
            </div>

            {/* Tabs */}
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pt-2 sticky top-[73px] z-30 shadow-sm border-t-0">
                <div className="flex border-b border-slate-200 dark:border-slate-700 px-4 justify-between">
                    <button
                        onClick={() => setActiveTab('announcements')}
                        className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-2 flex-1 transition-colors ${activeTab === 'announcements' ? 'border-primary text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${activeTab === 'announcements' ? 'text-primary' : ''}`}>Announcements</p>
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-2 flex-1 transition-colors ${activeTab === 'messages' ? 'border-primary text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        <div className="relative">
                            <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${activeTab === 'messages' ? 'text-primary' : ''}`}>Messages</p>
                            <span className="absolute -top-1 -right-2 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('support')}
                        className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-2 flex-1 transition-colors ${activeTab === 'support' ? 'border-primary text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${activeTab === 'support' ? 'text-primary' : ''}`}>Support</p>
                    </button>
                </div>
            </div>

            {activeTab === 'announcements' && (
                <>
                    {/* Search Bar */}
                    <div className="px-4 py-4 bg-white dark:bg-slate-900">
                        <label className="flex flex-col h-12 w-full">
                            <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 focus-within:ring-2 focus-within:ring-primary transition-shadow">
                                <div className="text-slate-400 dark:text-slate-500 flex bg-slate-50 dark:bg-slate-800 items-center justify-center pl-4 rounded-l-xl border-r-0">
                                    <Search className="h-5 w-5" />
                                </div>
                                <input
                                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl rounded-l-none text-slate-900 dark:text-white focus:outline-0 bg-slate-50 dark:bg-slate-800 h-full placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 pl-2 text-sm font-normal leading-normal focus:outline-none"
                                    placeholder="Search announcements..."
                                />
                                <div className="text-slate-400 dark:text-slate-500 flex bg-slate-50 dark:bg-slate-800 items-center justify-center pr-4 rounded-r-xl border-l-0 cursor-pointer hover:text-primary">
                                    <ListFilter className="h-5 w-5" />
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Scrollable Content: Announcements Feed */}
                    <div className="flex-1 overflow-y-auto pb-24 px-4 space-y-5 bg-white dark:bg-slate-900 hide-scrollbar">
                        {/* Urgent Card */}
                        <div className="relative group cursor-pointer">
                            <div className="bg-cover bg-center flex flex-col items-stretch justify-end rounded-2xl pt-[160px] shadow-lg overflow-hidden relative transform transition-transform duration-300 hover:scale-[1.01]" style={{ backgroundImage: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0.8) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDmQ6wyVDQI2s1YRV1yVEWGlhtismt7M0drYEekVu8kG2yBTWPqITlJWRd79cxb3weRR3iOS1fTXC14qpfkvFewdTJ4YeFnk4S6cG3fPHs4LAgB7wmacvFUaZPd_YzHY22DVn768gQMTCYz_fvhocpJVZN6_gY6fDuODVKiDdqLYXPja_v-eW1PrTNWyM7gxNQIRcDc7APm02JfLZY93z70utm1njwbuLPPDNSuefNiwJ9ia4WjETQ888Fe0Aiob9XOT0qlAlTTaIA")' }}>
                                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-pulse">
                                    URGENT
                                </div>
                                <div className="flex w-full flex-col justify-between gap-2 p-5 z-10">
                                    <div className="flex max-w-[440px] flex-1 flex-col gap-1">
                                        <p className="text-white/90 text-xs font-medium uppercase tracking-wider">Alert</p>
                                        <h3 className="text-white text-2xl font-bold leading-tight drop-shadow-sm">School Closed on Monday due to Weather</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="bg-white/20 backdrop-blur-sm p-1 rounded-full">
                                                <GraduationCap className="text-white h-4 w-4" />
                                            </div>
                                            <p className="text-white/90 text-xs font-medium">Principal's Office • 2 hours ago</p>
                                        </div>
                                    </div>
                                    {/* Reaction Bar Overlay */}
                                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/20">
                                        <button className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full px-3 py-1.5 transition-colors">
                                            <ThumbsUp className="text-white h-4 w-4" />
                                            <span className="text-white text-xs font-medium">42</span>
                                        </button>
                                        <button className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full px-3 py-1.5 transition-colors">
                                            <Heart className="text-red-400 fill-red-400 h-4 w-4" />
                                            <span className="text-white text-xs font-medium">18</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Standard Card 1 */}
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
                            <div className="flex gap-4">
                                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-200">
                                    <img alt="Sports Day" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYQrQ9pgCGejXSGhz0FZKfQaDnH-wlaZPy02LL0AB5jO1kSEiLu1iqpGZDhKo9Ob_GUH5cGAoSmVurcA2rwk6IkI4OgvwaYiqGk5varBbHFXq-pjTGi01HLw7UUz3xQgw1OjeqCWqsfPrFNkA2zBZGNj4vEh6RhR_AcmithK5fbxfP_PaOv4Y9z_cdeRjGph6awJnH0TVjXiCIFVr7HLoFT6vTciqdFpHcgiiip0l_WRxwhBIK-dot8elkACYPq6kebglx1dKlnyg" />
                                </div>
                                <div className="flex flex-col flex-1 justify-between py-0.5">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 mb-1">EVENT</span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500">Yesterday</span>
                                        </div>
                                        <h3 className="text-slate-900 dark:text-white font-bold text-base leading-snug">Annual Sports Day Registration Open</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mt-1">Please register your child for the upcoming inter-house athletics competition...</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-3 mt-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Coach Sithole</span>
                                </div>
                                <div className="flex gap-3 text-slate-400 dark:text-slate-500">
                                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                        <Share2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Standard Card 2 */}
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
                            <div className="flex gap-4">
                                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-200">
                                    <img alt="Academics" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAY-serDxw-Uml1BVe96wuXQ59hAnM6lDQr742X9pAtqhkvDVWs3JOBlA0wRvKpR_2Vos7p2BKK74csRbkT0XcgqkZrx-9uJzmKk7JbVIMhq_lCVgvfYMytfnu5zgH5hCVrR_6v0wx_M6GcanrdKWkx6umoDwXG1IPNXQEABcGKvszIh2yW4QJfv0kTT8K7I_pTNgCe5ZTZ4wSAwn-dXBTArCWzEgfI-6QtU50CijkBXOa6hhKzGnoi_aolcMUpN-ozYgvNwd7GGjE" />
                                </div>
                                <div className="flex flex-col flex-1 justify-between py-0.5">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 mb-1">ACADEMIC</span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500">2 days ago</span>
                                        </div>
                                        <h3 className="text-slate-900 dark:text-white font-bold text-base leading-snug">Term 2 Report Cards Available</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mt-1">Report cards for the second term have been finalized and are now available for download.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-3 mt-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                                        <CheckCircle className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Admin</span>
                                </div>
                                <div className="flex gap-3 text-slate-400 dark:text-slate-500">
                                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                        <Download className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase">PDF</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Illustration for end of list */}
                        <div className="flex flex-col items-center justify-center py-8 opacity-60">
                            <CheckCircle className="h-10 w-10 text-slate-300 mb-2" />
                            <p className="text-slate-400 text-sm">You're all caught up!</p>
                        </div>

                        {/* Safe area spacer */}
                        <div className="h-8"></div>
                    </div>
                </>
            )}

            {/* Placeholders for other tabs */}
            {activeTab !== 'announcements' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-60">
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
                        {activeTab === 'messages' ? 'Your inbox is empty' : 'Support options coming soon'}
                    </p>
                </div>
            )}

            {/* Floating Action Button */}
            <div className="absolute bottom-[calc(env(safe-area-inset-bottom,20px)+5rem)] right-6 z-30">
                <button className="flex items-center justify-center h-14 w-14 bg-primary hover:bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/40 transition-all hover:scale-105 active:scale-95">
                    <Edit className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
}
