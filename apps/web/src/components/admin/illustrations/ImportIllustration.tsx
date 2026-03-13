export function ImportIllustration() {
    return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[200px]">
            <circle cx="100" cy="70" r="55" fill="#dcfce7" />
            {/* Spreadsheet */}
            <rect x="62" y="35" width="76" height="90" rx="6" fill="white" stroke="#86efac" strokeWidth="2" />
            {/* Grid lines */}
            <line x1="62" y1="55" x2="138" y2="55" stroke="#bbf7d0" strokeWidth="1" />
            <line x1="62" y1="70" x2="138" y2="70" stroke="#bbf7d0" strokeWidth="1" />
            <line x1="62" y1="85" x2="138" y2="85" stroke="#bbf7d0" strokeWidth="1" />
            <line x1="62" y1="100" x2="138" y2="100" stroke="#bbf7d0" strokeWidth="1" />
            <line x1="95" y1="35" x2="95" y2="125" stroke="#bbf7d0" strokeWidth="1" />
            {/* Header cells */}
            <rect x="63" y="36" width="32" height="18" fill="#22c55e" rx="3" />
            <rect x="96" y="36" width="42" height="18" fill="#22c55e" rx="3" />
            {/* Data cells */}
            <rect x="66" y="59" width="24" height="4" rx="2" fill="#86efac" />
            <rect x="100" y="59" width="30" height="4" rx="2" fill="#86efac" />
            <rect x="66" y="74" width="20" height="4" rx="2" fill="#86efac" />
            <rect x="100" y="74" width="34" height="4" rx="2" fill="#86efac" />
            {/* Upload arrow */}
            <circle cx="130" cy="115" r="16" fill="#22c55e" />
            <path d="M130 108 L122 118 L127 118 L127 124 L133 124 L133 118 L138 118 Z" fill="white" />
        </svg>
    );
}
