import type { ReportFiltersInput } from '@/schemas/report.filters.schema'
import { listCategories } from '@/services/categories.api'
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
  return new Date(`${s}T00:00:00.000Z`).toISOString()
}

function toIsoEnd(s: string): string {
  return new Date(`${s}T23:59:59.999Z`).toISOString()
}

function mapCanalToApi(
  canal?: ReportFiltersInput['canalAquisicao'],
): string | undefined {
  if (!canal) return undefined
  const map = {
    instagram: 'INSTAGRAM',
    site: 'SITE',
    marketplace: 'MARKETPLACE',
    loja: 'LOJA',
    indicacao: 'INDICACAO',
    outro: 'OUTRO',
  } as const
  return map[canal]
}

async function resolveCategoryIdByName(name?: string): Promise<number | undefined> {
  if (!name?.trim()) return undefined
  const target = name.trim().toLowerCase()
  const categories = await listCategories()
  const match = categories.find((c) => c.nome.trim().toLowerCase() === target)
  return match ? Number(match.id) : undefined
}

async function buildQuery(filtros: ReportFiltersInput): Promise<string> {
  const p = new URLSearchParams()
  p.set('dataInicio', toIsoStart(filtros.dataInicio))
  p.set('dataFim', toIsoEnd(filtros.dataFim))
  const canal = mapCanalToApi(filtros.canalAquisicao)
  if (canal) p.set('canal', canal)
  if (filtros.tipoCliente) p.set('tipoCliente', filtros.tipoCliente)
  const catId = await resolveCategoryIdByName(filtros.categoriaProduto)
  if (catId != null) p.set('categoriaId', String(catId))
  return p.toString()
}

export async function fetchRelatorioResumo(
  filtros: ReportFiltersInput,
): Promise<RelatorioResumo> {
  const q = await buildQuery(filtros)
  return getJson<RelatorioResumo>(`${BASE}/resumo?${q}`)
}

export async function fetchRelatorioReceita(
  filtros: ReportFiltersInput,
): Promise<RelatorioReceita> {
  const q = await buildQuery(filtros)
  return getJson<RelatorioReceita>(`${BASE}/receita?${q}`)
}

export async function fetchRelatorioProducao(
  filtros: ReportFiltersInput,
): Promise<RelatorioProducao> {
  const q = await buildQuery(filtros)
  return getJson<RelatorioProducao>(`${BASE}/producao?${q}`)
}

export async function fetchRelatorioPlanejamento(
  filtros: ReportFiltersInput,
): Promise<RelatorioPlanejamento> {
  const q = await buildQuery(filtros)
  return getJson<RelatorioPlanejamento>(`${BASE}/planejamento?${q}`)
}

export async function fetchRelatorioEstoque(
  filtros: ReportFiltersInput,
): Promise<RelatorioEstoque> {
  const q = await buildQuery(filtros)
  return getJson<RelatorioEstoque>(`${BASE}/estoque?${q}`)
}
