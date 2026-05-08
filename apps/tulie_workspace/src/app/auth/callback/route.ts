import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'invite' | 'recovery' | 'signup' | 'email_change' | null
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const redirectUrl = (type === 'invite' || type === 'recovery') ? `${origin}/set-password` : `${origin}${next}`
      return NextResponse.redirect(redirectUrl)
    } else {
      console.error('Auth callback error (code):', error)
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    })
    if (!error) {
      const redirectUrl = (type === 'invite' || type === 'recovery') ? `${origin}/set-password` : `${origin}${next}`
      return NextResponse.redirect(redirectUrl)
    } else {
      console.error('Auth callback error (token_hash):', error)
    }
  }

  // On error, redirect to login with message
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
