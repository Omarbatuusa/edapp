export default function TenantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // Clean layout wrapper that doesn't enforce standard header/padding
        // allowing the page components to control the full viewport as designed.
        <>
            {children}
        </>
    )
}
