import type { NextConfig } from "next";

// SECURITY: Static headers that don't need per-request nonce.
// CSP is set dynamically in middleware.ts with nonce-based script-src.
const securityHeaders = [
    {
        key: 'X-Frame-Options',
        value: 'DENY',
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
    },
    // REMOVED: X-XSS-Protection — deprecated, ignored by modern browsers
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    },
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
    },
    // NOTE: CSP header is now set in middleware.ts with nonce-based script-src
]

const nextConfig: NextConfig = {
    reactCompiler: true,
    output: "standalone",
    poweredByHeader: false,
    compress: true,
    typescript: {
        ignoreBuildErrors: false,
    },
    async rewrites() {
        return {
            beforeFiles: [
                // anhthe.tulie.studio → /anhthe routes
                {
                    source: '/',
                    has: [{ type: 'host', value: 'anhthe.tulie.studio' }],
                    destination: '/anhthe',
                },
                {
                    source: '/:path((?!anhthe|_next|api|file|favicon|portal).*)',
                    has: [{ type: 'host', value: 'anhthe.tulie.studio' }],
                    destination: '/anhthe/:path',
                },
                // ismecareerfair.tulie.studio → /event-sale
                {
                    source: '/',
                    has: [{ type: 'host', value: 'ismecareerfair.tulie.studio' }],
                    destination: '/event-sale',
                },
                {
                    source: '/:path((?!event-sale|_next|api|file|favicon|portal).*)',
                    has: [{ type: 'host', value: 'ismecareerfair.tulie.studio' }],
                    destination: '/event-sale/:path',
                },
                // hoptac.tulie.app → /affiliate (primary)
                {
                    source: '/',
                    has: [{ type: 'host', value: 'hoptac.tulie.app' }],
                    destination: '/affiliate',
                },
                // affiliate.tulie.app → /affiliate (primary)
                {
                    source: '/',
                    has: [{ type: 'host', value: 'affiliate.tulie.app' }],
                    destination: '/affiliate',
                },
                // Legacy: hoptac.tulie.agency → /affiliate (backward compat)
                {
                    source: '/',
                    has: [{ type: 'host', value: 'hoptac.tulie.agency' }],
                    destination: '/affiliate',
                },
                // Legacy: affiliate.tulie.agency → /affiliate (backward compat)
                {
                    source: '/',
                    has: [{ type: 'host', value: 'affiliate.tulie.agency' }],
                    destination: '/affiliate',
                },
            ],
            afterFiles: [],
            fallback: [],
        }
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: securityHeaders,
            },
        ]
    },
};

export default nextConfig;
