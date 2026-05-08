import type { CouponCreateValues } from '@/schemas/coupon.schema'
import type { Cupom, TipoDescontoCupom } from '@/types'
import { deleteJson, getJson, postJson, putJson } from '@/services/http'
import { asRecord, normalizeList } from '@/services/springPage'

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

function mapTipoDesconto(raw: unknown): TipoDescontoCupom {
  const u = String(raw ?? '').toUpperCase()
  return u === 'FIXO' ? 'FIXO' : 'PERCENTUAL'
}

export function mapCupom(raw: unknown): Cupom {
  const o = asRecord(raw)
  if (!o) throw new Error('Resposta de cupom inválida')
  return {
    id: idStr(o.id),
    codigo: String(o.codigo ?? ''),
    ativo: Boolean(o.ativo ?? true),
    valorDesconto: num(o.valorDesconto),
    tipoDesconto: mapTipoDesconto(o.tipoDesconto),
    dataValidade: String(o.dataValidade ?? ''),
    quantidadeMinimaItens: Math.floor(num(o.quantidadeMinimaItens)),
    valorMinimoPedido: num(o.valorMinimoPedido),
    limiteUsos: Math.floor(num(o.limiteUsos)),
  }
}

function payloadFromCreate(v: CouponCreateValues): Record<string, unknown> {
  return {
    codigo: v.codigo.trim().toUpperCase(),
    ativo: v.ativo,
    valorDesconto: v.valorDesconto,
    tipoDesconto: v.tipoDesconto,
    dataValidade: v.dataValidade,
    quantidadeMinimaItens: v.quantidadeMinimaItens,
    valorMinimoPedido: v.valorMinimoPedido,
    limiteUsos: v.limiteUsos,
  }
}

function payloadFromCupom(c: Cupom): Record<string, unknown> {
  return {
    codigo: c.codigo.trim().toUpperCase(),
    ativo: c.ativo,
    valorDesconto: c.valorDesconto,
    tipoDesconto: c.tipoDesconto,
    dataValidade: c.dataValidade,
    quantidadeMinimaItens: c.quantidadeMinimaItens,
    valorMinimoPedido: c.valorMinimoPedido,
    limiteUsos: c.limiteUsos,
  }
}

/** Lista simples retornada pela API (sem paginação no servidor). */
export async function listCupons(): Promise<Cupom[]> {
  const data = await getJson<unknown>('/cupons')
  const list = Array.isArray(data) ? data : normalizeList(data)
  return list.map(mapCupom)
}

export async function createCupom(input: CouponCreateValues): Promise<Cupom> {
  const data = await postJson<unknown>('/cupons', payloadFromCreate(input))
  return mapCupom(data)
}

/** Atualiza cupom (ex.: alterar `ativo`). Corpo no mesmo formato do POST. */
export async function updateCupom(id: string, cupom: Cupom): Promise<Cupom> {
  const data = await putJson<unknown>(
    `/cupons/${encodeURIComponent(id)}`,
    payloadFromCupom(cupom),
  )
  return mapCupom(data)
}

export async function deleteCupom(id: string): Promise<void> {
  await deleteJson(`/cupons/${encodeURIComponent(id)}`)
}
