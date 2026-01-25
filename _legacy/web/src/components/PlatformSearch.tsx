import TenantSearch from './TenantSearch';
import { type Tenant } from '../utils/mockData';
import { ShieldCheck } from 'lucide-react';
import Footer from './Footer';

export default function PlatformSearch() {
    const handleTenantFound = (tenant: Tenant) => {
        // Redirect to the tenant's domain
        const protocol = window.location.protocol;
        const rootDomain = 'edapp.co.za'; // Production Root

        let targetDomain = tenant.domain || `${tenant.code.toLowerCase()}.${rootDomain}`;

        // If domain is partial (e.g. 'lakewood-main'), append root domain
        if (!targetDomain.includes('.')) {
            targetDomain = `${targetDomain}.${rootDomain}`;
        }

        window.location.href = `${protocol}//${targetDomain}`;
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md flex-1 flex flex-col justify-center">
                <div className="flex justify-center mb-8">
                    <img src="/logo.svg" alt="EdApp School Connect" className="h-24 w-auto" />
                </div>

                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6">
                    <TenantSearch onTenantFound={handleTenantFound} />

                    {/* Platform Admin Link */}
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-center">
                        <a
                            href="https://admin.edapp.co.za"
                            className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-2"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Platform Admin Login
                        </a>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
