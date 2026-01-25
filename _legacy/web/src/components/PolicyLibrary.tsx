import React, { useState } from 'react';
import { MOCK_POLICIES, type Policy } from '../utils/mockPolicies';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Edit2, Plus } from 'lucide-react';

interface PolicyLibraryProps {
    role: 'admin' | 'staff' | 'student' | 'parent';
    onBack: () => void;
}

export default function PolicyLibrary({ role, onBack }: PolicyLibraryProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [policies, setPolicies] = useState<Policy[]>([]);

    React.useEffect(() => {
        fetch('/v1/policies')
            .then(res => res.json())
            .then(data => setPolicies(data))
            .catch(console.error);
    }, []);

    const isAdmin = role === 'admin' || role === 'staff';

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div>
                        <h1 className="font-semibold text-gray-900 dark:text-white">School Policies</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isAdmin ? 'Manage & Enforce' : 'View & Acknowledge'}
                        </p>
                    </div>
                </div>
                {isAdmin && (
                    <button className="flex items-center space-x-1 px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
                        <Plus className="w-4 h-4" />
                        <span>New</span>
                    </button>
                )}
            </div>

            {/* Read / Detail View */}
            {selectedPolicy ? (
                <div className="flex-1 overflow-y-auto p-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded mb-2">
                                    {selectedPolicy.category}
                                </span>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    {selectedPolicy.title}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Version {selectedPolicy.version} • Effective: {selectedPolicy.effectiveDate}
                                </p>
                            </div>
                            {isAdmin && (
                                <button className="p-2 text-primary hover:bg-primary/5 rounded-full">
                                    <Edit2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-4"
                            dangerouslySetInnerHTML={{ __html: selectedPolicy.content }}
                        />
                    </div>

                    {!isAdmin && selectedPolicy.requiredAck && (
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                            <button className="w-full flex justify-center items-center space-x-2 py-3 bg-primary text-white font-medium rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                                <CheckCircle className="w-5 h-5" />
                                <span>I Acknowledge & Understand</span>
                            </button>
                        </div>
                    )}

                    <button onClick={() => setSelectedPolicy(null)} className="w-full py-3 text-gray-500 dark:text-gray-400 font-medium">
                        Close
                    </button>
                </div>
            ) : (
                /* List View */
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Tabs */}
                    {!isAdmin && (
                        <div className="flex p-1 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'all' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                All Policies
                            </button>
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Pending Action
                            </button>
                        </div>
                    )}

                    {policies.map((policy) => (
                        <div
                            key={policy.id}
                            onClick={() => setSelectedPolicy(policy)}
                            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 active:scale-98 transition-transform cursor-pointer"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <div className={`p-2 rounded-lg ${policy.requiredAck ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                            {policy.title}
                                        </h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                                {policy.category}
                                            </span>
                                            {policy.requiredAck && (
                                                <span className="flex items-center text-xs text-amber-600 dark:text-amber-400">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    Action Req
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">v{policy.version}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
