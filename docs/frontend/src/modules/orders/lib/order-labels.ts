import type { CanalAquisicao, ModalidadePedido, OrderStatus } from '@/schemas/order.schema'
import type { TipoCliente } from '@/types'

export const canalAquisicaoLabel: Record<CanalAquisicao, string> = {
  site: 'Site',
  whatsapp: 'WhatsApp',
  rede_social: 'Rede social',
}

export const modalidadeLabel: Record<ModalidadePedido, string> = {
  pronta_entrega: 'Pronta-entrega',
  pre_venda: 'Pré-venda',
}

export const orderStatusLabel: Record<OrderStatus, string> = {
  rascunho: 'Rascunho',
  aguardando_pagamento: 'Aguardando pagamento',
  pagamento_confirmado: 'Pagamento confirmado',
  em_producao: 'Em produção',
  em_separacao: 'Em separação',
  aguardando_envio: 'Aguardando envio',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
  reembolsado: 'Reembolsado',
}

/** Ordem das colunas no quadro Kanban (fluxo aproximado). */
export const KANBAN_COLUMN_ORDER: readonly OrderStatus[] = [
  'rascunho',
  'aguardando_pagamento',
  'pagamento_confirmado',
  'em_producao',
  'em_separacao',
  'aguardando_envio',
  'enviado',
  'entregue',
  'cancelado',
  'reembolsado',
]

export const tipoClienteLabel: Record<TipoCliente, string> = {
  VAREJO: 'Varejo (B2C)',
  REVENDA: 'Revenda (B2B)',
}
