import { X } from 'lucide-react';

export default function PrivacyPolicy({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-surface-dark w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy Policy</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-600 dark:text-gray-300">
                    <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
                    <p>At EdApp, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.</p>

                    <h3 className="font-bold text-gray-900 dark:text-white">1. Information We Collect</h3>
                    <p>We collect information necessary to provide educational services, including student names, grades, and academic performance data, as authorized by your school.</p>

                    <h3 className="font-bold text-gray-900 dark:text-white">2. How We Use Your Data</h3>
                    <p>Your data is used solely for educational purposes: managing operational needs, tracking academic progress, and facilitating communication between school, parents, and students.</p>

                    <h3 className="font-bold text-gray-900 dark:text-white">3. Data Security</h3>
                    <p>We implement industry-standard security measures to protect your data from unauthorized access.</p>
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
