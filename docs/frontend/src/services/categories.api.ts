import type { CategoryFormValues } from '@/schemas/category.schema'
import type { Category } from '@/types'
import { deleteJson, getJson, postJson, putJson } from '@/services/http'
import {
  FETCH_ALL_CHUNK_SIZE,
  PAGE_SIZE_DEFAULT,
  type SpringPage,
  SORT_NEWEST_FIRST,
  parseSpringPagePayload,
  asRecord,
} from '@/services/springPage'

export type CategoriesPageMeta = SpringPage<Category>

export const CATEGORIES_PAGE_SIZE = PAGE_SIZE_DEFAULT

function idStr(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

export function mapCategory(raw: unknown): Category {
  const o = asRecord(raw)
  if (!o) throw new Error('Resposta de categoria inválida')
  return {
    id: idStr(o.id),
    nome: String(o.nome ?? ''),
    descricao: String(o.descricao ?? ''),
    ativa: Boolean(o.ativa ?? true),
  }
}

function payloadFromForm(v: CategoryFormValues): Record<string, unknown> {
  return {
    nome: v.nome,
    descricao: v.descricao,
    ativa: v.ativa,
  }
}

async function getCategoriesPageRaw(
  page: number,
  pageSize: number,
  sort: string,
) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(pageSize),
    sort,
  })
  const data = await getJson<unknown>(`/categorias?${params.toString()}`)
  return parseSpringPagePayload(data)
}

/**
 * Lista completa — percorre todas as páginas da API.
 */
export async function listCategories(): Promise<Category[]> {
  const all: Category[] = []
  let page = 0
  for (;;) {
    const raw = await getCategoriesPageRaw(
      page,
      FETCH_ALL_CHUNK_SIZE,
      SORT_NEWEST_FIRST,
    )
    for (const item of raw.content) {
      all.push(mapCategory(item))
    }
    if (raw.last || raw.content.length === 0) break
    page += 1
    if (page > 10_000) break
  }
  return all
}

export async function listCategoriesPage(
  page: number,
  pageSize: number = CATEGORIES_PAGE_SIZE,
): Promise<CategoriesPageMeta> {
  const raw = await getCategoriesPageRaw(page, pageSize, SORT_NEWEST_FIRST)
  return {
    content: raw.content.map(mapCategory),
    page: raw.number,
    pageSize: raw.size,
    totalPages: raw.totalPages,
    totalElements: raw.totalElements,
    first: raw.first,
    last: raw.last,
  }
}

export async function getCategory(id: string): Promise<Category> {
  const data = await getJson<unknown>(
    `/categorias/${encodeURIComponent(id)}`,
  )
  return mapCategory(data)
}

export async function createCategory(
  input: CategoryFormValues,
): Promise<Category> {
  const data = await postJson<unknown>('/categorias', payloadFromForm(input))
  return mapCategory(data)
}

export async function updateCategory(
  id: string,
  input: CategoryFormValues,
): Promise<Category> {
  const data = await putJson<unknown>(
    `/categorias/${encodeURIComponent(id)}`,
    payloadFromForm(input),
  )
  return mapCategory(data)
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteJson(`/categorias/${encodeURIComponent(id)}`)
}
