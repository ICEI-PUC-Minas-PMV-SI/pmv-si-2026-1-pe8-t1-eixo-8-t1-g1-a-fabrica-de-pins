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
import { useRelatorioQueries } from '@/modules/reports/hooks/useRelatorioQueries'
import {
  reportFiltersSchema,
  type ReportFiltersInput,
} from '@/schemas/report.filters.schema'

type ReportTab = 'overview' | 'stock' | 'revenue' | 'production' | 'planning'

export function DashboardPage() {
  const [tab, setTab] = useState<ReportTab>('overview')
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

  const filtrosQuery = aplicavel && !datasInvalidas ? filtros : null
  const { resumo, receita, producao, planejamento, estoque, isPending } =
    useRelatorioQueries(filtrosQuery)

  const mostrarFiltros =
    aplicavel &&
    !datasInvalidas &&
    (tab === 'overview' || tab === 'revenue' || tab === 'planning')

  const podeCarregarAbas = aplicavel && !datasInvalidas

  return (
    <div className="flex flex-col gap-3 pb-8">
      <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        Relatórios
      </h1>

      {!podeCarregarAbas ? (
        <p className="text-sm text-muted-foreground">
          Ajuste as datas do período (inicial ≤ final) para carregar os relatórios.
        </p>
      ) : null}

      {podeCarregarAbas ? (
        <>
          {isPending ? <LoadingState rows={5} /> : null}

          {!isPending ? (
            <Tabs
              defaultValue="overview"
              value={tab}
              onValueChange={(v) => setTab(v as ReportTab)}
              className="gap-3"
            >
              <TabsList className="h-auto min-h-9 w-full flex-wrap justify-start gap-0.5 bg-muted/50 p-1">
                <TabsTrigger value="overview" className="gap-1.5 px-3 py-1.5 text-sm">
                  <LayoutGrid className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  Visão geral
                </TabsTrigger>
                <TabsTrigger value="stock" className="gap-1.5 px-3 py-1.5 text-sm">
                  <Package className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  Estoque
                </TabsTrigger>
                <TabsTrigger value="revenue" className="gap-1.5 px-3 py-1.5 text-sm">
                  <Wallet className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  Receita
                </TabsTrigger>
                <TabsTrigger value="production" className="gap-1.5 px-3 py-1.5 text-sm">
                  <Factory className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  Produção
                </TabsTrigger>
                <TabsTrigger value="planning" className="gap-1.5 px-3 py-1.5 text-sm">
                  <CalendarRange className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  Planejamento
                </TabsTrigger>
              </TabsList>

              {mostrarFiltros ? (
                <Card className="overflow-hidden border-border/80 shadow-sm">
                  <CardHeader className="border-b border-border/60 bg-muted/25 px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                        <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <CardTitle className="text-base leading-none">Filtros</CardTitle>
                        <CardDescription className="text-xs leading-snug">
                          Período (7 / 30 / 90 ou personalizado), canal, tipo de cliente e
                          categoria.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-3 sm:px-5">
                    <ReportFilters embedded value={filtros} onChange={setFiltros} />
                    {datasInvalidas ? (
                      <p className="mt-2 text-sm text-destructive" role="alert">
                        A data inicial deve ser anterior ou igual à data final.
                      </p>
                    ) : null}
                    {!aplicavel ? (
                      <p className="mt-2 text-sm text-destructive" role="alert">
                        Verifique os filtros obrigatórios.
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}

              <div className="rounded-xl border border-border/80 bg-card/50 p-4 shadow-sm sm:p-5">
                <TabsContent value="overview" className="mt-0">
                  <ReportOverviewTab resumo={resumo} />
                </TabsContent>
                <TabsContent value="stock" className="mt-0">
                  <ReportStockTab estoque={estoque} />
                </TabsContent>
                <TabsContent value="revenue" className="mt-0">
                  <ReportRevenueTab
                    receita={receita}
                    historicoReceita={planejamento?.historicoVendas}
                    periodoPlanejamento={filtros.periodoPlanejamento}
                    onPeriodoPlanejamentoChange={(v) =>
                      setFiltros((prev) => ({ ...prev, periodoPlanejamento: v }))
                    }
                  />
                </TabsContent>
                <TabsContent value="production" className="mt-0">
                  <ReportProductionTab producao={producao} />
                </TabsContent>
                <TabsContent value="planning" className="mt-0">
                  <ReportPlanningTab
                    planejamento={planejamento}
                    periodoPlanejamento={filtros.periodoPlanejamento}
                    onPeriodoPlanejamentoChange={(v) =>
                      setFiltros((prev) => ({ ...prev, periodoPlanejamento: v }))
                    }
                  />
                </TabsContent>
              </div>
            </Tabs>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
