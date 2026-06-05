import { keepPreviousData, useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useAuth } from '@/modules/auth/context/AuthContext'
import {
  RELATORIO_GC_TIME,
  RELATORIO_STALE_TIME,
  relatorioQueriesForTab,
  relatorioQueryKeys,
  type ReportTab,
} from '@/modules/reports/lib/report-query-keys'
import type { ReportFiltersInput } from '@/schemas/report.filters.schema'
import {
  fetchRelatorioEstoque,
  fetchRelatorioPlanejamento,
  fetchRelatorioProducao,
  fetchRelatorioReceita,
  fetchRelatorioResumo,
} from '@/services/reports.api'

const relatorioQueryDefaults = {
  staleTime: RELATORIO_STALE_TIME,
  gcTime: RELATORIO_GC_TIME,
  placeholderData: keepPreviousData,
}

export function useRelatorioQueries(
  filtros: ReportFiltersInput | null,
  tab: ReportTab,
) {
  const { isAuthenticated } = useAuth()
  const enabled = filtros !== null && isAuthenticated
  const f = filtros!

  const needResumo = enabled && tab === 'overview'
  const needEstoque = enabled && tab === 'stock'
  const needReceita = enabled && tab === 'revenue'
  const needProducao = enabled && tab === 'production'
  const needPlanejamento = enabled && (tab === 'revenue' || tab === 'planning')

  const queries = useQueries({
    queries: [
      {
        queryKey: enabled
          ? relatorioQueryKeys.resumo(f)
          : (['relatorio-resumo', 'idle'] as const),
        queryFn: () => fetchRelatorioResumo(f),
        enabled: needResumo,
        ...relatorioQueryDefaults,
      },
      {
        queryKey: enabled
          ? relatorioQueryKeys.receita(f)
          : (['relatorio-receita', 'idle'] as const),
        queryFn: () => fetchRelatorioReceita(f),
        enabled: needReceita,
        ...relatorioQueryDefaults,
      },
      {
        queryKey: enabled
          ? relatorioQueryKeys.producao(f)
          : (['relatorio-producao', 'idle'] as const),
        queryFn: () => fetchRelatorioProducao(f),
        enabled: needProducao,
        ...relatorioQueryDefaults,
      },
      {
        queryKey: enabled
          ? relatorioQueryKeys.planejamento(f)
          : (['relatorio-planejamento', 'idle'] as const),
        queryFn: () => fetchRelatorioPlanejamento(f),
        enabled: needPlanejamento,
        ...relatorioQueryDefaults,
      },
      {
        queryKey: enabled
          ? relatorioQueryKeys.estoque(f)
          : (['relatorio-estoque', 'idle'] as const),
        queryFn: () => fetchRelatorioEstoque(f),
        enabled: needEstoque,
        ...relatorioQueryDefaults,
      },
    ],
  })

  const [resumo, receita, producao, planejamento, estoque] = queries

  const enabledFlags = useMemo(
    () => [needResumo, needReceita, needProducao, needPlanejamento, needEstoque],
    [needResumo, needReceita, needProducao, needPlanejamento, needEstoque],
  )

  const activeQueries = useMemo(
    () => queries.filter((_, i) => enabledFlags[i]),
    [queries, enabledFlags],
  )

  const isLoading = activeQueries.some((q) => q.isLoading)
  const isFetching = activeQueries.some((q) => q.isFetching)

  return {
    resumo: resumo.data,
    receita: receita.data,
    producao: producao.data,
    planejamento: planejamento.data,
    estoque: estoque.data,
    isLoading,
    isFetching,
    activeKinds: relatorioQueriesForTab(tab),
  }
}
