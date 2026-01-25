import { useState, useEffect } from 'react';
import { FileText, Download, Plus, Search, Filter, Shield, AlertTriangle } from 'lucide-react';

interface Policy {
    id: string;
    title: string;
    content: string;
    category: string;
    version: string;
    file_url: string;
    created_at: string;
}

export default function PolicyLibrary() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    // Mock user role for now - in real app, get from context
    const canEdit = true;

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/policies');
            if (res.ok) {
                const data = await res.json();
                setPolicies(data);
            }
        } catch (error) {
            console.error("Failed to fetch policies", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">School Policies</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Review guidelines and code of conduct</p>
                </div>
                {canEdit && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        <Plus className="h-5 w-5" />
                        New Policy
                    </button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
                {['All', 'Conduct', 'Uniform', 'Academic', 'Safety'].map((cat) => (
                    <button key={cat} className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap hover:border-primary hover:text-primary transition-colors">
                        {cat}
                    </button>
                ))}
            </div>

            {/* Policy List */}
            <div className="grid gap-4">
                {policies.map((policy) => (
                    <div key={policy.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary shrink-0">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{policy.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wide">{policy.category}</span>
                                        <span className="text-xs text-slate-400">v{policy.version}</span>
                                    </div>
                                </div>
                            </div>
                            {policy.file_url && (
                                <a
                                    href={policy.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors"
                                >
                                    <Download className="h-5 w-5" />
                                </a>
                            )}
                        </div>
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                            {policy.content}
                        </p>
                    </div>
                ))}

                {!loading && policies.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-full mb-4">
                            <Shield className="h-8 w-8 opacity-50" />
                        </div>
                        <p className="text-sm font-medium">No policies found</p>
                    </div>
                )}
            </div>

            {/* Minimal Add Modal Mockup (To be fully implemented) */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 animate-in slide-in-from-bottom-10 fade-in duration-200">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Add New Policy</h2>
                        <p className="text-slate-500 mb-6">Upload a PDF or write the policy content.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button className="flex-1 py-3 rounded-xl font-bold text-white bg-primary hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-colors">
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
