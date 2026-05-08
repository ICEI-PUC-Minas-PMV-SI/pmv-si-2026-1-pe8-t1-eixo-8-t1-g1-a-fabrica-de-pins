import { z } from 'zod'

export const loginSchema = z.object({
  usuario: z.string().min(2, 'Informe o usuário'),
  senha: z.string().min(1, 'Informe a senha'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
