import type { ComponentType, ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  Coins,
  Factory,
  LayoutGrid,
  Package,
  Percent,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  canalAquisicaoLabel,
  modalidadeLabel,
  orderStatusLabel,
} from '@/modules/orders/lib/order-labels'
import type { ReportSnapshot } from '../../../services/reports'
import { formatCurrencyBRL } from '@/utils/format'
import { cn } from '@/utils/cn'

function formatHours(h: number | null): string {
  if (h == null || Number.isNaN(h)) return '—'
  return `${h.toFixed(1)} h`
}

function StatHighlight({
  icon: Icon,
  label,
  value,
  hint,
  className,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  value: ReactNode
  hint?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/[0.07]" />
      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/15">
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          {hint ? (
            <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function ReportOverviewTab({ data }: { data: ReportSnapshot }) {
  const alertas = data.stock.filter((r: { abaixoDoMinimo: boolean }) => r.abaixoDoMinimo).length

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-dashed border-primary/25 bg-gradient-to-br from-primary/[0.06] via-card to-card px-5 py-6 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Resumo do período</h3>
            <p className="text-sm text-muted-foreground">
              Indicadores-chave com os filtros atuais. Use as outras abas para
              análises detalhadas.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatHighlight
          icon={AlertTriangle}
          label="Produtos em alerta"
          value={alertas}
          hint={
            alertas === 0
              ? 'Nenhum item abaixo do estoque mínimo.'
              : 'Revise reposição na aba Estoque.'
          }
        />
        <StatHighlight
          icon={Wallet}
          label="Receita bruta"
          value={formatCurrencyBRL(data.revenue.receitaBruta)}
          hint={`${data.revenue.pedidosContados} pedidos elegíveis`}
        />
        <StatHighlight
          icon={Clock}
          label="Tempo médio de produção"
          value={formatHours(data.producao.mediaHorasProducao)}
          hint={`${data.producao.registrosComDuracao} registros com início e fim`}
        />
        <StatHighlight
          icon={TrendingUp}
          label="Receita líquida estimada"
          value={formatCurrencyBRL(data.revenue.receitaLiquidaEstimada)}
          hint={
            data.revenue.custoOperacionalPeriodo > 0
              ? `Após custo operacional de ${formatCurrencyBRL(data.revenue.custoOperacionalPeriodo)}`
              : 'Informe custo operacional nos filtros para margem líquida.'
          }
        />
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-primary/15 bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Package className="h-4 w-4 text-primary" />
              Estoque & demanda
            </CardTitle>
            <CardDescription>
              Unidades vendidas no período (somando todos os produtos):{' '}
              <strong className="text-foreground">
                {data.stock.reduce(
                  (a: number, r: { unidadesVendidasPeriodo: number }) =>
                    a + r.unidadesVendidasPeriodo,
                  0,
                )}
              </strong>
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-primary/15 bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Coins className="h-4 w-4 text-primary" />
              Mix de vendas
            </CardTitle>
            <CardDescription>
              Total de itens vendidos (unidades):{' '}
              <strong className="text-foreground">
                {data.revenue.itensVendidos}
              </strong>
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-primary/15 bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Factory className="h-4 w-4 text-primary" />
              Produção
            </CardTitle>
            <CardDescription>
              Pedidos sem registro completo de produção:{' '}
              <strong className="text-foreground">
                {data.producao.pedidosSemTimestamps}
              </strong>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

export function ReportStockTab({ data }: { data: ReportSnapshot }) {
  const alertas = data.stock.filter((r: { abaixoDoMinimo: boolean }) => r.abaixoDoMinimo).length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight">
            Monitoramento de estoque
          </h3>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Compare estoque atual ao mínimo definido e à demanda do período
            (pedidos confirmados ou enviados).
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span>
            <strong className="font-semibold text-foreground">{alertas}</strong>{' '}
            produto(s) abaixo do mínimo
          </span>
        </div>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Inventário por produto
          </CardTitle>
          <CardDescription>
            Situação atual e vendas filtradas para antecipar rupturas ou excessos.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 md:p-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="text-right">Mínimo</TableHead>
                <TableHead className="text-right">Vendido no período</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.stock.map(
                (row: {
                  produtoId: string
                  nome: string
                  categoria: string
                  estoque: number
                  estoqueMinimo: number
                  unidadesVendidasPeriodo: number
                  abaixoDoMinimo: boolean
                }) => (
                <TableRow key={row.produtoId}>
                  <TableCell className="font-medium">{row.nome}</TableCell>
                  <TableCell>{row.categoria}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.estoque}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.estoqueMinimo}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.unidadesVendidasPeriodo}
                  </TableCell>
                  <TableCell>
                    {row.abaixoDoMinimo ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/12 px-2.5 py-0.5 text-xs font-medium text-destructive">
                        <AlertTriangle className="h-3 w-3" />
                        Abaixo do mínimo
                      </span>
                    ) : (
                      <span className="text-muted-foreground">OK</span>
                    )}
                  </TableCell>
                </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export function ReportRevenueTab({ data }: { data: ReportSnapshot }) {
  const custo = data.revenue.custoOperacionalPeriodo
  const margemPct =
    data.revenue.receitaBruta > 0 && custo > 0
      ? ((data.revenue.receitaLiquidaEstimada / data.revenue.receitaBruta) * 100).toFixed(1)
      : null

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold tracking-tight">
          Receita e margem estimada
        </h3>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Agregação de pedidos confirmados ou enviados no período. O custo
          operacional é informado nos filtros globais.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatHighlight
          icon={Wallet}
          label="Receita bruta"
          value={formatCurrencyBRL(data.revenue.receitaBruta)}
          hint="Soma dos pedidos elegíveis"
        />
        <StatHighlight
          icon={Package}
          label="Itens vendidos"
          value={data.revenue.itensVendidos}
          hint="Unidades"
        />
        <StatHighlight
          icon={TrendingUp}
          label="Pedidos contabilizados"
          value={data.revenue.pedidosContados}
          hint="Confirmados ou enviados"
        />
        <StatHighlight
          icon={Percent}
          label="Receita líquida estimada"
          value={formatCurrencyBRL(data.revenue.receitaLiquidaEstimada)}
          hint={
            custo > 0
              ? `Custo no período: ${formatCurrencyBRL(custo)}${margemPct ? ` · ~${margemPct}% da bruta` : ''}`
              : 'Defina custo operacional nos filtros'
          }
        />
      </div>

      <Card className="border-primary/20 bg-muted/20">
        <CardContent className="flex flex-wrap items-center gap-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/12">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Custo operacional (filtro)
              </p>
              <p className="text-xl font-semibold tabular-nums">
                {formatCurrencyBRL(custo)}
              </p>
            </div>
          </div>
          <Separator orientation="vertical" className="hidden h-12 sm:block" />
          <p className="max-w-md text-sm text-muted-foreground">
            O valor é único para o período selecionado e é subtraído da receita
            bruta apenas para uma estimativa de margem — não substitui
            contabilidade formal.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function ReportProductionTab({ data }: { data: ReportSnapshot }) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold tracking-tight">
          Tempo de produção
        </h3>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Estatísticas com base em início e fim da produção registrados nos
          pedidos do período filtrado.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatHighlight
          icon={Clock}
          label="Tempo médio"
          value={formatHours(data.producao.mediaHorasProducao)}
        />
        <StatHighlight
          icon={Clock}
          label="Mediana"
          value={formatHours(data.producao.medianaHorasProducao)}
        />
        <StatHighlight
          icon={AlertTriangle}
          label="Sem registro completo"
          value={data.producao.pedidosSemTimestamps}
          hint={`${data.producao.registrosComDuracao} pedidos com duração calculada`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-base">
              <Factory className="h-4 w-4 text-primary" />
              Por modalidade
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Modalidade</TableHead>
                  <TableHead className="text-right">Média</TableHead>
                  <TableHead className="text-right">Registros</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.producao.porModalidade.map(
                  (row: {
                    modalidade: keyof typeof modalidadeLabel
                    mediaHoras: number | null
                    quantidade: number
                  }) => (
                  <TableRow key={row.modalidade}>
                    <TableCell>{modalidadeLabel[row.modalidade]}</TableCell>
                    <TableCell className="text-right">
                      {formatHours(row.mediaHoras)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.quantidade}
                    </TableCell>
                  </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-primary" />
              Por status do pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Média</TableHead>
                  <TableHead className="text-right">Registros</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.producao.porStatus.map(
                  (row: {
                    status: keyof typeof orderStatusLabel
                    mediaHoras: number | null
                    quantidade: number
                  }) => (
                  <TableRow key={row.status}>
                    <TableCell>{orderStatusLabel[row.status]}</TableCell>
                    <TableCell className="text-right">
                      {formatHours(row.mediaHoras)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.quantidade}
                    </TableCell>
                  </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function ReportPlanningTab({ data }: { data: ReportSnapshot }) {
  const semDadosCanal = data.planejamento.vendasPorCanal.length === 0

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold tracking-tight">
          Planejamento e sazonalidade
        </h3>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Tendência de receita por mês, participação por canal e padrão por dia
          da semana (pedidos elegíveis para receita).
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Vendas por mês
            </CardTitle>
            <CardDescription>Valor (receita bruta no período filtrado)</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.planejamento.vendasPorMes}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tickLine={false} />
                <YAxis
                  tickLine={false}
                  tickFormatter={(v) =>
                    new Intl.NumberFormat('pt-BR', {
                      notation: 'compact',
                    }).format(Number(v))
                  }
                />
                <Tooltip
                  formatter={(v: number) => formatCurrencyBRL(Number(v))}
                />
                <Bar
                  dataKey="valor"
                  fill="var(--color-primary)"
                  radius={[6, 6, 0, 0]}
                  name="Valor"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" />
              Por canal de aquisição
            </CardTitle>
            <CardDescription>Valor total no período</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] pt-6">
            {semDadosCanal ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Nenhum dado de canal no período — ajuste os filtros.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data.planejamento.vendasPorCanal.map((c) => ({
                    ...c,
                    nome: canalAquisicaoLabel[c.canal],
                  }))}
                  margin={{ left: 8, right: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) =>
                      new Intl.NumberFormat('pt-BR', {
                        notation: 'compact',
                      }).format(Number(v))
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    width={96}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v: number) => formatCurrencyBRL(Number(v))}
                  />
                  <Bar
                    dataKey="valor"
                    fill="oklch(0.55 0.12 240)"
                    radius={[0, 6, 6, 0]}
                    name="Valor"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Volume por dia da semana
          </CardTitle>
          <CardDescription>
            Receita agregada por dia da semana (pedidos elegíveis)
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.planejamento.volumePorDiaSemana}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" />
              <YAxis
                tickFormatter={(v) =>
                  new Intl.NumberFormat('pt-BR', {
                    notation: 'compact',
                  }).format(Number(v))
                }
              />
              <Tooltip
                formatter={(v: number) => formatCurrencyBRL(Number(v))}
              />
              <Legend />
              <Bar
                dataKey="valor"
                fill="oklch(0.48 0.08 175)"
                name="Valor"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
