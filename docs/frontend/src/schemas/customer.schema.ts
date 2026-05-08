import { z } from 'zod'

const digitsOnly = (s: string) => s.replace(/\D/g, '')

export const tipoClienteEnum = z.enum(['VAREJO', 'REVENDA'])

export const tipoPessoaEnum = z.enum(['FISICA', 'JURIDICA'])

export const customerEnderecoSchema = z.object({
  cep: z
    .string()
    .min(8, 'CEP inválido')
    .refine((v) => digitsOnly(v).length === 8, 'CEP deve ter 8 dígitos'),
  estado: z.string().min(2, 'Informe o estado').max(2),
  cidade: z.string().min(2, 'Informe a cidade'),
  bairro: z.string().min(1, 'Informe o bairro'),
  logradouro: z.string().min(2, 'Informe o logradouro'),
  numero: z.string().min(1, 'Informe o número'),
  complemento: z.string().optional(),
  pontoReferencia: z.string().optional(),
  observacoes: z.string().optional(),
  enderecoPrincipal: z.boolean().default(true),
  tipoEndereco: z.string().min(1).default('ENTREGA'),
  apelido: z.string().optional(),
})

export const customerSchema = z.object({
  nome: z.string().min(2, 'Informe o nome'),
  email: z.string().email('E-mail inválido'),
  telefone: z
    .string()
    .min(10, 'Telefone inválido')
    .refine((v) => digitsOnly(v).length >= 10, 'Use DDD + número'),
  tipoCliente: tipoClienteEnum.default('VAREJO'),
  tipoPessoa: tipoPessoaEnum.default('FISICA'),
  documento: z
    .string()
    .min(11, 'Documento inválido')
    .refine((v) => {
      const d = digitsOnly(v)
      return d.length === 11 || d.length === 14
    }, 'Informe CPF (11) ou CNPJ (14) dígitos'),
  ativo: z.boolean().default(true),
  endereco: customerEnderecoSchema,
})

/** Etapa 1 (dados pessoais) — sem endereço. */
export const customerPersonalStepSchema = customerSchema.omit({ endereco: true })

export type CustomerFormValues = z.infer<typeof customerSchema>
