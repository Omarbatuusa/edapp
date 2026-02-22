export function ReviewIllustration() {
    return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[200px]">
            {/* Clipboard */}
            <rect x="40" y="25" width="120" height="120" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="2" />
            {/* Clip top */}
            <rect x="75" y="18" width="50" height="20" rx="6" fill="#dbeafe" stroke="#bfdbfe" strokeWidth="1.5" />
            <rect x="88" y="24" width="24" height="8" rx="4" fill="#93c5fd" />
            {/* Check items */}
            {[0, 1, 2, 3].map((i) => (
                <g key={i}>
                    <circle cx="65" cy={62 + i * 22} r="9" fill={i < 3 ? '#2563eb' : '#dbeafe'} />
                    {i < 3 && (
                        <path
                            d={`M60 ${62 + i * 22} L64 ${66 + i * 22} L70 ${58 + i * 22}`}
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                    )}
                    <rect x="82" y={56 + i * 22} width={i === 3 ? 50 : 65} height="6" rx="3" fill={i < 3 ? '#dbeafe' : '#f1f5f9'} />
                    {i === 3 && <rect x="82" y={64 + i * 22} width="35" height="4" rx="2" fill="#f1f5f9" />}
                </g>
            ))}
            {/* Star badge */}
            <circle cx="148" cy="38" r="18" fill="#fef3c7" />
            <polygon points="148,26 151,34 160,34 153,40 156,48 148,43 140,48 143,40 136,34 145,34" fill="#f59e0b" />
        </svg>
    );
}
