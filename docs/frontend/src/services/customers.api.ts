import type { CustomerFormValues } from '@/schemas/customer.schema'
import type { Customer, CustomerEndereco, TipoCliente, TipoPessoa } from '@/types'
import { deleteJson, getJson, postJson, putJson } from '@/services/http'
import {
  FETCH_ALL_CHUNK_SIZE,
  PAGE_SIZE_DEFAULT,
  type SpringPage,
  SORT_NEWEST_FIRST,
  parseSpringPagePayload,
  asRecord,
} from '@/services/springPage'

/** Resposta paginada na listagem de clientes. */
export type CustomersPageMeta = SpringPage<Customer>

export const CUSTOMERS_PAGE_SIZE = PAGE_SIZE_DEFAULT

async function getCustomersPageRaw(
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
    `/clientes?${params.toString()}`,
  )
  return parseSpringPagePayload(data)
}

function idStr(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

function digits(v: string): string {
  return v.replace(/\D/g, '')
}

function enumInput(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>
    const preferredKeys = [
      'value',
      'codigo',
      'code',
      'tipo',
      'nome',
      'descricao',
      'label',
    ] as const
    for (const k of preferredKeys) {
      const v = o[k]
      if (typeof v === 'string') return v
    }
    for (const v of Object.values(o)) {
      if (typeof v === 'string') return v
    }
  }
  return ''
}

function enumToken(raw: unknown): string {
  return enumInput(raw)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
}

function normalizeTipoCliente(raw: unknown): TipoCliente {
  const v = enumToken(raw)
  return v === 'REVENDA' ? 'REVENDA' : 'VAREJO'
}

function normalizeTipoPessoa(raw: unknown): TipoPessoa {
  const v = enumToken(raw)
  return v.startsWith('JURIDIC') ? 'JURIDICA' : 'FISICA'
}

function mapEndereco(raw: unknown): CustomerEndereco | null {
  const o = asRecord(raw)
  if (!o) return null
  return {
    cep: digits(String(o.cep ?? '')),
    estado: String(o.estado ?? ''),
    cidade: String(o.cidade ?? ''),
    bairro: String(o.bairro ?? ''),
    logradouro: String(o.logradouro ?? ''),
    numero: String(o.numero ?? ''),
    complemento: o.complemento !== undefined ? String(o.complemento) : undefined,
    pontoReferencia:
      o.pontoReferencia !== undefined ? String(o.pontoReferencia) : undefined,
    observacoes: o.observacoes !== undefined ? String(o.observacoes) : undefined,
    enderecoPrincipal: Boolean(o.enderecoPrincipal),
    tipoEndereco: String(o.tipoEndereco ?? 'ENTREGA'),
    apelido: o.apelido !== undefined ? String(o.apelido) : undefined,
  }
}

function mapCustomer(raw: unknown): Customer {
  const o = asRecord(raw)
  if (!o) {
    throw new Error('Resposta de cliente inválida')
  }
  const endList = Array.isArray(o.enderecos)
    ? o.enderecos.map(mapEndereco).filter(Boolean) as CustomerEndereco[]
    : []
  return {
    id: idStr(o.id),
    nome: String(o.nome ?? ''),
    email: String(o.email ?? ''),
    telefone: digits(String(o.telefone ?? '')),
    tipoCliente: normalizeTipoCliente(o.tipoCliente),
    tipoPessoa: normalizeTipoPessoa(o.tipoPessoa),
    documento: digits(String(o.numeroDocumento ?? o.documento ?? '')),
    ativo: Boolean(o.ativo ?? true),
    enderecos:
      endList.length > 0
        ? endList
        : [
            {
              cep: '',
              estado: '',
              cidade: '',
              bairro: '',
              logradouro: '',
              numero: '',
              enderecoPrincipal: true,
              tipoEndereco: 'ENTREGA',
            },
          ],
  }
}

function payloadFromForm(v: CustomerFormValues): Record<string, unknown> {
  const e = v.endereco
  return {
    nome: v.nome,
    email: v.email,
    telefone: digits(v.telefone),
    tipoCliente: v.tipoCliente,
    tipoPessoa: v.tipoPessoa,
    numeroDocumento: digits(v.documento),
    ativo: v.ativo,
    enderecos: [
      {
        cep: digits(e.cep),
        estado: e.estado,
        cidade: e.cidade,
        bairro: e.bairro,
        logradouro: e.logradouro,
        numero: e.numero,
        complemento: e.complemento,
        pontoReferencia: e.pontoReferencia,
        observacoes: e.observacoes,
        enderecoPrincipal: e.enderecoPrincipal,
        tipoEndereco: e.tipoEndereco,
        apelido: e.apelido,
      },
    ],
  }
}

/**
 * Lista usada em telas que precisam de todos os clientes (ex.: select no pedido).
 * Percorre todas as páginas da API.
 */
export async function listCustomers(): Promise<Customer[]> {
  const all: Customer[] = []
  let page = 0
  for (;;) {
    const raw = await getCustomersPageRaw(
      page,
      FETCH_ALL_CHUNK_SIZE,
      SORT_NEWEST_FIRST,
    )
    for (const item of raw.content) {
      all.push(mapCustomer(item))
    }
    if (raw.last || raw.content.length === 0) break
    page += 1
    if (page > 10_000) break
  }
  return all
}

/** Uma página da listagem (20 itens, mais recentes primeiro). */
export async function listCustomersPage(
  page: number,
  pageSize: number = CUSTOMERS_PAGE_SIZE,
): Promise<CustomersPageMeta> {
  const raw = await getCustomersPageRaw(page, pageSize, SORT_NEWEST_FIRST)
  return {
    content: raw.content.map(mapCustomer),
    page: raw.number,
    pageSize: raw.size,
    totalPages: raw.totalPages,
    totalElements: raw.totalElements,
    first: raw.first,
    last: raw.last,
  }
}

export async function getCustomer(id: string): Promise<Customer> {
  const data = await getJson<unknown>(`/clientes/${encodeURIComponent(id)}`)
  return mapCustomer(data)
}

export async function createCustomer(
  input: CustomerFormValues,
): Promise<Customer> {
  const data = await postJson<unknown>('/clientes', payloadFromForm(input))
  return mapCustomer(data)
}

export async function updateCustomer(
  id: string,
  input: CustomerFormValues,
): Promise<Customer> {
  const data = await putJson<unknown>(
    `/clientes/${encodeURIComponent(id)}`,
    payloadFromForm(input),
  )
  return mapCustomer(data)
}

export async function deleteCustomer(id: string): Promise<void> {
  await deleteJson(`/clientes/${encodeURIComponent(id)}`)
}
