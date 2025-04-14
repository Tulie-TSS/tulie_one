import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (!supabaseUrl || !supabaseAnonKey) return supabaseResponse

        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        })

        const { data: { user } } = await supabase.auth.getUser()
        const protectedPaths = ['/dashboard', '/employees', '/payroll', '/attendance', '/contracts', '/recruitment', '/kpi', '/reports', '/settings', '/insurance', '/training', '/benefits']
        const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
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
        console.error('Middleware error:', error)
    }
    return supabaseResponse
}
