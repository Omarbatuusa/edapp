import Link from "next/link"

const APP_VERSION = "1.0.0"

export function AuthFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="py-6 text-center w-full mt-auto px-6">
            <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                v{APP_VERSION} • EdApp © {currentYear}
            </div>
        </footer>
    )
}

