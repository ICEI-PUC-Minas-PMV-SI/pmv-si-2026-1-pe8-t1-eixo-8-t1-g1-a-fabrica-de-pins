export const AUTH_TOKEN_KEY = 'afdp_auth_token'
export const AUTH_USERNAME_KEY = 'afdp_auth_username'

export function getStoredToken(): string | null {
  if (typeof sessionStorage === 'undefined') return null
  return sessionStorage.getItem(AUTH_TOKEN_KEY)
}

export function getStoredUsername(): string | null {
  if (typeof sessionStorage === 'undefined') return null
  return sessionStorage.getItem(AUTH_USERNAME_KEY)
}

export function setStoredToken(token: string): void {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function setStoredUsername(username: string): void {
  sessionStorage.setItem(AUTH_USERNAME_KEY, username)
}

export function clearStoredToken(): void {
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
  sessionStorage.removeItem(AUTH_USERNAME_KEY)
}
