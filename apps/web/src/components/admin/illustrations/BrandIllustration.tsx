export function BrandIllustration() {
    return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[200px]">
            <defs>
                <linearGradient id="brand-bg" x1="40" y1="20" x2="160" y2="140" gradientUnits="userSpaceOnUse">
                    <stop stopColor="hsl(211 100% 92%)" />
                    <stop offset="1" stopColor="hsl(224 76% 90%)" />
                </linearGradient>
                <linearGradient id="brand-core" x1="82" y1="56" x2="118" y2="104" gradientUnits="userSpaceOnUse">
                    <stop stopColor="hsl(211 100% 50%)" />
                    <stop offset="1" stopColor="hsl(230 80% 55%)" />
                </linearGradient>
                <filter id="brand-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            {/* Outer ring */}
            <circle cx="100" cy="78" r="58" fill="url(#brand-bg)" opacity="0.6" />
            <circle cx="100" cy="78" r="42" fill="url(#brand-bg)" />
            {/* Core */}
            <circle cx="100" cy="78" r="22" fill="url(#brand-core)" filter="url(#brand-glow)" />
            {/* Building icon */}
            <rect x="92" y="68" width="16" height="18" rx="2" fill="white" opacity="0.95" />
            <rect x="95" y="71" width="4" height="4" rx="0.5" fill="hsl(211 100% 50%)" opacity="0.5" />
            <rect x="101" y="71" width="4" height="4" rx="0.5" fill="hsl(211 100% 50%)" opacity="0.5" />
            <rect x="95" y="77" width="4" height="4" rx="0.5" fill="hsl(211 100% 50%)" opacity="0.5" />
            <rect x="101" y="77" width="4" height="4" rx="0.5" fill="hsl(211 100% 50%)" opacity="0.5" />
            <rect x="97" y="82" width="6" height="4" rx="1" fill="hsl(211 100% 50%)" opacity="0.7" />
            {/* Orbiting school nodes */}
            <circle cx="52" cy="56" r="8" fill="white" stroke="hsl(211 100% 80%)" strokeWidth="1.5" />
            <rect x="48" y="53" width="8" height="6" rx="1" fill="hsl(211 100% 50%)" opacity="0.4" />
            <circle cx="148" cy="56" r="8" fill="white" stroke="hsl(211 100% 80%)" strokeWidth="1.5" />
            <rect x="144" y="53" width="8" height="6" rx="1" fill="hsl(211 100% 50%)" opacity="0.4" />
            <circle cx="52" cy="100" r="8" fill="white" stroke="hsl(211 100% 80%)" strokeWidth="1.5" />
            <rect x="48" y="97" width="8" height="6" rx="1" fill="hsl(211 100% 50%)" opacity="0.4" />
            <circle cx="148" cy="100" r="8" fill="white" stroke="hsl(211 100% 80%)" strokeWidth="1.5" />
            <rect x="144" y="97" width="8" height="6" rx="1" fill="hsl(211 100% 50%)" opacity="0.4" />
            {/* Connection lines */}
            <line x1="60" y1="59" x2="80" y2="70" stroke="hsl(211 100% 70%)" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            <line x1="140" y1="59" x2="120" y2="70" stroke="hsl(211 100% 70%)" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            <line x1="60" y1="97" x2="80" y2="86" stroke="hsl(211 100% 70%)" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            <line x1="140" y1="97" x2="120" y2="86" stroke="hsl(211 100% 70%)" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            {/* Label pill */}
            <rect x="68" y="122" width="64" height="22" rx="11" fill="url(#brand-core)" />
            <text x="100" y="136" textAnchor="middle" fill="white" fontSize="9" fontWeight="600" fontFamily="system-ui, sans-serif">Brand</text>
        </svg>
    );
}
