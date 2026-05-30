import type { ReportFiltersInput } from '@/schemas/report.filters.schema'
import { getJson } from '@/services/http'

const BASE = '/gestao/relatorios'

export type RelatorioResumo = {
  estoqueCritico: number
  receitaBruta: number
  receitaLiquida: number
  lucroEstimado: number
  tempoMedioProducao: number
}

export type RelatorioReceita = {
  receitaBruta: number
  receitaLiquida: number
  quantidadePedidos: number
  quantidadePedidosCancelados: number
  totalItens: number
  ticketMedio: number
}

export type RelatorioProducao = {
  tempoMedioProducaoHoras: number
  quantidadeProntaEntrega: number
  quantidadePreVenda: number
  quantidadeSobDemanda: number
  pedidosPorStatus: { status: string; quantidade: number }[]
  produtosMaisDemorados: { nomeProduto: string; tempoProducao: number }[]
}

export type RelatorioPlanejamento = {
  receitaTotal: number
  vendasPorCanal: {
    canal: string
    quantidadePedidos: number
    percentualParticipacao: number
    receita: number
  }[]
  historicoVendas: {
    periodo: string
    label: string
    quantidadePedidos: number
    quantidadeItens: number
    receita: number
    crescimentoPercentual: number
  }[]
}

export type ProdutoEstoqueDTO = {
  nome: string
  categoriaNome: string
  quantidadeEstoque: number
  estoqueMinimo: number
  vendidosPeriodo: number
  situacao: string
}

export type RelatorioEstoque = {
  produtos: ProdutoEstoqueDTO[]
  estoqueCritico: number
  estoqueExcesso: number
}

function toIsoStart(s: string): string {
  return `${s}T00:00:00Z`
}

function toIsoEnd(s: string): string {
  return `${s}T23:59:59Z`
}

function mapCanalToApi(
  canal?: ReportFiltersInput['canalAquisicao'],
): string | undefined {
  if (!canal) return undefined
  const map = {
    site: 'SITE',
    whatsapp: 'WHATSAPP',
    rede_social: 'REDE_SOCIAL',
  } as const
  return map[canal]
}

function buildQuery(filtros: ReportFiltersInput): string {
  const p = new URLSearchParams()
  p.set('dataInicio', toIsoStart(filtros.dataInicio))
  p.set('dataFim', toIsoEnd(filtros.dataFim))
  const canal = mapCanalToApi(filtros.canalAquisicao)
  if (canal) p.set('canal', canal)
  if (filtros.tipoCliente) p.set('tipoCliente', filtros.tipoCliente)
  if (filtros.categoriaId != null) {
    p.set('categoriaId', String(filtros.categoriaId))
  }
  return p.toString()
}

export async function fetchRelatorioResumo(
  filtros: ReportFiltersInput,
): Promise<RelatorioResumo> {
  return getJson<RelatorioResumo>(`${BASE}/resumo?${buildQuery(filtros)}`)
}

export async function fetchRelatorioReceita(
  filtros: ReportFiltersInput,
): Promise<RelatorioReceita> {
  return getJson<RelatorioReceita>(`${BASE}/receita?${buildQuery(filtros)}`)
}

export async function fetchRelatorioProducao(
  filtros: ReportFiltersInput,
): Promise<RelatorioProducao> {
  return getJson<RelatorioProducao>(`${BASE}/producao?${buildQuery(filtros)}`)
}

export async function fetchRelatorioPlanejamento(
  filtros: ReportFiltersInput,
): Promise<RelatorioPlanejamento> {
  const sp = new URLSearchParams(buildQuery(filtros))
  sp.set('periodo', filtros.periodoPlanejamento ?? 'MES')
  return getJson<RelatorioPlanejamento>(`${BASE}/planejamento?${sp.toString()}`)
}

export async function fetchRelatorioEstoque(
  filtros: ReportFiltersInput,
): Promise<RelatorioEstoque> {
  return getJson<RelatorioEstoque>(`${BASE}/estoque?${buildQuery(filtros)}`)
}
