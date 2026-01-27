import Link from "next/link"

const APP_VERSION = "1.0.0"

export function AuthFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="py-6 text-center w-full mt-auto px-4">
            <div className="flex flex-col items-center gap-3">
                {/* Version • Brand • Year inline */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                    <span>v{APP_VERSION}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="font-medium">edAPP</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span>© {currentYear}</span>
                </div>
                {/* Privacy & Terms */}
                <div className="flex items-center justify-center gap-4 text-xs text-slate-400 dark:text-slate-500">
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

