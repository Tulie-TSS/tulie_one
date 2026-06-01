import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// ============================================
// PORTAL RATE LIMITING (in-memory, Edge-compatible)
// Prevents token enumeration on /portal/, /quote/, /order/ paths
// ============================================
const PORTAL_PATHS = ['/portal/', '/quote/', '/order/', '/ctv/']
const PORTAL_RATE_LIMIT = 30       // max requests per window
const PORTAL_RATE_WINDOW = 60_000  // 1 minute in ms

interface RateEntry { count: number; reset: number }
const portalRateStore = new Map<string, RateEntry>()
let lastCleanup = Date.now()

function getIp(req: NextRequest): string {
    return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || req.headers.get('x-real-ip')
        || 'unknown'
}

function checkPortalRateLimit(req: NextRequest): NextResponse | null {
    const pathname = req.nextUrl.pathname
    const isPortal = PORTAL_PATHS.some(p => pathname.startsWith(p))
    if (!isPortal) return null

    // Cleanup every 5 minutes
    const now = Date.now()
    if (now - lastCleanup > 300_000) {
        lastCleanup = now
        for (const [k, v] of portalRateStore) {
            if (now > v.reset) portalRateStore.delete(k)
        }
    }

    const ip = getIp(req)
    const key = `portal:${ip}`
    const entry = portalRateStore.get(key)

    if (!entry || now > entry.reset) {
        portalRateStore.set(key, { count: 1, reset: now + PORTAL_RATE_WINDOW })
        return null
    }

    if (entry.count >= PORTAL_RATE_LIMIT) {
        const retryAfter = Math.ceil((entry.reset - now) / 1000)
        return new NextResponse(
            JSON.stringify({ error: 'Too many requests. Please try again later.' }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': String(retryAfter),
                },
            }
        )
    }

    entry.count++
    return null
}

// ============================================
// CSP NONCE GENERATION
// Generates a per-request nonce for Content-Security-Policy
// This replaces 'unsafe-inline' in script-src with a nonce
// ============================================
function generateCspHeaders(nonce: string) {
    // Use nonce-based CSP — 'unsafe-inline' removed to prevent XSS
    // 'unsafe-eval' kept because Next.js runtime requires it (code splitting, HMR)
    const csp = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://challenges.cloudflare.com`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://my.sepay.vn https://api.vietqr.io https://challenges.cloudflare.com",
        "frame-src https://challenges.cloudflare.com", // Turnstile renders inside an iframe
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        "upgrade-insecure-requests",
    ].join('; ')
    return csp
}

// ============================================
// MIDDLEWARE
// ============================================
export async function middleware(request: NextRequest) {
    // Rate limit portal pages
    const rateLimited = checkPortalRateLimit(request)
    if (rateLimited) return rateLimited

    // Handle dynamic event sale domains
    const host = request.headers.get('host') || ''
    const isTulieDomain = host.endsWith('.tulie.studio') || host.endsWith('.tulie.agency')
    const excludeDomains = [
        'anhthe.tulie.studio', 
        'hoptac.tulie.agency', 'affiliate.tulie.agency',
        // 'tulie.studio', 'www.tulie.studio' might be the main CRM domain?
        'crm.tulie.studio'
    ]
    
    if (isTulieDomain && !excludeDomains.includes(host)) {
        const pathname = request.nextUrl.pathname
        
        let shouldRewrite = true;
        if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/file') || pathname.startsWith('/portal') || pathname.startsWith('/ctv') || pathname.startsWith('/event-sale')) {
            shouldRewrite = false;
        }

        if (shouldRewrite) {
            // Rewrite root to /event-sale, and /path to /event-sale/path
            const rewriteUrl = request.nextUrl.clone()
            rewriteUrl.pathname = `/event-sale${pathname === '/' ? '' : pathname}`
            return NextResponse.rewrite(rewriteUrl)
        }
    }

    // Generate nonce for CSP
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
    const csp = generateCspHeaders(nonce)

    // Pass nonce and CSP to server components/renderer via request headers directly
    request.headers.set('x-nonce', nonce)
    request.headers.set('Content-Security-Policy', csp)

    // Get session response (Supabase auth)
    const response = await updateSession(request)

    // Set CSP header with nonce on the response for the browser
    response.headers.set('Content-Security-Policy', csp)

    // Also set nonce in response header for downstream use
    response.headers.set('x-nonce', nonce)

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
