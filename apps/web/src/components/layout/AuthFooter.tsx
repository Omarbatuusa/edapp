import Link from "next/link"

const APP_VERSION = "1.0.0"

export function AuthFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="py-4 text-center w-full mt-auto px-6 border-t border-slate-200/50 dark:border-slate-800/50 bg-[#f6f7f8] dark:bg-[#101922]">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium">
                {/* Version • Brand • Year */}
                <div className="flex items-center gap-2">
                    <span>v{APP_VERSION}</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span>EdApp</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span>© {currentYear}</span>
                </div>

                {/* Hidden divider on mobile, visible on desktop */}
                <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>

                {/* Privacy & Terms */}
                <div className="flex items-center gap-4">
                    <Link href="/privacy" className="hover:text-primary transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="hover:text-primary transition-colors">
                        Terms of Use
                    </Link>
                </div>
            </div>
        </footer>
    )
}

