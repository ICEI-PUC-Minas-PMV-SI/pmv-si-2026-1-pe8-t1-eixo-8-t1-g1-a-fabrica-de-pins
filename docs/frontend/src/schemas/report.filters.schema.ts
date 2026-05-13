import { z } from 'zod'

import { canalAquisicaoEnum } from '@/schemas/order.schema'

/** Alinha a `TipoCliente` do cadastro (varejo vs revenda). */
export const tipoClienteRelatorioEnum = z.enum(['VAREJO', 'REVENDA'])

export const agrupamentoPeriodoPlanejamentoEnum = z.enum([
  'DIA',
  'SEMANA',
  'MES',
  'TRIMESTRE',
  'ANO',
])

export type AgrupamentoPeriodoPlanejamento = z.infer<
  typeof agrupamentoPeriodoPlanejamentoEnum
>

export const periodoPlanejamentoLabel: Record<
  AgrupamentoPeriodoPlanejamento,
  string
> = {
  DIA: 'Dia',
  SEMANA: 'Semana',
  MES: 'Mês',
  TRIMESTRE: 'Trimestre',
  ANO: 'Ano',
}

export const reportFiltersSchema = z.object({
  dataInicio: z.string().min(1),
  dataFim: z.string().min(1),
  canalAquisicao: canalAquisicaoEnum.optional(),
  categoriaId: z.number().int().positive().optional(),
  tipoCliente: tipoClienteRelatorioEnum.optional(),
  periodoPlanejamento: agrupamentoPeriodoPlanejamentoEnum.default('MES'),
})

export type ReportFiltersInput = z.infer<typeof reportFiltersSchema>
