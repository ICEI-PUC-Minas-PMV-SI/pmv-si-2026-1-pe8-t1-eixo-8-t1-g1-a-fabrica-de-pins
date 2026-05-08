import type { ProductFormValues } from '@/schemas/product.schema'
import type { Product } from '@/types'
import { getJson, postJson, putJson } from '@/services/http'
import {
  FETCH_ALL_CHUNK_SIZE,
  PAGE_SIZE_DEFAULT,
  type SpringPage,
  SORT_NEWEST_FIRST,
  parseSpringPagePayload,
  asRecord,
} from '@/services/springPage'

export type ProductsPageMeta = SpringPage<Product>

export const PRODUCTS_PAGE_SIZE = PAGE_SIZE_DEFAULT

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

function mapProduct(raw: unknown): Product {
  const o = asRecord(raw)
  if (!o) throw new Error('Resposta de produto inválida')
  const cat = asRecord(o.categoria)
  const categoriaNomeRaw =
    (cat && typeof cat.nome === 'string' ? cat.nome : undefined) ??
    (typeof o.categoriaNome === 'string' ? o.categoriaNome : undefined)
  const categoriaNome =
    categoriaNomeRaw && categoriaNomeRaw.trim().length > 0
      ? categoriaNomeRaw
      : `Categoria #${idStr(o.categoriaId)}`
  const precoVarejo = num(o.precoVarejo)
  const qtd = Math.floor(num(o.quantidadeEstoque))
  return {
    id: idStr(o.id),
    nome: String(o.nome ?? ''),
    descricao: String(o.descricao ?? ''),
    tipoEstoque: String(o.tipoEstoque ?? 'ESTOQUE'),
    quantidadeEstoque: qtd,
    estoqueMinimo: Math.floor(num(o.estoqueMinimo)),
    precoVarejo,
    precoRevenda: num(o.precoRevenda),
    custoProducao: num(o.custoProducao),
    dataPrevistaLancamento: String(o.dataPrevistaLancamento ?? ''),
    sku: String(o.sku ?? ''),
    imgUrl: String(o.imgUrl ?? ''),
    peso: Math.floor(num(o.peso)),
    altura: Math.floor(num(o.altura)),
    largura: Math.floor(num(o.largura)),
    comprimento: Math.floor(num(o.comprimento)),
    ativo: Boolean(o.ativo ?? true),
    categoriaId: Math.floor(
      num(
        o.categoriaId !== undefined && o.categoriaId !== null
          ? o.categoriaId
          : cat?.id,
      ),
    ),
    categoria: categoriaNome,
    preco: precoVarejo,
    estoque: qtd,
  }
}

function payloadFromForm(v: ProductFormValues): Record<string, unknown> {
  return {
    nome: v.nome,
    descricao: v.descricao,
    tipoEstoque: v.tipoEstoque,
    quantidadeEstoque: v.quantidadeEstoque,
    estoqueMinimo: v.estoqueMinimo,
    precoVarejo: v.precoVarejo,
    precoRevenda: v.precoRevenda,
    custoProducao: v.custoProducao,
    dataPrevistaLancamento: v.dataPrevistaLancamento,
    sku: v.sku,
    imgUrl: v.imgUrl,
    peso: v.peso,
    altura: v.altura,
    largura: v.largura,
    comprimento: v.comprimento,
    ativo: v.ativo,
    categoriaId: v.categoriaId,
  }
}

async function getProductsPageRaw(page: number, pageSize: number, sort: string) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(pageSize),
    sort,
  })
  const data = await getJson<unknown>(`/produtos?${params.toString()}`)
  return parseSpringPagePayload(data)
}

/**
 * Lista completa (selects, relatórios, estoque) — percorre todas as páginas da API.
 */
export async function listProducts(): Promise<Product[]> {
  const all: Product[] = []
  let page = 0
  for (;;) {
    const raw = await getProductsPageRaw(page, FETCH_ALL_CHUNK_SIZE, SORT_NEWEST_FIRST)
    for (const item of raw.content) {
      all.push(mapProduct(item))
    }
    if (raw.last || raw.content.length === 0) break
    page += 1
    if (page > 10_000) break
  }
  return all
}

/** Uma página da listagem (20 itens, mais recentes primeiro). */
export async function listProductsPage(
  page: number,
  pageSize: number = PRODUCTS_PAGE_SIZE,
): Promise<ProductsPageMeta> {
  const raw = await getProductsPageRaw(page, pageSize, SORT_NEWEST_FIRST)
  return {
    content: raw.content.map(mapProduct),
    page: raw.number,
    pageSize: raw.size,
    totalPages: raw.totalPages,
    totalElements: raw.totalElements,
    first: raw.first,
    last: raw.last,
  }
}

export async function getProduct(id: string): Promise<Product> {
  const data = await getJson<unknown>(`/produtos/${encodeURIComponent(id)}`)
  return mapProduct(data)
}

export async function createProduct(input: ProductFormValues): Promise<Product> {
  const data = await postJson<unknown>('/produtos', payloadFromForm(input))
  return mapProduct(data)
}

/**
 * PUT /produtos/{id} — corpo só com os campos do formulário (mesmo shape do POST).
 */
export async function updateProduct(
  id: string,
  input: ProductFormValues,
): Promise<Product> {
  const data = await putJson<unknown>(
    `/produtos/${encodeURIComponent(id)}`,
    payloadFromForm(input),
  )
  return mapProduct(data)
}

/** Itens agregados por produto (várias linhas do mesmo produto viram uma soma). */
export function aggregateItemsByProduct(
  itens: { produtoId: string; quantidade: number }[],
): { produtoId: string; quantidade: number }[] {
  const map = new Map<string, number>()
  for (const i of itens) {
    map.set(i.produtoId, (map.get(i.produtoId) ?? 0) + i.quantidade)
  }
  return [...map.entries()].map(([produtoId, quantidade]) => ({
    produtoId,
    quantidade,
  }))
}

async function mutateStockForItems(
  itens: { produtoId: string; quantidade: number }[],
  direction: 1 | -1,
): Promise<void> {
  const aggregated = aggregateItemsByProduct(itens)
  if (direction === -1) {
    for (const item of aggregated) {
      const p = await getProduct(item.produtoId)
      if (p.quantidadeEstoque < item.quantidade) {
        throw new Error(
          `Estoque insuficiente para "${p.nome}". Disponível: ${p.quantidadeEstoque}, pedido: ${item.quantidade}.`,
        )
      }
    }
  }
  for (const item of aggregated) {
    const raw = await getJson<Record<string, unknown>>(
      `/produtos/${encodeURIComponent(item.produtoId)}`,
    )
    const cur = Math.floor(num(raw.quantidadeEstoque))
    const next = cur + direction * item.quantidade
    if (next < 0) {
      throw new Error('Estoque não pode ficar negativo.')
    }
    await putJson(`/produtos/${encodeURIComponent(item.produtoId)}`, {
      ...raw,
      quantidadeEstoque: next,
    })
  }
}

export async function deductStockForOrderItems(
  itens: { produtoId: string; quantidade: number }[],
): Promise<void> {
  await mutateStockForItems(itens, -1)
}

export async function restoreStockForOrderItems(
  itens: { produtoId: string; quantidade: number }[],
): Promise<void> {
  await mutateStockForItems(itens, 1)
}

export async function updateProductEstoque(
  productId: string,
  estoque: number,
): Promise<Product> {
  const raw = await getJson<Record<string, unknown>>(
    `/produtos/${encodeURIComponent(productId)}`,
  )
  const data = await putJson<unknown>(
    `/produtos/${encodeURIComponent(productId)}`,
    {
      ...raw,
      quantidadeEstoque: Math.floor(estoque),
    },
  )
  return mapProduct(data)
}
