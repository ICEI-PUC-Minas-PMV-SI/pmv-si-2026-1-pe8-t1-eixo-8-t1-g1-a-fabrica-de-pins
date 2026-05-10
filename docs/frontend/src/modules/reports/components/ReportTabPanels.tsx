import type { ComponentType, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  Factory,
  LayoutGrid,
  Package,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import { TablePaginationBar } from '@/components/layout/TablePaginationBar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { canalAquisicaoLabel } from '@/modules/orders/lib/order-labels'
import type {
  ProdutoEstoqueDTO,
  RelatorioEstoque,
  RelatorioPlanejamento,
  RelatorioProducao,
  RelatorioReceita,
  RelatorioResumo,
} from '@/services/reports.api'
import { formatCurrencyBRL } from '@/utils/format'
import { cn } from '@/utils/cn'

/** Cor dos gráficos de relatório (funciona em SVG; evita `hsl(var(--primary))`). */
const RELATORIO_CHART = '#c59a6c'

const ESTOQUE_PAGE_SIZE = 20

function formatHours(h: number): string {
  if (h == null || Number.isNaN(h)) return '—'
  return `${Number(h).toFixed(1)} h`
}

function canalApiToLabel(canal: string): string {
  const u = canal.trim().toUpperCase()
  const map: Record<string, keyof typeof canalAquisicaoLabel> = {
    INSTAGRAM: 'instagram',
    SITE: 'site',
    MARKETPLACE: 'marketplace',
    LOJA: 'loja',
    INDICACAO: 'indicacao',
    INDICAÇÃO: 'indicacao',
    OUTRO: 'outro',
  }
  const k = map[u]
  return k ? canalAquisicaoLabel[k] : canal
}

/** Status de pedido retornado pelo relatório de produção / gestão (API em UPPER_SNAKE). */
const gestaoPedidoStatusLabel: Record<string, string> = {
  RASCUNHO: 'Rascunho',
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  PAGAMENTO_CONFIRMADO: 'Pagamento confirmado',
  EM_PRODUCAO: 'Em produção',
  EM_SEPARACAO: 'Em separação',
  AGUARDANDO_ENVIO: 'Aguardando envio',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
  REEMBOLSADO: 'Reembolsado',
  CONFIRMADO: 'Confirmado',
}

function gestaoStatusParaExibicao(raw: string): string {
  const k = raw.trim().toUpperCase()
  return gestaoPedidoStatusLabel[k] ?? raw.replace(/_/g, ' ').toLowerCase()
}

function normalizeSituacaoEstoque(s: string): string {
  return s.trim().toUpperCase()
}

function situacaoEstoqueLabel(codigo: string): string {
  const k = normalizeSituacaoEstoque(codigo)
  const map: Record<string, string> = {
    ABAIXO_DO_MINIMO: 'Abaixo do mínimo',
    ACIMA_DO_MAXIMO: 'Acima do máximo',
    SEM_ESTOQUE: 'Sem estoque',
    NORMAL: 'Normal',
    OK: 'Normal',
  }
  return map[k] ?? codigo.replace(/_/g, ' ').toLowerCase()
}

function situacaoEstoqueBadgeClass(codigo: string): string {
  const k = normalizeSituacaoEstoque(codigo)
  if (k === 'SEM_ESTOQUE' || k === 'ABAIXO_DO_MINIMO') {
    return 'bg-destructive/12 text-destructive'
  }
  if (k === 'ACIMA_DO_MAXIMO') {
    return 'border border-amber-800/25 bg-amber-100 text-amber-950 dark:border-amber-400/35 dark:bg-amber-950/70 dark:text-amber-50'
  }
  return 'bg-muted text-muted-foreground'
}

function rankSituacaoEstoque(codigo: string): number {
  const k = normalizeSituacaoEstoque(codigo)
  const order: Record<string, number> = {
    SEM_ESTOQUE: 0,
    ABAIXO_DO_MINIMO: 1,
    ACIMA_DO_MAXIMO: 2,
    NORMAL: 3,
    OK: 3,
  }
  return order[k] ?? 4
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

const defaultResumo: RelatorioResumo = {
  estoqueCritico: 0,
  receitaBruta: 0,
  receitaLiquida: 0,
  lucroEstimado: 0,
  tempoMedioProducao: 0,
}

export function ReportOverviewTab({ resumo }: { resumo?: RelatorioResumo }) {
  const r = resumo ?? defaultResumo

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-dashed border-primary/25 bg-gradient-to-br from-primary/[0.06] via-card to-card px-5 py-6 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Visão geral</h3>
            <p className="text-sm text-muted-foreground">
              Indicadores consolidados do período e filtros ativos.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatHighlight
          icon={AlertTriangle}
          label="Estoque crítico"
          value={r.estoqueCritico}
          hint="Itens abaixo do mínimo ou em alerta"
        />
        <StatHighlight
          icon={Wallet}
          label="Receita bruta"
          value={formatCurrencyBRL(r.receitaBruta)}
        />
        <StatHighlight
          icon={TrendingUp}
          label="Lucro estimado"
          value={formatCurrencyBRL(r.lucroEstimado)}
        />
        <StatHighlight
          icon={Clock}
          label="Tempo médio de produção"
          value={formatHours(r.tempoMedioProducao)}
        />
      </div>
    </div>
  )
}

type EstoqueFiltroSit =
  | 'todos'
  | 'NORMAL'
  | 'ABAIXO_DO_MINIMO'
  | 'ACIMA_DO_MAXIMO'
  | 'SEM_ESTOQUE'

export function ReportStockTab({ estoque }: { estoque?: RelatorioEstoque }) {
  const [filtro, setFiltro] = useState<EstoqueFiltroSit>('todos')
  const [pageIndex, setPageIndex] = useState(0)

  const rows = useMemo(() => {
    const list = estoque?.produtos ?? []
    const filtered =
      filtro === 'todos'
        ? [...list]
        : list.filter((p) => normalizeSituacaoEstoque(p.situacao) === filtro)
    filtered.sort((a, b) => {
      const d = rankSituacaoEstoque(a.situacao) - rankSituacaoEstoque(b.situacao)
      if (d !== 0) return d
      return a.nome.localeCompare(b.nome, 'pt-BR')
    })
    return filtered
  }, [estoque?.produtos, filtro])

  const totalElements = rows.length
  const totalPages =
    totalElements === 0 ? 0 : Math.ceil(totalElements / ESTOQUE_PAGE_SIZE)

  useEffect(() => {
    setPageIndex(0)
  }, [filtro])

  useEffect(() => {
    setPageIndex((p) => {
      if (totalPages === 0) return 0
      return Math.min(p, totalPages - 1)
    })
  }, [totalPages])

  const pageRows = useMemo(
    () =>
      rows.slice(
        pageIndex * ESTOQUE_PAGE_SIZE,
        pageIndex * ESTOQUE_PAGE_SIZE + ESTOQUE_PAGE_SIZE,
      ),
    [rows, pageIndex],
  )

  const crit = estoque?.estoqueCritico ?? 0
  const exc = estoque?.estoqueExcesso ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight">Estoque</h3>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Situação por produto conforme a API de gestão.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="grid gap-2">
            <Label>Exibir</Label>
            <Select
              value={filtro}
              onValueChange={(v) => setFiltro(v as EstoqueFiltroSit)}
            >
              <SelectTrigger className="w-[min(100%,280px)] sm:w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="ABAIXO_DO_MINIMO">Abaixo do mínimo</SelectItem>
                <SelectItem value="ACIMA_DO_MAXIMO">Acima do máximo</SelectItem>
                <SelectItem value="SEM_ESTOQUE">Sem estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span>
                <strong className="font-semibold text-foreground">{crit}</strong>{' '}
                crítico(s)
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-amber-800/25 bg-amber-100 px-4 py-2 text-sm text-amber-950 shadow-sm dark:border-amber-400/35 dark:bg-amber-950/70 dark:text-amber-50">
              <TrendingUp className="h-4 w-4 shrink-0 text-amber-800 dark:text-amber-200" />
              <span className="text-amber-950 dark:text-amber-50">
                <strong className="font-semibold">{exc}</strong> possível(is)
                excesso
              </span>
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Inventário por produto
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 overflow-x-auto p-0 md:p-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="text-right">Mínimo</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((row: ProdutoEstoqueDTO, i: number) => (
                <TableRow key={`${row.nome}-${pageIndex}-${i}`}>
                  <TableCell className="font-medium">{row.nome}</TableCell>
                  <TableCell>{row.categoriaNome}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.quantidadeEstoque}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.estoqueMinimo}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                        situacaoEstoqueBadgeClass(row.situacao),
                      )}
                    >
                      {situacaoEstoqueLabel(row.situacao)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePaginationBar
            pageIndex={pageIndex}
            pageSize={ESTOQUE_PAGE_SIZE}
            totalPages={totalPages}
            totalElements={totalElements}
            rowCount={pageRows.length}
            isFirst={pageIndex === 0 || totalPages === 0}
            isLast={totalPages === 0 || pageIndex >= totalPages - 1}
            emptyMessage="Nenhum produto no estoque para os filtros."
            onPrev={() => setPageIndex((p) => Math.max(0, p - 1))}
            onNext={() =>
              setPageIndex((p) =>
                totalPages <= 0 ? p : Math.min(totalPages - 1, p + 1),
              )
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}

const defaultReceita: RelatorioReceita = {
  receitaBruta: 0,
  receitaLiquida: 0,
  quantidadePedidos: 0,
  quantidadePedidosCancelados: 0,
  totalItens: 0,
  ticketMedio: 0,
}

export function ReportRevenueTab({
  receita,
  historicoReceita,
}: {
  receita?: RelatorioReceita
  historicoReceita?: RelatorioPlanejamento['historicoVendas']
}) {
  const r = receita ?? defaultReceita
  const lineData = (historicoReceita ?? []).map((h, i) => {
    const t = h.periodo ? Date.parse(h.periodo) : NaN
    const labelFallback =
      !Number.isNaN(t) ? new Date(t).toLocaleDateString('pt-BR') : `Ponto ${i + 1}`
    return {
      label: (h.label && String(h.label).trim()) || labelFallback,
      receita: Number(h.receita),
    }
  })
  const maxReceita = Math.max(
    1,
    ...lineData.map((d) => (Number.isFinite(d.receita) ? d.receita : 0)),
  )

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold tracking-tight">Receita</h3>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Resumo financeiro do período filtrado.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatHighlight
          icon={Wallet}
          label="Receita bruta"
          value={formatCurrencyBRL(r.receitaBruta)}
        />
        <StatHighlight
          icon={TrendingUp}
          label="Receita líquida"
          value={formatCurrencyBRL(r.receitaLiquida)}
        />
        <StatHighlight
          icon={Package}
          label="Total de itens"
          value={r.totalItens}
        />
        <StatHighlight
          icon={TrendingUp}
          label="Pedidos"
          value={r.quantidadePedidos}
          hint={`${r.quantidadePedidosCancelados} cancelados`}
        />
        <StatHighlight
          icon={Wallet}
          label="Ticket médio"
          value={formatCurrencyBRL(r.ticketMedio)}
        />
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Receita no tempo
          </CardTitle>
          <CardDescription>
            Evolução da receita por período (planejamento).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {lineData.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              Sem histórico para o período.
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 12, left: 8, right: 16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  domain={[0, maxReceita]}
                  tickFormatter={(v) =>
                    new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(
                      Number(v),
                    )
                  }
                />
                <Tooltip
                  formatter={(v: number | string) =>
                    formatCurrencyBRL(Number(v))
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="receita"
                  name="Receita"
                  stroke={RELATORIO_CHART}
                  strokeWidth={2}
                  dot={{ r: 4, fill: RELATORIO_CHART, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: RELATORIO_CHART }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const defaultProducao: RelatorioProducao = {
  tempoMedioProducaoHoras: 0,
  quantidadeProntaEntrega: 0,
  quantidadePreVenda: 0,
  quantidadeSobDemanda: 0,
  pedidosPorStatus: [],
  produtosMaisDemorados: [],
}

export function ReportProductionTab({ producao }: { producao?: RelatorioProducao }) {
  const p = producao ?? defaultProducao

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold tracking-tight">Produção</h3>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Tempos e volumes conforme relatório de gestão.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatHighlight
          icon={Clock}
          label="Tempo médio de produção"
          value={formatHours(p.tempoMedioProducaoHoras)}
        />
        <StatHighlight
          icon={Factory}
          label="Pronta entrega"
          value={p.quantidadeProntaEntrega}
        />
        <StatHighlight
          icon={Factory}
          label="Pré-venda"
          value={p.quantidadePreVenda}
        />
        <StatHighlight
          icon={Factory}
          label="Sob demanda"
          value={p.quantidadeSobDemanda}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-base">
              <Factory className="h-4 w-4 text-primary" />
              Pedidos por status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {p.pedidosPorStatus.map((row, i) => (
                  <TableRow key={`${row.status}-${i}`}>
                    <TableCell>{gestaoStatusParaExibicao(row.status)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.quantidade}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Produtos mais demorados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Tempo (h)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {p.produtosMaisDemorados.map((row, i) => (
                  <TableRow key={`${row.nomeProduto}-${i}`}>
                    <TableCell className="font-medium">{row.nomeProduto}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatHours(row.tempoProducao)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function ReportPlanningTab({
  planejamento,
}: {
  planejamento?: RelatorioPlanejamento
}) {
  const pl = planejamento ?? {
    receitaTotal: 0,
    vendasPorCanal: [],
    historicoVendas: [],
  }

  const canalChart = pl.vendasPorCanal.map((c) => ({
    nome: canalApiToLabel(c.canal),
    receita: c.receita,
    pct: c.percentualParticipacao,
    pedidos: c.quantidadePedidos,
  }))

  const histBar = pl.historicoVendas.map((h) => ({
    label: h.label,
    receita: h.receita,
  }))

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold tracking-tight">Planejamento</h3>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Canais e histórico de vendas no período.
        </p>
      </div>

      <StatHighlight
        icon={Wallet}
        label="Receita total (planejamento)"
        value={formatCurrencyBRL(pl.receitaTotal)}
        className="max-w-md"
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" />
              Por canal
            </CardTitle>
            <CardDescription>Receita e participação</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] pt-6">
            {canalChart.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Nenhum dado de canal no período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={canalChart}
                  margin={{ left: 8, right: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) =>
                      new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(
                        Number(v),
                      )
                    }
                  />
                  <YAxis type="category" dataKey="nome" width={96} tickLine={false} />
                  <Tooltip
                    formatter={(v: number, name: string) => {
                      if (name === 'receita') return formatCurrencyBRL(Number(v))
                      return String(v)
                    }}
                  />
                  <Bar
                    dataKey="receita"
                    fill={RELATORIO_CHART}
                    radius={[0, 6, 6, 0]}
                    name="receita"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Histórico de vendas
            </CardTitle>
            <CardDescription>Receita por período</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] pt-6">
            {histBar.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sem histórico no período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histBar}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tickLine={false} />
                  <YAxis
                    tickLine={false}
                    tickFormatter={(v) =>
                      new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(
                        Number(v),
                      )
                    }
                  />
                  <Tooltip formatter={(v: number) => formatCurrencyBRL(Number(v))} />
                  <Bar
                    dataKey="receita"
                    fill={RELATORIO_CHART}
                    radius={[6, 6, 0, 0]}
                    name="Receita"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
