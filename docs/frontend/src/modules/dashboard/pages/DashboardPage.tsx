import {
  CalendarRange,
  Factory,
  LayoutGrid,
  Package,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import {
  ReportFilters,
  buildDefaultReportFilters,
} from '@/modules/reports/components/ReportFilters'
import {
  ReportOverviewTab,
  ReportPlanningTab,
  ReportProductionTab,
  ReportRevenueTab,
  ReportStockTab,
} from '@/modules/reports/components/ReportTabPanels'
import { useReportSnapshotQuery } from '@/modules/reports/hooks/useReportSnapshot'
import {
  reportFiltersSchema,
  type ReportFiltersInput,
} from '@/schemas/report.filters.schema'
import { cn } from '@/utils/cn'

export function DashboardPage() {
  const [filtros, setFiltros] = useState<ReportFiltersInput>(() =>
    buildDefaultReportFilters(),
  )

  const parsed = useMemo(() => reportFiltersSchema.safeParse(filtros), [filtros])
  const aplicavel = parsed.success
  const datasInvalidas = Boolean(
    filtros.dataInicio &&
      filtros.dataFim &&
      filtros.dataInicio > filtros.dataFim,
  )

  const { data, isPending, isError, error, refetch } = useReportSnapshotQuery(
    aplicavel && !datasInvalidas ? filtros : null,
  )

  const canShowData = aplicavel && !datasInvalidas && data && !isPending && !isError

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Hero */}
      <header
        className={cn(
          'relative overflow-hidden rounded-2xl border border-border bg-card',
          'shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset]',
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_400px_at_80%_-20%,var(--brand-light),transparent_55%)] opacity-90" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-transparent" />
        <div className="relative px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex max-w-3xl flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Painel analítico
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Relatórios
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Estoque, receita, produção e planejamento em um só lugar. Ajuste o
              período e os filtros abaixo — eles valem para todas as abas.
            </p>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/25 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <SlidersHorizontal className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <CardTitle className="text-lg">Filtros do relatório</CardTitle>
              <CardDescription>
                Período, canal, modalidade, categoria e custo operacional opcional.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ReportFilters embedded value={filtros} onChange={setFiltros} />
          {datasInvalidas ? (
            <p className="mt-4 text-sm text-destructive" role="alert">
              A data inicial deve ser anterior ou igual à data final.
            </p>
          ) : null}
          {!aplicavel && parsed.success === false ? (
            <p className="mt-4 text-sm text-destructive" role="alert">
              Verifique os filtros obrigatórios.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Conteúdo */}
      {aplicavel && !datasInvalidas ? (
        <>
          {isPending ? <LoadingState rows={8} /> : null}
          {isError ? (
            <ErrorState
              message={
                error instanceof Error
                  ? error.message
                  : 'Erro ao carregar relatórios'
              }
              onRetry={() => void refetch()}
            />
          ) : null}

          {canShowData ? (
            <Tabs defaultValue="overview" className="gap-6">
              <TabsList className="h-auto min-h-12 w-full flex-wrap justify-start gap-1 bg-muted/50 p-2 sm:p-2">
                <TabsTrigger value="overview" className="gap-2 px-4 py-2.5">
                  <LayoutGrid className="h-4 w-4 shrink-0 opacity-80" />
                  Visão geral
                </TabsTrigger>
                <TabsTrigger value="stock" className="gap-2 px-4 py-2.5">
                  <Package className="h-4 w-4 shrink-0 opacity-80" />
                  Estoque
                </TabsTrigger>
                <TabsTrigger value="revenue" className="gap-2 px-4 py-2.5">
                  <Wallet className="h-4 w-4 shrink-0 opacity-80" />
                  Receita
                </TabsTrigger>
                <TabsTrigger value="production" className="gap-2 px-4 py-2.5">
                  <Factory className="h-4 w-4 shrink-0 opacity-80" />
                  Produção
                </TabsTrigger>
                <TabsTrigger value="planning" className="gap-2 px-4 py-2.5">
                  <CalendarRange className="h-4 w-4 shrink-0 opacity-80" />
                  Planejamento
                </TabsTrigger>
              </TabsList>

              <div className="rounded-2xl border border-border/80 bg-card/50 p-6 shadow-sm sm:p-8">
                <TabsContent value="overview" className="mt-0">
                  <ReportOverviewTab data={data} />
                </TabsContent>
                <TabsContent value="stock" className="mt-0">
                  <ReportStockTab data={data} />
                </TabsContent>
                <TabsContent value="revenue" className="mt-0">
                  <ReportRevenueTab data={data} />
                </TabsContent>
                <TabsContent value="production" className="mt-0">
                  <ReportProductionTab data={data} />
                </TabsContent>
                <TabsContent value="planning" className="mt-0">
                  <ReportPlanningTab data={data} />
                </TabsContent>
              </div>
            </Tabs>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
