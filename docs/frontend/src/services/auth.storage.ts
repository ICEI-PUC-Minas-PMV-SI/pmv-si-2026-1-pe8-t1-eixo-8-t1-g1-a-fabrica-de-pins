export const AUTH_TOKEN_KEY = 'afdp_auth_token'
export const AUTH_USERNAME_KEY = 'afdp_auth_username'

/** Remove espaços e prefixo `Bearer ` duplicado (alguns ambientes enviam o header inteiro no JSON). */
export function normalizeStoredTokenValue(raw: string | null | undefined): string | null {
  if (raw == null) return null
  let t = String(raw).trim()
  if (!t) return null
  if (/^bearer\s+/i.test(t)) {
    t = t.replace(/^bearer\s+/i, '').trim()
  }
  return t || null
}

export function getStoredToken(): string | null {
  if (typeof sessionStorage === 'undefined') return null
  return normalizeStoredTokenValue(sessionStorage.getItem(AUTH_TOKEN_KEY))
}

export function getStoredUsername(): string | null {
  if (typeof sessionStorage === 'undefined') return null
  return sessionStorage.getItem(AUTH_USERNAME_KEY)
}

export function setStoredToken(token: string): void {
  const n = normalizeStoredTokenValue(token)
  if (!n) {
    sessionStorage.removeItem(AUTH_TOKEN_KEY)
    return
  }
  sessionStorage.setItem(AUTH_TOKEN_KEY, n)
}

export function setStoredUsername(username: string): void {
  sessionStorage.setItem(AUTH_USERNAME_KEY, username)
}

export function clearStoredToken(): void {
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
  sessionStorage.removeItem(AUTH_USERNAME_KEY)
}
