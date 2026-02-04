const APP_VERSION = "1.0.0"

export function AuthFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="app-footer py-4 text-center w-full px-6 bg-background/80 backdrop-blur-sm">
            <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                v{APP_VERSION} • EdApp © {currentYear}
            </div>
        </footer>
    )
}
