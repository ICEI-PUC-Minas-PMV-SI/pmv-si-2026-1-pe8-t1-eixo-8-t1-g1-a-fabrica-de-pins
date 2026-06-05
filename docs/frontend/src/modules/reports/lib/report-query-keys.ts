import type { QueryClient } from '@tanstack/react-query'

import type { ReportFiltersInput } from '@/schemas/report.filters.schema'
import {
  fetchRelatorioEstoque,
  fetchRelatorioPlanejamento,
  fetchRelatorioProducao,
  fetchRelatorioReceita,
  fetchRelatorioResumo,
} from '@/services/reports.api'

export const RELATORIO_STALE_TIME = 5 * 60_000
export const RELATORIO_GC_TIME = 30 * 60_000

export type ReportTab = 'overview' | 'stock' | 'revenue' | 'production' | 'planning'

export type RelatorioQueryKind =
  | 'resumo'
  | 'receita'
  | 'producao'
  | 'planejamento'
  | 'estoque'

export function relatorioFiltrosSemPeriodoPlanejamento(
  f: ReportFiltersInput,
): Omit<ReportFiltersInput, 'periodoPlanejamento'> {
  const { periodoPlanejamento: _p, ...rest } = f
  return rest
}

function reportFiltrosBaseKey(
  f: Omit<ReportFiltersInput, 'periodoPlanejamento'>,
) {
  return {
    dataInicio: f.dataInicio,
    dataFim: f.dataFim,
    canalAquisicao: f.canalAquisicao ?? null,
    categoriaId: f.categoriaId ?? null,
    tipoCliente: f.tipoCliente ?? null,
  }
}

export const relatorioQueryKeys = {
  resumo: (f: ReportFiltersInput) =>
    [
      'relatorio-resumo',
      reportFiltrosBaseKey(relatorioFiltrosSemPeriodoPlanejamento(f)),
    ] as const,
  receita: (f: ReportFiltersInput) =>
    [
      'relatorio-receita',
      reportFiltrosBaseKey(relatorioFiltrosSemPeriodoPlanejamento(f)),
    ] as const,
  producao: (f: ReportFiltersInput) =>
    [
      'relatorio-producao',
      reportFiltrosBaseKey(relatorioFiltrosSemPeriodoPlanejamento(f)),
    ] as const,
  planejamento: (f: ReportFiltersInput) =>
    [
      'relatorio-planejamento',
      reportFiltrosBaseKey(relatorioFiltrosSemPeriodoPlanejamento(f)),
      f.periodoPlanejamento ?? 'MES',
    ] as const,
  estoque: (f: ReportFiltersInput) =>
    [
      'relatorio-estoque',
      reportFiltrosBaseKey(relatorioFiltrosSemPeriodoPlanejamento(f)),
    ] as const,
}

export function relatorioQueryKey(kind: RelatorioQueryKind, filtros: ReportFiltersInput) {
  return relatorioQueryKeys[kind](filtros)
}

export function relatorioQueryCacheOptions() {
  return {
    staleTime: RELATORIO_STALE_TIME,
    gcTime: RELATORIO_GC_TIME,
  }
}

export function relatorioQueriesForTab(tab: ReportTab): RelatorioQueryKind[] {
  switch (tab) {
    case 'overview':
      return ['resumo']
    case 'stock':
      return ['estoque']
    case 'revenue':
      return ['receita', 'planejamento']
    case 'production':
      return ['producao']
    case 'planning':
      return ['planejamento']
  }
}

export function invalidateRelatorioQueries(
  qc: QueryClient,
  kinds?: RelatorioQueryKind[],
) {
  const targets =
    kinds ?? ['resumo', 'receita', 'producao', 'planejamento', 'estoque']
  for (const kind of targets) {
    void qc.invalidateQueries({ queryKey: [`relatorio-${kind}`] })
  }
}

/** Invalidação seletiva após mutações que afetam relatórios. */
export const relatorioInvalidation = {
  onOrderChange(qc: QueryClient) {
    invalidateRelatorioQueries(qc, [
      'resumo',
      'receita',
      'producao',
      'planejamento',
      'estoque',
    ])
  },
  onProductChange(qc: QueryClient) {
    invalidateRelatorioQueries(qc, ['resumo', 'producao', 'estoque'])
  },
  onCustomerChange(qc: QueryClient) {
    invalidateRelatorioQueries(qc, ['receita', 'planejamento'])
  },
}

export function prefetchRelatorioTab(
  qc: QueryClient,
  tab: ReportTab,
  filtros: ReportFiltersInput,
) {
  const cache = relatorioQueryCacheOptions()
  for (const kind of relatorioQueriesForTab(tab)) {
    switch (kind) {
      case 'resumo':
        void qc.prefetchQuery({
          queryKey: relatorioQueryKey('resumo', filtros),
          queryFn: () => fetchRelatorioResumo(filtros),
          ...cache,
        })
        break
      case 'receita':
        void qc.prefetchQuery({
          queryKey: relatorioQueryKey('receita', filtros),
          queryFn: () => fetchRelatorioReceita(filtros),
          ...cache,
        })
        break
      case 'producao':
        void qc.prefetchQuery({
          queryKey: relatorioQueryKey('producao', filtros),
          queryFn: () => fetchRelatorioProducao(filtros),
          ...cache,
        })
        break
      case 'planejamento':
        void qc.prefetchQuery({
          queryKey: relatorioQueryKey('planejamento', filtros),
          queryFn: () => fetchRelatorioPlanejamento(filtros),
          ...cache,
        })
        break
      case 'estoque':
        void qc.prefetchQuery({
          queryKey: relatorioQueryKey('estoque', filtros),
          queryFn: () => fetchRelatorioEstoque(filtros),
          ...cache,
        })
        break
    }
  }
}
