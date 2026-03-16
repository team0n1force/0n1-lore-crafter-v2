/**
 * Authenticated fetch wrapper for making API calls with JWT tokens
 */

interface AuthSession {
  token: string
  refreshToken: string
  expiresAt: number
  walletAddress: string
}

/**
 * Get auth session from localStorage
 */
function getAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  
  const sessionStr = sessionStorage.getItem('authSession')
  if (!sessionStr) return null
  
  try {
    const session = JSON.parse(sessionStr) as AuthSession
    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      sessionStorage.removeItem('authSession')
      return null
    }
    return session
  } catch {
    return null
  }
}

/**
 * Authenticated fetch that automatically includes JWT token
 * Falls back to unauthenticated request if no session
 */
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const session = getAuthSession()
  
  // If we have a valid session, add the Authorization header
  if (session) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${session.token}`
    }
  }
  
  return fetch(url, options)
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthSession() !== null
}

/**
 * Get current authenticated wallet address
 */
export function getAuthenticatedWallet(): string | null {
  const session = getAuthSession()
  return session?.walletAddress || null
} 