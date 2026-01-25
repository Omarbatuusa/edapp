import React, { useState } from 'react';
import { ArrowRight, School, Loader2 } from 'lucide-react';
import { searchTenant } from '../services/tenantService';
import type { Tenant } from '../utils/mockData';

interface TenantSearchProps {
    onTenantFound: (tenant: Tenant) => void;
}

export default function TenantSearch({ onTenantFound }: TenantSearchProps) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError('');

        try {
            const tenant = await searchTenant(code.trim());
            if (tenant) {
                onTenantFound(tenant);
            } else {
                setError('School not found. Please check the code.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Identify your School</h2>
                <p className="text-gray-500 dark:text-gray-400">Enter your school code to continue</p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <School className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Enter School Code (e.g., STMARKS)"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-sm text-center animate-pulse">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading || !code.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                    {loading ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                        <>
                            <span>Continue</span>
                            <ArrowRight className="h-5 w-5" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button className="text-primary hover:text-blue-600 text-sm font-medium flex items-center justify-center gap-1 mx-auto transition-colors">
                    <span>Use Verified Discovery</span>
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
