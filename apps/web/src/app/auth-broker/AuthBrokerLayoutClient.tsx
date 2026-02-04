'use client';

export default function AuthBrokerLayoutClient({
    children,
}: {
    children: React.ReactNode
}) {
    // Pages manage their own headers/footers for flexibility
    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen min-h-[100dvh] flex flex-col font-display transition-colors duration-300">
            {children}
        </div>
    )
}

