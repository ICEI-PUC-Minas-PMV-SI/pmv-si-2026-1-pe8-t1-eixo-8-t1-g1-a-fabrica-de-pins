/**
 * Cliente HTTP — baseURL em import.meta.env.VITE_API_URL
 */
import {
  clearStoredToken,
  getStoredToken,
} from '@/services/auth.storage'

const DEFAULT_BASE =
  import.meta.env.VITE_API_URL ??
  (() => {
    throw new Error('VITE_API_URL não configurada no ambiente.')
  })()

export function getApiBaseUrl(): string {
  return DEFAULT_BASE
}

export class ApiError extends Error {
  readonly status: number
  readonly body?: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${b}${p}`
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return undefined
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function messageFromBody(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null) {
    const o = body as Record<string, unknown>
    if (typeof o.message === 'string') return o.message
    if (typeof o.error === 'string') return o.error
    if (typeof o.title === 'string') return o.title
  }
  return fallback
}

function authHeaders(): HeadersInit {
  const t = getStoredToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

/** Remove token local se a API indicar não autorizado (evita estado preso). */
function onUnauthorized(status: number): void {
  if (status === 401) clearStoredToken()
}

type JsonInit = RequestInit & {
  json?: unknown
}

async function requestJson<T>(
  path: string,
  init: JsonInit,
): Promise<T> {
  const url = joinUrl(DEFAULT_BASE, path)
  const { json, headers: extraHeaders, ...rest } = init
  const headers: HeadersInit = {
    Accept: 'application/json',
    ...authHeaders(),
    ...extraHeaders,
  }
  if (json !== undefined) {
    ;(headers as Record<string, string>)['Content-Type'] = 'application/json'
  }
  const res = await fetch(url, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  })
  const body = await parseJsonSafe(res)
  if (!res.ok) {
    onUnauthorized(res.status)
    throw new ApiError(
      messageFromBody(body, res.statusText),
      res.status,
      body,
    )
  }
  return body as T
}

export async function getJson<T>(path: string): Promise<T> {
  return requestJson<T>(path, { method: 'GET' })
}

export async function postJson<T>(path: string, data: unknown): Promise<T> {
  return requestJson<T>(path, { method: 'POST', json: data })
}

export async function putJson<T>(path: string, data: unknown): Promise<T> {
  return requestJson<T>(path, { method: 'PUT', json: data })
}

export async function deleteJson<T = void>(path: string): Promise<T> {
  return requestJson<T>(path, { method: 'DELETE' })
}

/**
 * Login sem enviar Authorization (corpo JSON apenas).
 * Usa fetch direto para não acoplar token antigo.
 */
export async function postJsonPublic<T>(
  path: string,
  data: unknown,
): Promise<T> {
  const url = joinUrl(DEFAULT_BASE, path)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const body = await parseJsonSafe(res)
  if (!res.ok) {
    throw new ApiError(
      messageFromBody(body, res.statusText),
      res.status,
      body,
    )
  }
  return body as T
}
