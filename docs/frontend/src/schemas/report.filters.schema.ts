import { z } from 'zod'

import {
  canalAquisicaoEnum,
  modalidadePedidoEnum,
} from '@/schemas/order.schema'

/** Filtros da tela de relatórios (período + opcionais). */
export const reportFiltersSchema = z.object({
  dataInicio: z.string().min(1),
  dataFim: z.string().min(1),
  custoOperacionalPeriodo: z.coerce.number().nonnegative().optional(),
  canalAquisicao: canalAquisicaoEnum.optional(),
  modalidade: modalidadePedidoEnum.optional(),
  /** Filtra pedidos que tenham pelo menos um item nesta categoria */
  categoriaProduto: z.string().optional(),
})

export type ReportFiltersInput = z.infer<typeof reportFiltersSchema>
