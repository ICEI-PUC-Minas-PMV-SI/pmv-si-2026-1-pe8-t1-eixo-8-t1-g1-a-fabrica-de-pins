import type {
  CanalAquisicao,
  ModalidadePedido,
  OrderCreateValues,
  OrderStatus,
  OrderUpdateValues,
} from '@/schemas/order.schema'
import type { Order, OrderItem, TipoCliente } from '@/types'
import { getJson, postJson, putJson } from '@/services/http'
import {
  FETCH_ALL_CHUNK_SIZE,
  PAGE_SIZE_DEFAULT,
  type SpringPage,
  asRecord,
  parseSpringPagePayload,
} from '@/services/springPage'

export type OrdersPageMeta = SpringPage<Order>

export const ORDERS_PAGE_SIZE = PAGE_SIZE_DEFAULT

/** Ordenação Spring — campo conforme resposta `dataCriacao`. */
const SORT_ORDERS_NEWEST = 'dataCriacao,desc'

function idStr(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    if (!Number.isNaN(n)) return n
  }
  return fallback
}

function normalizeIso(raw: unknown): string {
  if (raw == null) return new Date().toISOString()
  const s = String(raw)
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

const STATUS_API_TO_FRONT: Record<string, OrderStatus> = {
  RASCUNHO: 'rascunho',
  AGUARDANDO_PAGAMENTO: 'aguardando_pagamento',
  PAGAMENTO_CONFIRMADO: 'pagamento_confirmado',
  EM_PRODUCAO: 'em_producao',
  EM_SEPARACAO: 'em_separacao',
  AGUARDANDO_ENVIO: 'aguardando_envio',
  ENVIADO: 'enviado',
  ENTREGUE: 'entregue',
  CANCELADO: 'cancelado',
  REEMBOLSADO: 'reembolsado',
  /** Legado */
  CONFIRMADO: 'pagamento_confirmado',
}

const STATUS_FRONT_TO_API: Record<OrderStatus, string> = {
  rascunho: 'RASCUNHO',
  aguardando_pagamento: 'AGUARDANDO_PAGAMENTO',
  pagamento_confirmado: 'PAGAMENTO_CONFIRMADO',
  em_producao: 'EM_PRODUCAO',
  em_separacao: 'EM_SEPARACAO',
  aguardando_envio: 'AGUARDANDO_ENVIO',
  enviado: 'ENVIADO',
  entregue: 'ENTREGUE',
  cancelado: 'CANCELADO',
  reembolsado: 'REEMBOLSADO',
}

export function mapStatusApiToFrontend(s: string): OrderStatus {
  const u = s.trim().toUpperCase()
  return STATUS_API_TO_FRONT[u] ?? 'rascunho'
}

function mapStatusFrontendToApi(s: OrderStatus): string {
  return STATUS_FRONT_TO_API[s]
}

function mapOrigemToCanal(origem: string): CanalAquisicao {
  const u = origem.trim().toUpperCase()
  const map: Record<string, CanalAquisicao> = {
    SITE: 'site',
    INSTAGRAM: 'instagram',
    MARKETPLACE: 'marketplace',
    LOJA: 'loja',
    INDICACAO: 'indicacao',
    INDICAÇÃO: 'indicacao',
    OUTRO: 'outro',
  }
  return map[u] ?? 'site'
}

export function mapCanalToOrigem(canal: CanalAquisicao): string {
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

function mapModalidadeFromApi(raw: unknown): ModalidadePedido {
  const u = String(raw ?? '').toUpperCase()
  if (u === 'PRE_VENDA' || u === 'PRE-VENDA') return 'pre_venda'
  return 'pronta_entrega'
}

function mapModalidadeToApi(m: ModalidadePedido): string {
  return m === 'pre_venda' ? 'PRE_VENDA' : 'PRONTA_ENTREGA'
}

function mapTipoClienteFromApi(raw: unknown): TipoCliente | undefined {
  const u = String(raw ?? '').toUpperCase()
  if (u === 'REVENDA') return 'REVENDA'
  if (u === 'VAREJO') return 'VAREJO'
  return undefined
}

function mapOrderItem(raw: unknown): OrderItem | null {
  const o = asRecord(raw)
  if (!o) return null
  const pid = o.produtoId ?? o.id ?? o.productId
  if (pid == null) return null
  return {
    produtoId: idStr(pid),
    quantidade: Math.max(1, Math.floor(num(o.quantidade, 1))),
    precoUnitario: Math.max(0, num(o.precoUnitario ?? o.valorUnitario, 0)),
  }
}

/** Resposta de item na lista ou detalhe do pedido. */
export function mapOrderFromApi(raw: unknown): Order {
  const o = asRecord(raw)
  if (!o) throw new Error('Resposta de pedido inválida')

  const cliente = asRecord(o.cliente)

  const itensRaw = o.itens ?? o.items
  let itens: OrderItem[] = []
  if (Array.isArray(itensRaw)) {
    itens = itensRaw.map(mapOrderItem).filter(Boolean) as OrderItem[]
  }

  const clienteId =
    o.clienteId != null && o.clienteId !== ''
      ? idStr(o.clienteId)
      : cliente?.id != null
        ? idStr(cliente.id)
        : ''

  const clienteNome =
    o.nomeCliente !== undefined && o.nomeCliente !== null
      ? String(o.nomeCliente)
      : cliente?.nome !== undefined && cliente?.nome !== null
        ? String(cliente.nome)
        : undefined

  const tipoCliente =
    mapTipoClienteFromApi(o.tipoCliente) ??
    mapTipoClienteFromApi(cliente?.tipoCliente)

  let cupomCodigos: string[] | undefined
  const cupRaw = o.cupons
  if (Array.isArray(cupRaw) && cupRaw.length) {
    cupomCodigos = cupRaw
      .map((x) => {
        const r = asRecord(x)
        return r && r.codigo != null ? String(r.codigo) : ''
      })
      .filter(Boolean)
  }

  const inicioRaw = o.dataInicioProducao ?? o.producaoIniciadaEm
  const fimRaw = o.dataConclusaoPedido ?? o.producaoFinalizadaEm

  return {
    id: idStr(o.id),
    clienteId,
    clienteNome,
    tipoCliente,
    itens,
    valorTotal: num(o.valorTotal),
    status: mapStatusApiToFrontend(String(o.statusPedido ?? o.status ?? 'RASCUNHO')),
    modalidade:
      o.modalidadePedido !== undefined || o.modalidade !== undefined
        ? mapModalidadeFromApi(o.modalidadePedido ?? o.modalidade)
        : 'pronta_entrega',
    canalAquisicao: mapOrigemToCanal(String(o.origemPedido ?? 'SITE')),
    producaoIniciadaEm:
      inicioRaw != null && String(inicioRaw).length > 0
        ? normalizeIso(inicioRaw)
        : undefined,
    producaoFinalizadaEm:
      fimRaw != null && String(fimRaw).length > 0
        ? normalizeIso(fimRaw)
        : undefined,
    createdAt: normalizeIso(o.dataCriacao ?? o.createdAt),
    observacao:
      o.observacao !== undefined && o.observacao !== null
        ? String(o.observacao)
        : undefined,
    valorFrete: o.valorFrete !== undefined ? num(o.valorFrete) : undefined,
    cupomCodigos,
    valorSubtotal:
      o.valorSubtotal !== undefined ? num(o.valorSubtotal) : undefined,
    descontoValor:
      o.desconto !== undefined
        ? num(o.desconto)
        : o.valorDesconto !== undefined
          ? num(o.valorDesconto)
          : undefined,
  }
}

async function getOrdersPageRaw(
  page: number,
  pageSize: number,
  sort: string,
) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(pageSize),
    sort,
  })
  const data = await getJson<unknown>(
    `/admin/pedido?${params.toString()}`,
  )
  return parseSpringPagePayload(data)
}

/** Lista completa — percorre todas as páginas (exportação, relatórios). */
export async function listOrders(): Promise<Order[]> {
  const all: Order[] = []
  let page = 0
  for (;;) {
    const parsed = await getOrdersPageRaw(
      page,
      FETCH_ALL_CHUNK_SIZE,
      SORT_ORDERS_NEWEST,
    )
    for (const item of parsed.content) {
      all.push(mapOrderFromApi(item))
    }
    if (parsed.last || parsed.content.length === 0) break
    page += 1
    if (page > 10_000) break
  }
  return all
}

/** Página da tabela — mais recentes primeiro. */
export async function listOrdersPage(
  page: number,
  pageSize: number = ORDERS_PAGE_SIZE,
): Promise<OrdersPageMeta> {
  const raw = await getOrdersPageRaw(page, pageSize, SORT_ORDERS_NEWEST)
  return {
    content: raw.content.map(mapOrderFromApi),
    page: raw.number,
    pageSize: raw.size,
    totalPages: raw.totalPages,
    totalElements: raw.totalElements,
    first: raw.first,
    last: raw.last,
  }
}

/** Monta o corpo do PUT `/admin/pedido/completo/{id}` a partir de um pedido já carregado. */
export function buildPedidoCompletoInputFromOrder(
  order: Order,
  status: OrderStatus,
): OrderCreateValues {
  if (!order.clienteId?.trim()) {
    throw new Error('Pedido sem cliente')
  }
  if (!order.itens.length) {
    throw new Error('Pedido sem itens')
  }
  return {
    clienteId: order.clienteId,
    itens: order.itens.map((i) => ({
      produtoId: i.produtoId,
      quantidade: i.quantidade,
      precoUnitario: i.precoUnitario,
    })),
    status,
    modalidade: order.modalidade,
    canalAquisicao: order.canalAquisicao,
    observacao: order.observacao ?? '',
    valorFrete: order.valorFrete ?? 0,
    cupons: order.cupomCodigos ?? [],
  }
}

function payloadPedidoCompleto(input: OrderCreateValues): Record<string, unknown> {
  const clienteId = Number(input.clienteId)
  if (!Number.isFinite(clienteId)) {
    throw new Error('Cliente inválido')
  }
  return {
    origemPedido: mapCanalToOrigem(input.canalAquisicao),
    clienteId,
    observacao: (input.observacao ?? '').trim(),
    valorFrete: input.valorFrete ?? 0,
    status: mapStatusFrontendToApi(input.status),
    items: input.itens.map((i) => ({
      id: Number(i.produtoId),
      quantidade: i.quantidade,
    })),
    cupons: input.cupons ?? [],
  }
}

export async function createOrder(input: OrderCreateValues): Promise<Order> {
  const data = await postJson<unknown>(
    '/admin/pedido/completo',
    payloadPedidoCompleto(input),
  )
  return mapOrderFromApi(data)
}

export async function getOrder(id: string): Promise<Order> {
  const data = await getJson<unknown>(
    `/admin/pedido/${encodeURIComponent(id)}`,
  )
  return mapOrderFromApi(data)
}

/** Atualiza pedido com o mesmo corpo do POST `/admin/pedido/completo`. */
export async function updatePedidoCompleto(
  id: string,
  input: OrderCreateValues,
): Promise<Order> {
  const data = await putJson<unknown>(
    `/admin/pedido/completo/${encodeURIComponent(id)}`,
    payloadPedidoCompleto(input),
  )
  return mapOrderFromApi(data)
}

export async function updateOrder(
  id: string,
  patch: OrderUpdateValues,
): Promise<Order> {
  const body: Record<string, unknown> = {}
  if (patch.status !== undefined) {
    body.statusPedido = mapStatusFrontendToApi(patch.status)
  }
  if (patch.modalidade !== undefined) {
    body.modalidadePedido = mapModalidadeToApi(patch.modalidade)
  }
  if (patch.canalAquisicao !== undefined) {
    body.origemPedido = mapCanalToOrigem(patch.canalAquisicao)
  }
  if (patch.producaoIniciadaEm !== undefined) {
    body.producaoIniciadaEm = patch.producaoIniciadaEm ?? null
  }
  if (patch.producaoFinalizadaEm !== undefined) {
    body.producaoFinalizadaEm = patch.producaoFinalizadaEm ?? null
  }
  const data = await putJson<unknown>(
    `/admin/pedido/${encodeURIComponent(id)}`,
    body,
  )
  return mapOrderFromApi(data)
}
