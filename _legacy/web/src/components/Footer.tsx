import { useState } from 'react';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfUse from './TermsOfUse';

export default function Footer() {
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const currentYear = new Date().getFullYear();
    const appVersion = "v2.3"; // Consistent with App.tsx debug

    return (
        <footer className="w-full py-4 text-center text-xs text-gray-400 dark:text-gray-500 mt-auto">
            <p className="mb-1">
                &copy; {currentYear} EdApp {appVersion}
            </p>
            <div className="flex justify-center gap-4">
                <button onClick={() => setShowPrivacy(true)} className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    Privacy Policy
                </button>
                <span>|</span>
                <button onClick={() => setShowTerms(true)} className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    Terms of Use
                </button>
            </div>

            {/* Modals */}
            {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
            {showTerms && <TermsOfUse onClose={() => setShowTerms(false)} />}
        </footer>
    );
}
