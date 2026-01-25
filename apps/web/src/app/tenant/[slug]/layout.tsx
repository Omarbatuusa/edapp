export default async function TenantLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <div className="mr-4 hidden md:flex">
                        <a className="mr-6 flex items-center space-x-2" href={`/${slug}`}>
                            <span className="hidden font-bold sm:inline-block">
                                School: {slug.toUpperCase()}
                            </span>
                        </a>
                    </div>
                </div>
            </header>
            <main className="flex-1 container py-6">
                {children}
            </main>
        </div>
    )
}
