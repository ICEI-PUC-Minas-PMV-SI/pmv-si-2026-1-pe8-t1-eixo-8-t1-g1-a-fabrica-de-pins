import { z } from 'zod'

export const categoryFormSchema = z.object({
  nome: z.string().min(1, 'Informe o nome'),
  descricao: z.string().min(1, 'Informe a descrição'),
  ativa: z.boolean().default(true),
})

export type CategoryFormInput = z.input<typeof categoryFormSchema>
export type CategoryFormValues = z.infer<typeof categoryFormSchema>
