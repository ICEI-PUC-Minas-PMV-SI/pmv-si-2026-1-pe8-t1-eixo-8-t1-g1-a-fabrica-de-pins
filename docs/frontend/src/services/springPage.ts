/** Parse de respostas `Page` / `PageImpl` do Spring Data. */

export function asRecord(x: unknown): Record<string, unknown> | null {
  return typeof x === 'object' && x !== null ? (x as Record<string, unknown>) : null
}

export function normalizeList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  const r = asRecord(data)
  if (r && Array.isArray(r.content)) return r.content
  return []
}

export type ParsedSpringPage = {
  content: unknown[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export function parseSpringPagePayload(data: unknown): ParsedSpringPage {
  const r = asRecord(data)
  if (!r) {
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      number: 0,
      size: 0,
      first: true,
      last: true,
    }
  }
  const content = Array.isArray(r.content) ? r.content : normalizeList(data)
  return {
    content,
    totalPages: Number(r.totalPages ?? 0),
    totalElements: Number(r.totalElements ?? content.length),
    number: Number(r.number ?? 0),
    size: Number(r.size ?? content.length),
    first: Boolean(r.first ?? content.length === 0),
    last: Boolean(r.last ?? content.length === 0),
  }
}

export type SpringPage<T> = {
  content: T[]
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
  first: boolean
  last: boolean
}

export const PAGE_SIZE_DEFAULT = 20

/** Ordem decrescente por id — últimos cadastrados primeiro (na API típica). */
export const SORT_NEWEST_FIRST = 'id,desc'

/** Tamanho ao percorrer todas as páginas no cliente (lista completa para selects/relatórios). */
export const FETCH_ALL_CHUNK_SIZE = 100
