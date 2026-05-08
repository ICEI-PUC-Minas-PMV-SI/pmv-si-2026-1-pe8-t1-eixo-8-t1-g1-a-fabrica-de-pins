import { z } from 'zod'

export const tipoDescontoCupomEnum = z.enum(['PERCENTUAL', 'FIXO'])

export type TipoDescontoCupomForm = z.infer<typeof tipoDescontoCupomEnum>

export const couponCreateSchema = z.object({
  codigo: z.string().min(1, 'Informe o código'),
  ativo: z.boolean().default(true),
  valorDesconto: z.coerce.number().positive('Valor deve ser maior que zero'),
  tipoDesconto: tipoDescontoCupomEnum,
  dataValidade: z.string().min(1, 'Informe a validade'),
  quantidadeMinimaItens: z.coerce.number().int().min(0),
  valorMinimoPedido: z.coerce.number().min(0),
  limiteUsos: z.coerce.number().int().min(0),
})

export type CouponCreateInput = z.input<typeof couponCreateSchema>
export type CouponCreateValues = z.infer<typeof couponCreateSchema>
