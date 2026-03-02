export function AcademicIllustration() {
    return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[200px]">
            <circle cx="100" cy="70" r="55" fill="#e0e7ff" />
            <polygon points="100,35 145,58 100,75 55,58" fill="#4f46e5" />
            <polygon points="100,75 145,58 145,78 100,95 55,78 55,58" fill="#6366f1" opacity="0.7" />
            <line x1="145" y1="58" x2="145" y2="90" stroke="#4f46e5" strokeWidth="2" />
            <circle cx="145" cy="92" r="4" fill="#4f46e5" />
            <line x1="100" y1="75" x2="100" y2="100" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="3 2" />
            <rect x="68" y="120" width="64" height="18" rx="9" fill="#4f46e5" />
            <text x="100" y="132" textAnchor="middle" fill="white" fontSize="9" fontWeight="600" fontFamily="sans-serif">Academic</text>
        </svg>
    );
}
