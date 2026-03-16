export function BrandingIllustration() {
    return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[200px] gentle-float">
            <defs>
                <linearGradient id="branding-card" x1="30" y1="18" x2="170" y2="130" gradientUnits="userSpaceOnUse">
                    <stop stopColor="white" />
                    <stop offset="1" stopColor="hsl(211 100% 97%)" />
                </linearGradient>
                <linearGradient id="branding-img" x1="42" y1="30" x2="158" y2="90" gradientUnits="userSpaceOnUse">
                    <stop stopColor="hsl(211 100% 92%)" />
                    <stop offset="1" stopColor="hsl(224 76% 88%)" />
                </linearGradient>
                <linearGradient id="branding-accent" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="hsl(211 100% 50%)" />
                    <stop offset="1" stopColor="hsl(230 80% 55%)" />
                </linearGradient>
                <filter id="branding-shadow" x="-10%" y="-5%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="hsl(211 60% 30%)" floodOpacity="0.08" />
                </filter>
            </defs>
            {/* Card */}
            <rect x="28" y="18" width="144" height="104" rx="12" fill="url(#branding-card)" stroke="hsl(211 30% 90%)" strokeWidth="1" filter="url(#branding-shadow)" />
            {/* Image area */}
            <rect x="40" y="30" width="120" height="58" rx="8" fill="url(#branding-img)" />
            {/* Mountain/landscape icon */}
            <path d="M60 74 L80 50 L95 66 L110 46 L140 74 Z" fill="hsl(211 100% 75%)" opacity="0.6" />
            <path d="M75 74 L95 54 L115 74 Z" fill="hsl(211 100% 60%)" opacity="0.7" />
            <circle cx="120" cy="42" r="6" fill="hsl(45 90% 70%)" opacity="0.8" />
            {/* Upload badge */}
            <circle cx="152" cy="34" r="12" fill="url(#branding-accent)" />
            <path d="M152 40 L152 30 M148 34 L152 30 L156 34" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            {/* Color palette swatches */}
            <circle cx="52" cy="108" r="9" fill="hsl(211 100% 50%)" />
            <circle cx="74" cy="108" r="9" fill="hsl(225 15% 15%)" />
            <circle cx="96" cy="108" r="9" fill="hsl(211 100% 72%)" />
            <circle cx="118" cy="108" r="9" fill="hsl(211 100% 90%)" />
            <circle cx="140" cy="108" r="9" fill="hsl(0 0% 96%)" stroke="hsl(211 30% 88%)" strokeWidth="1" />
            {/* Selection ring on first swatch */}
            <circle cx="52" cy="108" r="12" fill="none" stroke="hsl(211 100% 50%)" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
            {/* Easel legs */}
            <line x1="58" y1="122" x2="48" y2="148" stroke="hsl(215 15% 70%)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="142" y1="122" x2="152" y2="148" stroke="hsl(215 15% 70%)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="100" y1="122" x2="100" y2="152" stroke="hsl(215 15% 70%)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}
