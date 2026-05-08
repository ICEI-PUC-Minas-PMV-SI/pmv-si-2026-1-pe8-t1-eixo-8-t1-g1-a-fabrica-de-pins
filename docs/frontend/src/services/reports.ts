import type { CanalAquisicao, ModalidadePedido, OrderStatus } from '@/schemas/order.schema'
import type { ReportFiltersInput } from '@/schemas/report.filters.schema'
import { listCategories } from '@/services/categories.api'
import { getJson } from '@/services/http'
import { listOrders } from '@/services/orders.api'
import { listProducts } from '@/services/products.api'
import type { Order, Product } from '@/types'

export type StockRow = {
  produtoId: string
  nome: string
  categoria: string
  estoque: number
  estoqueMinimo: number
  abaixoDoMinimo: boolean
  unidadesVendidasPeriodo: number
}

export type RevenueBlock = {
  receitaBruta: number
  itensVendidos: number
  pedidosContados: number
  custoOperacionalPeriodo: number
  receitaLiquidaEstimada: number
}

export type ProducaoBlock = {
  mediaHorasProducao: number | null
  medianaHorasProducao: number | null
  registrosComDuracao: number
  pedidosSemTimestamps: number
  porModalidade: {
    modalidade: ModalidadePedido
    mediaHoras: number | null
    quantidade: number
  }[]
  porStatus: {
    status: OrderStatus
    mediaHoras: number | null
    quantidade: number
  }[]
}

export type SeriePonto = { label: string; valor: number }

export type PlanejamentoBlock = {
  vendasPorMes: SeriePonto[]
  vendasPorCanal: { canal: CanalAquisicao; valor: number; pedidos: number }[]
  volumePorDiaSemana: SeriePonto[]
}

export type ReportSnapshot = {
  filtros: ReportFiltersInput
  stock: StockRow[]
  revenue: RevenueBlock
  producao: ProducaoBlock
  planejamento: PlanejamentoBlock
}

type ApiRawBundle = {
  vendas?: unknown
  receita?: unknown
  producao?: unknown
  estoque?: unknown
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    if (!Number.isNaN(n)) return n
  }
  return fallback
}

function str(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v
  if (v == null) return fallback
  return String(v)
}

function obj(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null
}

function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}

function parseDateStart(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}

function parseDateEnd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d, 23, 59, 59, 999)
}

function toIsoStart(s: string): string {
  return new Date(`${s}T00:00:00.000Z`).toISOString()
}

function toIsoEnd(s: string): string {
  return new Date(`${s}T23:59:59.999Z`).toISOString()
}

function mapCanalToApi(canal?: CanalAquisicao): string | undefined {
  if (!canal) return undefined
  const map: Record<CanalAquisicao, string> = {
    instagram: 'INSTAGRAM',
    site: 'SITE',
    marketplace: 'MARKETPLACE',
    loja: 'LOJA',
    indicacao: 'INDICACAO',
    outro: 'OUTRO',
  }
  return map[canal]
}

function mapCanalFromApi(raw: unknown): CanalAquisicao | null {
  const x = str(raw).trim().toUpperCase()
  const map: Record<string, CanalAquisicao> = {
    INSTAGRAM: 'instagram',
    SITE: 'site',
    MARKETPLACE: 'marketplace',
    LOJA: 'loja',
    INDICACAO: 'indicacao',
    INDICAÇÃO: 'indicacao',
    OUTRO: 'outro',
  }
  return map[x] ?? null
}

function orderInPeriod(o: Order, start: Date, end: Date): boolean {
  const t = new Date(o.createdAt).getTime()
  return t >= start.getTime() && t <= end.getTime()
}

function statusCountRevenue(s: OrderStatus): boolean {
  return s === 'confirmado' || s === 'enviado'
}

function passesFilters(
  o: Order,
  f: ReportFiltersInput,
  productById: Map<string, Product>,
): boolean {
  if (f.canalAquisicao && o.canalAquisicao !== f.canalAquisicao) return false
  if (f.modalidade && o.modalidade !== f.modalidade) return false
  if (f.categoriaProduto?.trim()) {
    const cat = f.categoriaProduto.trim()
    const ok = o.itens.some((i) => productById.get(i.produtoId)?.categoria === cat)
    if (!ok) return false
  }
  return true
}

function median(nums: number[]): number | null {
  if (!nums.length) return null
  const s = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  if (s.length % 2) return s[mid]
  return (s[mid - 1] + s[mid]) / 2
}

function mean(nums: number[]): number | null {
  if (!nums.length) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

async function buildLocalSnapshot(filtros: ReportFiltersInput): Promise<ReportSnapshot> {
  const [orders, products] = await Promise.all([listOrders(), listProducts()])
  const start = parseDateStart(filtros.dataInicio)
  const end = parseDateEnd(filtros.dataFim)
  const productById = new Map(products.map((p) => [p.id, p]))

  const ordersNoPeriodo = orders.filter(
    (o) => orderInPeriod(o, start, end) && passesFilters(o, filtros, productById),
  )
  const pedidosReceita = ordersNoPeriodo.filter((o) => statusCountRevenue(o.status))

  const unitsByProduct = new Map<string, number>()
  for (const o of pedidosReceita) {
    for (const i of o.itens) {
      unitsByProduct.set(i.produtoId, (unitsByProduct.get(i.produtoId) ?? 0) + i.quantidade)
    }
  }

  const stock: StockRow[] = products.map((p) => ({
    produtoId: p.id,
    nome: p.nome,
    categoria: p.categoria,
    estoque: p.estoque,
    estoqueMinimo: p.estoqueMinimo,
    abaixoDoMinimo: p.estoque < p.estoqueMinimo,
    unidadesVendidasPeriodo: unitsByProduct.get(p.id) ?? 0,
  }))

  const receitaBruta = pedidosReceita.reduce((a, o) => a + o.valorTotal, 0)
  const itensVendidos = pedidosReceita.reduce(
    (acc, o) => acc + o.itens.reduce((x, i) => x + i.quantidade, 0),
    0,
  )
  const custoOperacionalPeriodo = filtros.custoOperacionalPeriodo ?? 0
  const revenue: RevenueBlock = {
    receitaBruta,
    itensVendidos,
    pedidosContados: pedidosReceita.length,
    custoOperacionalPeriodo,
    receitaLiquidaEstimada: receitaBruta - custoOperacionalPeriodo,
  }

  const duracoesHoras: number[] = []
  let pedidosSemTimestamps = 0
  const porModalidadeMap = new Map<ModalidadePedido, { horas: number[]; qs: number }>()
  const porStatusMap = new Map<OrderStatus, { horas: number[]; qs: number }>()

  for (const o of ordersNoPeriodo) {
    const ini = o.producaoIniciadaEm ? new Date(o.producaoIniciadaEm).getTime() : null
    const fim = o.producaoFinalizadaEm ? new Date(o.producaoFinalizadaEm).getTime() : null
    if (ini != null && fim != null && fim >= ini) {
      const h = (fim - ini) / (1000 * 60 * 60)
      duracoesHoras.push(h)
      const mm = porModalidadeMap.get(o.modalidade) ?? { horas: [], qs: 0 }
      mm.horas.push(h)
      mm.qs += 1
      porModalidadeMap.set(o.modalidade, mm)
      const sm = porStatusMap.get(o.status) ?? { horas: [], qs: 0 }
      sm.horas.push(h)
      sm.qs += 1
      porStatusMap.set(o.status, sm)
    } else {
      pedidosSemTimestamps += 1
    }
  }

  const modalidades: ModalidadePedido[] = ['pronta_entrega', 'pre_venda']
  const porModalidade = modalidades.map((m) => ({
    modalidade: m,
    mediaHoras: mean(porModalidadeMap.get(m)?.horas ?? []),
    quantidade: porModalidadeMap.get(m)?.qs ?? 0,
  }))
  const statuses: OrderStatus[] = ['rascunho', 'confirmado', 'enviado', 'cancelado']
  const porStatus = statuses.map((s) => ({
    status: s,
    mediaHoras: mean(porStatusMap.get(s)?.horas ?? []),
    quantidade: porStatusMap.get(s)?.qs ?? 0,
  }))

  const producao: ProducaoBlock = {
    mediaHorasProducao: mean(duracoesHoras),
    medianaHorasProducao: median(duracoesHoras),
    registrosComDuracao: duracoesHoras.length,
    pedidosSemTimestamps,
    porModalidade,
    porStatus,
  }

  const mesKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  const vendasPorMesMap = new Map<string, number>()
  for (const o of pedidosReceita) {
    const k = mesKey(new Date(o.createdAt))
    vendasPorMesMap.set(k, (vendasPorMesMap.get(k) ?? 0) + o.valorTotal)
  }
  const vendasPorMes: SeriePonto[] = [...vendasPorMesMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, valor]) => ({ label, valor }))

  const canalMap = new Map<CanalAquisicao, { valor: number; pedidos: number }>()
  for (const o of pedidosReceita) {
    const cur = canalMap.get(o.canalAquisicao) ?? { valor: 0, pedidos: 0 }
    cur.valor += o.valorTotal
    cur.pedidos += 1
    canalMap.set(o.canalAquisicao, cur)
  }
  const canais = ['instagram', 'site', 'marketplace', 'loja', 'indicacao', 'outro'] as const
  const vendasPorCanal = canais
    .map((canal) => ({
      canal,
      valor: canalMap.get(canal)?.valor ?? 0,
      pedidos: canalMap.get(canal)?.pedidos ?? 0,
    }))
    .filter((x) => x.valor > 0 || x.pedidos > 0)

  const dowMap = new Map<number, number>()
  for (const o of pedidosReceita) {
    const dow = new Date(o.createdAt).getDay()
    dowMap.set(dow, (dowMap.get(dow) ?? 0) + o.valorTotal)
  }
  const volumePorDiaSemana = [1, 2, 3, 4, 5, 6, 0].map((d) => ({
    label: diasSemana[d],
    valor: dowMap.get(d) ?? 0,
  }))

  return {
    filtros,
    stock,
    revenue,
    producao,
    planejamento: { vendasPorMes, vendasPorCanal, volumePorDiaSemana },
  }
}

async function resolveCategoryIdByName(name?: string): Promise<number | undefined> {
  if (!name?.trim()) return undefined
  const target = name.trim().toLowerCase()
  const categories = await listCategories()
  const match = categories.find((c) => c.nome.trim().toLowerCase() === target)
  return match ? Number(match.id) : undefined
}

function extractRows(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  const r = obj(raw)
  if (!r) return []
  return (
    arr(r.content).length ? arr(r.content) :
    arr(r.rows).length ? arr(r.rows) :
    arr(r.data).length ? arr(r.data) :
    arr(r.itens)
  )
}

function mapStockFromApi(raw: unknown): StockRow[] {
  const rows = extractRows(raw)
  return rows
    .map((x): StockRow | null => {
      const o = obj(x)
      if (!o) return null
      const estoque = num(o.estoqueAtual ?? o.estoque ?? o.quantidadeEstoque, 0)
      const estoqueMinimo = num(o.estoqueMinimo, 0)
      const vendidas = num(o.unidadesVendidasPeriodo ?? o.demandaPeriodo ?? o.vendidoPeriodo, 0)
      const abaixo =
        typeof o.abaixoDoMinimo === 'boolean'
          ? o.abaixoDoMinimo
          : estoque < estoqueMinimo
      return {
        produtoId: str(o.produtoId ?? o.id),
        nome: str(o.nome ?? o.produtoNome, 'Produto'),
        categoria: str(o.categoria ?? o.categoriaNome, 'Sem categoria'),
        estoque,
        estoqueMinimo,
        abaixoDoMinimo: abaixo,
        unidadesVendidasPeriodo: vendidas,
      }
    })
    .filter(Boolean) as StockRow[]
}

function mapRevenueFromApi(raw: unknown, custo: number, fallback: RevenueBlock): RevenueBlock {
  const o = obj(raw)
  if (!o) return fallback
  const receitaBruta = num(o.receitaBruta ?? o.valorTotal ?? o.totalReceita, fallback.receitaBruta)
  const itensVendidos = num(o.itensVendidos ?? o.totalItens, fallback.itensVendidos)
  const pedidosContados = num(o.pedidosContados ?? o.totalPedidos, fallback.pedidosContados)
  const receitaLiquidaEstim = num(
    o.receitaLiquidaEstimada ?? o.receitaLiquida ?? receitaBruta - custo,
    receitaBruta - custo,
  )
  return {
    receitaBruta,
    itensVendidos,
    pedidosContados,
    custoOperacionalPeriodo: custo,
    receitaLiquidaEstimada: receitaLiquidaEstim,
  }
}

function mapProducaoFromApi(raw: unknown, fallback: ProducaoBlock): ProducaoBlock {
  const o = obj(raw)
  if (!o) return fallback
  const porModalidadeRaw = extractRows(o.porModalidade ?? o.modalidades)
  const porStatusRaw = extractRows(o.porStatus ?? o.statuses)
  const porModalidade = porModalidadeRaw
    .map(
      (
        x,
      ):
        | {
            modalidade: ModalidadePedido
            mediaHoras: number | null
            quantidade: number
          }
        | null => {
      const r = obj(x)
      if (!r) return null
      const modalidade: ModalidadePedido =
        str(r.modalidade).toUpperCase().includes('PRE')
          ? 'pre_venda'
          : 'pronta_entrega'
      const media = num(r.mediaHoras ?? r.media, Number.NaN)
      return {
        modalidade,
        mediaHoras: Number.isNaN(media) ? null : media,
        quantidade: num(r.quantidade ?? r.total, 0),
      }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
  const porStatus = porStatusRaw
    .map((x) => {
      const r = obj(x)
      if (!r) return null
      const s = str(r.status).trim().toUpperCase()
      const statusMap: Record<string, OrderStatus> = {
        RASCUNHO: 'rascunho',
        CONFIRMADO: 'confirmado',
        ENVIADO: 'enviado',
        CANCELADO: 'cancelado',
      }
      const status = statusMap[s]
      if (!status) return null
      const media = num(r.mediaHoras ?? r.media, Number.NaN)
      return {
        status,
        mediaHoras: Number.isNaN(media) ? null : media,
        quantidade: num(r.quantidade ?? r.total, 0),
      }
    })
    .filter(Boolean) as ProducaoBlock['porStatus']

  return {
    mediaHorasProducao: num(o.mediaHorasProducao ?? o.tempoMedioHoras, Number.NaN),
    medianaHorasProducao: num(o.medianaHorasProducao ?? o.tempoMedianaHoras, Number.NaN),
    registrosComDuracao: num(o.registrosComDuracao ?? o.registrosValidos, fallback.registrosComDuracao),
    pedidosSemTimestamps: num(o.pedidosSemTimestamps ?? o.pedidosSemRegistro, fallback.pedidosSemTimestamps),
    porModalidade: porModalidade.length ? porModalidade : fallback.porModalidade,
    porStatus: porStatus.length ? porStatus : fallback.porStatus,
  }
}

function mapPlanningFromVendasApi(raw: unknown, fallback: PlanejamentoBlock): PlanejamentoBlock {
  const o = obj(raw)
  if (!o) return fallback

  const mesRows = extractRows(o.vendasPorMes ?? o.serieMes ?? o.serieMensal)
  const vendasPorMes = mesRows
    .map((x) => {
      const r = obj(x)
      if (!r) return null
      return {
        label: str(r.label ?? r.mes ?? r.periodo),
        valor: num(r.valor ?? r.total ?? r.receita),
      }
    })
    .filter((x): x is SeriePonto => Boolean(x && x.label))

  const canalRows = extractRows(o.vendasPorCanal ?? o.porCanal)
  const vendasPorCanal = canalRows
    .map((x) => {
      const r = obj(x)
      if (!r) return null
      const canal = mapCanalFromApi(r.canal ?? r.nomeCanal)
      if (!canal) return null
      return {
        canal,
        valor: num(r.valor ?? r.total ?? r.receita),
        pedidos: num(r.pedidos ?? r.quantidadePedidos, 0),
      }
    })
    .filter(Boolean) as PlanejamentoBlock['vendasPorCanal']

  const dowRows = extractRows(o.volumePorDiaSemana ?? o.porDiaSemana)
  const volumePorDiaSemana = dowRows
    .map((x) => {
      const r = obj(x)
      if (!r) return null
      return {
        label: str(r.label ?? r.dia ?? r.nomeDia),
        valor: num(r.valor ?? r.total ?? r.receita),
      }
    })
    .filter((x): x is SeriePonto => Boolean(x && x.label))

  return {
    vendasPorMes: vendasPorMes.length ? vendasPorMes : fallback.vendasPorMes,
    vendasPorCanal: vendasPorCanal.length ? vendasPorCanal : fallback.vendasPorCanal,
    volumePorDiaSemana: volumePorDiaSemana.length
      ? volumePorDiaSemana
      : fallback.volumePorDiaSemana,
  }
}

async function fetchApiReports(filtros: ReportFiltersInput): Promise<ApiRawBundle> {
  const canal = mapCanalToApi(filtros.canalAquisicao)
  const dataInicio = toIsoStart(filtros.dataInicio)
  const dataFim = toIsoEnd(filtros.dataFim)
  const categoriaId = await resolveCategoryIdByName(filtros.categoriaProduto)

  const vendasParams = new URLSearchParams({
    dataInicio,
    dataFim,
    periodo: 'MES',
    dimensao: 'CATEGORIA',
  })
  if (canal) vendasParams.set('canal', canal)
  if (categoriaId) vendasParams.set('categoriaId', String(categoriaId))

  const receitaParams = new URLSearchParams({
    dataInicio,
    dataFim,
    periodo: 'MES',
  })
  if (canal) receitaParams.set('canal', canal)

  const producaoParams = new URLSearchParams({
    dataInicio,
    dataFim,
    periodo: 'MES',
  })
  if (canal) producaoParams.set('canal', canal)

  const estoqueParams = new URLSearchParams({
    dimensao: 'PRODUTO',
    demandaInicio: dataInicio,
    demandaFim: dataFim,
  })
  if (categoriaId) estoqueParams.set('categoriaId', String(categoriaId))

  const [vendas, receita, producao, estoque] = await Promise.allSettled([
    getJson<unknown>(`/gestao/relatorio/vendas?${vendasParams.toString()}`),
    getJson<unknown>(`/gestao/relatorio/receita?${receitaParams.toString()}`),
    getJson<unknown>(`/gestao/relatorio/producao?${producaoParams.toString()}`),
    getJson<unknown>(`/gestao/relatorio/estoque?${estoqueParams.toString()}`),
  ])

  const out: ApiRawBundle = {}
  if (vendas.status === 'fulfilled') out.vendas = vendas.value
  if (receita.status === 'fulfilled') out.receita = receita.value
  if (producao.status === 'fulfilled') out.producao = producao.value
  if (estoque.status === 'fulfilled') out.estoque = estoque.value
  return out
}

export async function getReportSnapshot(filtros: ReportFiltersInput): Promise<ReportSnapshot> {
  const local = await buildLocalSnapshot(filtros)
  const api = await fetchApiReports(filtros)

  const stockFromApi = api.estoque ? mapStockFromApi(api.estoque) : []
  const revenueFromApi = api.receita
    ? mapRevenueFromApi(
        api.receita,
        filtros.custoOperacionalPeriodo ?? 0,
        local.revenue,
      )
    : local.revenue
  const producaoFromApi = api.producao
    ? mapProducaoFromApi(api.producao, local.producao)
    : local.producao
  const planejamentoFromApi = api.vendas
    ? mapPlanningFromVendasApi(api.vendas, local.planejamento)
    : local.planejamento

  return {
    filtros,
    stock: stockFromApi.length ? stockFromApi : local.stock,
    revenue: revenueFromApi,
    producao: producaoFromApi,
    planejamento: planejamentoFromApi,
  }
}
