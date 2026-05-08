import type { LoginFormValues } from '@/schemas/login.schema'
import { postJsonPublic } from '@/services/http'
import { setStoredToken, setStoredUsername } from '@/services/auth.storage'

export { clearStoredToken, getStoredToken } from '@/services/auth.storage'

type LoginResponse = { token: string }

export async function login(input: LoginFormValues): Promise<{ token: string }> {
  const body = await postJsonPublic<LoginResponse>('/auth/login', {
    username: input.usuario,
    password: input.senha,
  })
  if (!body?.token) throw new Error('Resposta de login inválida.')
  setStoredToken(body.token)
  setStoredUsername(input.usuario.trim())
  return { token: body.token }
}
