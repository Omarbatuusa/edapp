export function SchoolIllustration() {
    return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[200px]">
            {/* Ground */}
            <rect x="20" y="120" width="160" height="8" rx="4" fill="#dbeafe" />
            {/* Main building */}
            <rect x="50" y="70" width="100" height="52" rx="4" fill="#bfdbfe" />
            {/* Roof */}
            <polygon points="40,72 100,30 160,72" fill="#2563eb" />
            {/* Door */}
            <rect x="86" y="98" width="28" height="24" rx="3" fill="#1e293b" />
            <circle cx="117" cy="112" r="2" fill="#f1f5f9" />
            {/* Windows */}
            <rect x="60" y="82" width="20" height="16" rx="2" fill="white" opacity="0.8" />
            <rect x="120" y="82" width="20" height="16" rx="2" fill="white" opacity="0.8" />
            {/* Cross lines on windows */}
            <line x1="70" y1="82" x2="70" y2="98" stroke="#bfdbfe" strokeWidth="1" />
            <line x1="60" y1="90" x2="80" y2="90" stroke="#bfdbfe" strokeWidth="1" />
            <line x1="130" y1="82" x2="130" y2="98" stroke="#bfdbfe" strokeWidth="1" />
            <line x1="120" y1="90" x2="140" y2="90" stroke="#bfdbfe" strokeWidth="1" />
            {/* Flagpole */}
            <line x1="100" y1="30" x2="100" y2="10" stroke="#1e293b" strokeWidth="1.5" />
            <rect x="100" y="10" width="18" height="12" rx="1" fill="#2563eb" />
            <line x1="100" y1="10" x2="118" y2="14" stroke="#1e293b" strokeWidth="0.5" />
            {/* Trees */}
            <ellipse cx="32" cy="110" rx="14" ry="18" fill="#86efac" />
            <rect x="29" y="116" width="6" height="12" rx="2" fill="#4ade80" />
            <ellipse cx="168" cy="110" rx="14" ry="18" fill="#86efac" />
            <rect x="165" y="116" width="6" height="12" rx="2" fill="#4ade80" />
        </svg>
    );
}
