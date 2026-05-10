import { useQueries } from '@tanstack/react-query'

import { useAuth } from '@/modules/auth/context/AuthContext'
import type { ReportFiltersInput } from '@/schemas/report.filters.schema'
import {
  fetchRelatorioEstoque,
  fetchRelatorioPlanejamento,
  fetchRelatorioProducao,
  fetchRelatorioReceita,
  fetchRelatorioResumo,
} from '@/services/reports.api'

export function useRelatorioQueries(filtros: ReportFiltersInput | null) {
  const { isAuthenticated } = useAuth()
  const enabled = filtros !== null && isAuthenticated

  const queries = useQueries({
    queries: [
      {
        queryKey: ['relatorio-resumo', filtros],
        queryFn: () => fetchRelatorioResumo(filtros!),
        enabled,
      },
      {
        queryKey: ['relatorio-receita', filtros],
        queryFn: () => fetchRelatorioReceita(filtros!),
        enabled,
      },
      {
        queryKey: ['relatorio-producao', filtros],
        queryFn: () => fetchRelatorioProducao(filtros!),
        enabled,
      },
      {
        queryKey: ['relatorio-planejamento', filtros],
        queryFn: () => fetchRelatorioPlanejamento(filtros!),
        enabled,
      },
      {
        queryKey: ['relatorio-estoque', filtros],
        queryFn: () => fetchRelatorioEstoque(filtros!),
        enabled,
      },
    ],
  })

  const [resumo, receita, producao, planejamento, estoque] = queries

  return {
    resumo: resumo.data,
    receita: receita.data,
    producao: producao.data,
    planejamento: planejamento.data,
    estoque: estoque.data,
    isPending: queries.some((q) => q.isPending),
  }
}
