import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const url = request.nextUrl.clone();

    // Extract tenant from hostname
    const tenant = extractTenantFromHost(hostname);

    // Route based on domain
    if (hostname.startsWith('app.') || hostname === 'localhost' || hostname.startsWith('localhost:')) {
        // app.edapp.co.za -> Discovery
        if (!url.pathname.startsWith('/discovery') && url.pathname === '/') {
            url.pathname = '/discovery';
            return NextResponse.rewrite(url);
        }
    } else if (hostname.startsWith('admin.')) {
        // admin.edapp.co.za -> Platform Admin Login
        if (!url.pathname.startsWith('/admin') && url.pathname === '/') {
            url.pathname = '/admin/login';
            return NextResponse.rewrite(url);
        }
    } else if (hostname.startsWith('apply-')) {
        // apply-{tenant}.edapp.co.za -> Applicant Portal
        const tenantSlug = hostname.replace('apply-', '').split('.')[0];
        if (!url.pathname.startsWith('/apply') && url.pathname === '/') {
            url.pathname = `/apply/${tenantSlug}`;
            return NextResponse.rewrite(url);
        }
    } else if (tenant) {
        // {tenant}.edapp.co.za -> Tenant Login
        if (!url.pathname.startsWith('/tenant') && url.pathname === '/') {
            url.pathname = `/tenant/${tenant}/login`;
            return NextResponse.rewrite(url);
        }
    }

    // Add tenant to headers for backend use
    const response = NextResponse.next();
    if (tenant) {
        response.headers.set('x-tenant-slug', tenant);
    }

    return response;
}

function extractTenantFromHost(host: string): string | null {
    // Remove port if present
    const hostname = host.split(':')[0];

    // app.edapp.co.za -> null (discovery only)
    if (hostname.startsWith('app.') || hostname === 'localhost') {
        return null;
    }

    // admin.edapp.co.za -> null (platform admin)
    if (hostname.startsWith('admin.')) {
        return null;
    }

    // {tenant}.edapp.co.za -> tenant
    const parts = hostname.split('.');
    if (parts.length >= 2) {
        const subdomain = parts[0];

        // apply-{tenant}.edapp.co.za -> tenant
        if (subdomain.startsWith('apply-')) {
            return subdomain.replace('apply-', '');
        }

        // lia.edapp.co.za -> lia
        return subdomain;
    }

    return null;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
