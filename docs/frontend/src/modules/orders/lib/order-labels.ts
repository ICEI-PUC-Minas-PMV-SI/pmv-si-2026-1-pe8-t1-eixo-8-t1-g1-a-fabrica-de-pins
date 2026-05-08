import type { CanalAquisicao, ModalidadePedido, OrderStatus } from '@/schemas/order.schema'

export const canalAquisicaoLabel: Record<CanalAquisicao, string> = {
  instagram: 'Instagram',
  site: 'Site',
  marketplace: 'Marketplace',
  loja: 'Loja',
  indicacao: 'Indicação',
  outro: 'Outro',
}

export const modalidadeLabel: Record<ModalidadePedido, string> = {
  pronta_entrega: 'Pronta-entrega',
  pre_venda: 'Pré-venda',
}

export const orderStatusLabel: Record<OrderStatus, string> = {
  rascunho: 'Rascunho',
  confirmado: 'Confirmado',
  enviado: 'Enviado',
  cancelado: 'Cancelado',
}
