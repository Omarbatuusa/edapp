import { X } from 'lucide-react';

export default function TermsOfUse({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-surface-dark w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Terms of Use</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-600 dark:text-gray-300">
                    <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
                    <p>Welcome to EdApp. By using our platform, you agree to these Terms of Use.</p>

                    <h3 className="font-bold text-gray-900 dark:text-white">1. Acceptable Use</h3>
                    <p>You agree to use EdApp only for lawful educational purposes and in accordance with your school's code of conduct.</p>

                    <h3 className="font-bold text-gray-900 dark:text-white">2. User Accounts</h3>
                    <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>

                    <h3 className="font-bold text-gray-900 dark:text-white">3. Intellectual Property</h3>
                    <p>All content and materials available on EdApp are the property of EdApp or its licensors and are protected by copyright laws.</p>
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
