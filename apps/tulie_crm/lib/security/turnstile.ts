/**
 * Cloudflare Turnstile — Bot Detection & CAPTCHA
 * 
 * Setup:
 * 1. Tạo site tại https://dash.cloudflare.com → Turnstile
 * 2. Thêm env: NEXT_PUBLIC_TURNSTILE_SITE_KEY và TURNSTILE_SECRET_KEY
 * 3. Nếu không cấu hình, hệ thống sẽ SKIP verification (graceful degradation)
 * 
 * Turnstile là invisible/non-interactive — user không cần solve puzzle.
 */

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

interface TurnstileVerifyResult {
    success: boolean
    error?: string
}

/**
 * Verify a Turnstile token from the client.
 * Returns { success: true } if:
 *  - Token is valid
 *  - OR Turnstile is not configured (graceful fallback — rate limiting still applies)
 */
export async function verifyTurnstile(token: string | undefined | null): Promise<TurnstileVerifyResult> {
    const secretKey = process.env.TURNSTILE_SECRET_KEY

    // If not configured, skip (rate limiting is still in place)
    if (!secretKey) {
        return { success: true }
    }

    if (!token) {
        return { success: false, error: 'Xác minh bot thất bại. Vui lòng thử lại.' }
    }

    try {
        const res = await fetch(TURNSTILE_VERIFY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                secret: secretKey,
                response: token,
            }),
        })

        if (!res.ok) {
            console.error('[Turnstile] Verify request failed:', res.status)
            return { success: true } // Fail open — don't block legit users on Cloudflare outage
        }

        const data = await res.json()

        if (!data.success) {
            console.warn('[Turnstile] Verification failed:', data['error-codes'])
            return { success: false, error: 'Xác minh bot thất bại. Vui lòng thử lại.' }
        }

        return { success: true }
    } catch (err) {
        console.error('[Turnstile] Error verifying token:', err)
        return { success: true } // Fail open on network error
    }
}

/**
 * Get the Turnstile site key for use in client-side widget.
 * Returns undefined if not configured (widget will be hidden).
 */
export function getTurnstileSiteKey(): string | undefined {
    return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
}
