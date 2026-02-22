export function ContactIllustration() {
    return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[200px]">
            {/* Envelope */}
            <rect x="20" y="55" width="100" height="70" rx="8" fill="#dbeafe" />
            <path d="M20 63 L70 98 L120 63" stroke="#2563eb" strokeWidth="2" fill="none" />
            <path d="M20 63 L20 55 L120 55 L120 63" fill="#93c5fd" />
            {/* Check badge on envelope */}
            <circle cx="108" cy="55" r="16" fill="#2563eb" />
            <path d="M101 55 L106 60 L115 50" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Phone */}
            <rect x="135" y="40" width="46" height="80" rx="10" fill="#1e293b" />
            <rect x="139" y="50" width="38" height="58" rx="6" fill="#2563eb" opacity="0.2" />
            {/* Phone screen content */}
            <rect x="143" y="56" width="30" height="4" rx="2" fill="#93c5fd" />
            <rect x="143" y="64" width="22" height="4" rx="2" fill="#93c5fd" opacity="0.6" />
            <rect x="143" y="72" width="26" height="4" rx="2" fill="#93c5fd" opacity="0.6" />
            {/* Phone button */}
            <circle cx="158" cy="112" r="4" fill="#2563eb" opacity="0.5" />
            {/* @ symbol bubble */}
            <circle cx="50" cy="30" r="18" fill="#dbeafe" />
            <text x="50" y="36" textAnchor="middle" fill="#2563eb" fontSize="18" fontWeight="700" fontFamily="monospace">@</text>
            {/* Signal waves */}
            <path d="M140 25 Q145 20 150 25" stroke="#2563eb" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M137 22 Q145 15 153 22" stroke="#2563eb" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
            <path d="M134 19 Q145 10 156 19" stroke="#2563eb" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.3" />
        </svg>
    );
}
