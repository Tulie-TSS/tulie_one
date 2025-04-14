import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url') {
            if (process.env.NODE_ENV === 'production') {
                console.error('CRITICAL: Supabase credentials not configured in production!')
            }
            return supabaseResponse
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                        supabaseResponse = NextResponse.next({ request })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const { data: { user } } = await supabase.auth.getUser()

        // ERP protected routes
        const protectedPaths = [
            '/dashboard', '/invoices', '/products', '/vendors',
            '/finance', '/reports', '/expenses', '/settings',
        ]
        const isProtectedPath = protectedPaths.some(path =>
            request.nextUrl.pathname.startsWith(path)
        )

        if (!user && isProtectedPath) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        if (user) {
            if (['/login', '/register'].includes(request.nextUrl.pathname)) {
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard'
                return NextResponse.redirect(url)
            }
            if (request.nextUrl.pathname === '/') {
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard'
                return NextResponse.redirect(url)
            }
        }
    } catch (error) {
        console.error('Middleware session update error:', error)
        return supabaseResponse
    }

    return supabaseResponse
}
