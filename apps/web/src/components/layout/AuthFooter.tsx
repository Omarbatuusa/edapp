import Link from "next/link"

const APP_VERSION = "1.0.0"

export function AuthFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="py-8 text-center w-full mt-auto px-6 border-t border-border/40 bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col gap-4 text-[10px] sm:text-xs text-muted-foreground font-medium max-w-4xl mx-auto">

                {/* Policy Links Row */}
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                    <Link href="/privacy" className="hover:text-primary transition-colors">
                        Privacy Notice
                    </Link>
                    <Link href="/terms" className="hover:text-primary transition-colors">
                        Terms of Use
                    </Link>
                    <Link href="/child-safety" className="hover:text-primary transition-colors">
                        Child Safety
                    </Link>
                    <Link href="/cookies" className="hover:text-primary transition-colors">
                        Cookie Policy
                    </Link>
                    <Link href="/acceptable-use" className="hover:text-primary transition-colors">
                        Acceptable Use
                    </Link>
                    <Link href="/popia-notice" className="hover:text-primary transition-colors">
                        POPIA
                    </Link>
                </div>

                {/* Info Row */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                        <span>v{APP_VERSION}</span>
                        <span className="text-muted-foreground/40">•</span>
                        <span>EdApp © {currentYear}</span>
                    </div>

                    <span className="hidden sm:inline text-muted-foreground/40">•</span>

                    <a href="mailto:admin@edapp.co.za" className="hover:text-primary transition-colors">
                        admin@edapp.co.za
                    </a>
                </div>
            </div>
        </footer>
    )
}
