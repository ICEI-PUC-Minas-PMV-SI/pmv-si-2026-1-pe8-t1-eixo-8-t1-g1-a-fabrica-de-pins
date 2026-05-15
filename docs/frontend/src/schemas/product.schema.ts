import { z } from 'zod'

export const tipoEstoqueProdutoEnum = z.enum([
  'ESTOQUE',
  'SOB_DEMANDA',
  'PRE_VENDA',
])

export type TipoEstoqueProduto = z.infer<typeof tipoEstoqueProdutoEnum>

export const tipoEstoqueLabel: Record<TipoEstoqueProduto, string> = {
  ESTOQUE: 'Estoque',
  SOB_DEMANDA: 'Sob demanda',
  PRE_VENDA: 'Pré-venda',
}

export const productSchema = z.object({
  nome: z.string().min(2, 'Informe pelo menos 2 caracteres'),
  descricao: z.string().min(2, 'Informe a descrição'),
  tipoEstoque: tipoEstoqueProdutoEnum,
  quantidadeEstoque: z.coerce.number().int().min(0, 'Estoque não pode ser negativo'),
  estoqueMinimo: z.coerce
    .number()
    .int()
    .min(0, 'Estoque mínimo não pode ser negativo'),
  precoVarejo: z.coerce.number().min(0, 'Preço varejo inválido'),
  precoRevenda: z.coerce.number().min(0, 'Preço revenda inválido'),
  custoProducao: z.coerce.number().min(0, 'Custo inválido'),
  dataPrevistaLancamento: z.string().min(1, 'Informe a data'),
  sku: z.string(),
  imgUrl: z.string(),
  peso: z.coerce.number().int().min(0),
  altura: z.coerce.number().int().min(0),
  largura: z.coerce.number().int().min(0),
  comprimento: z.coerce.number().int().min(0),
  ativo: z.boolean(),
  categoriaId: z.coerce
    .number()
    .refine((n) => Number.isInteger(n) && n > 0, 'Selecione uma categoria'),
})

export type ProductFormValues = z.infer<typeof productSchema>

export const productEstoqueUpdateSchema = z.object({
  estoque: z.coerce.number().int().min(0, 'Estoque não pode ser negativo'),
})

export type ProductEstoqueUpdateValues = z.infer<
  typeof productEstoqueUpdateSchema
>
