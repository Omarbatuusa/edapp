export function ReviewIllustration() {
    return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[200px]">
            <defs>
                <linearGradient id="review-card" x1="38" y1="22" x2="162" y2="148" gradientUnits="userSpaceOnUse">
                    <stop stopColor="white" />
                    <stop offset="1" stopColor="hsl(211 100% 97%)" />
                </linearGradient>
                <linearGradient id="review-check" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="hsl(211 100% 50%)" />
                    <stop offset="1" stopColor="hsl(230 80% 55%)" />
                </linearGradient>
                <linearGradient id="review-badge" x1="130" y1="22" x2="166" y2="58" gradientUnits="userSpaceOnUse">
                    <stop stopColor="hsl(45 95% 65%)" />
                    <stop offset="1" stopColor="hsl(35 95% 55%)" />
                </linearGradient>
                <filter id="review-shadow" x="-10%" y="-5%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="hsl(211 60% 30%)" floodOpacity="0.08" />
                </filter>
            </defs>
            {/* Clipboard */}
            <rect x="38" y="24" width="124" height="122" rx="12" fill="url(#review-card)" stroke="hsl(211 30% 90%)" strokeWidth="1" filter="url(#review-shadow)" />
            {/* Clip */}
            <rect x="73" y="16" width="54" height="20" rx="7" fill="hsl(211 100% 94%)" stroke="hsl(211 80% 85%)" strokeWidth="1" />
            <rect x="86" y="22" width="28" height="8" rx="4" fill="hsl(211 100% 72%)" />
            {/* Check items */}
            {[0, 1, 2, 3].map((i) => {
                const y = 60 + i * 24;
                const done = i < 3;
                return (
                    <g key={i}>
                        <circle cx="64" cy={y} r="9" fill={done ? 'url(#review-check)' : 'hsl(211 100% 94%)'} />
                        {done && (
                            <path
                                d={`M59 ${y} L63 ${y + 4} L69 ${y - 4}`}
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                        )}
                        <rect x="82" y={y - 4} width={done ? 65 : 48} height="5" rx="2.5" fill={done ? 'hsl(211 100% 92%)' : 'hsl(0 0% 94%)'} />
                        {!done && <rect x="82" y={y + 4} width="32" height="4" rx="2" fill="hsl(0 0% 95%)" />}
                    </g>
                );
            })}
            {/* Star badge */}
            <circle cx="148" cy="38" r="16" fill="url(#review-badge)" opacity="0.9" />
            <polygon points="148,27 151,34 158,35 153,40 154,47 148,44 142,47 143,40 138,35 145,34" fill="white" opacity="0.9" />
        </svg>
    );
}
