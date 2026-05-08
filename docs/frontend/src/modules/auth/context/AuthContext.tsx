import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type { LoginFormValues } from '@/schemas/login.schema'
import {
  clearStoredToken,
  getStoredToken,
  login as loginApi,
} from '@/services/auth.api'
import { getStoredUsername } from '@/services/auth.storage'

type AuthContextValue = {
  isAuthenticated: boolean
  username: string | null
  login: (values: LoginFormValues) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [username, setUsername] = useState<string | null>(() =>
    getStoredUsername(),
  )

  const login = useCallback(async (values: LoginFormValues) => {
    const { token: t } = await loginApi(values)
    setToken(t)
    setUsername(values.usuario.trim())
  }, [])

  const logout = useCallback(() => {
    clearStoredToken()
    setToken(null)
    setUsername(null)
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      username,
      login,
      logout,
    }),
    [token, username, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
