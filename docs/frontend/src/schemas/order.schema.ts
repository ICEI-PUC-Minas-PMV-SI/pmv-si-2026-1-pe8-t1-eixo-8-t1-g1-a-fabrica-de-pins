import { z } from 'zod'

export const orderStatusEnum = z.enum([
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
])

export type OrderStatus = z.infer<typeof orderStatusEnum>

export const canalAquisicaoEnum = z.enum(['site', 'whatsapp', 'rede_social'])

export type CanalAquisicao = z.infer<typeof canalAquisicaoEnum>

export const modalidadePedidoEnum = z.enum(['pronta_entrega', 'pre_venda'])

export type ModalidadePedido = z.infer<typeof modalidadePedidoEnum>

export const orderItemSchema = z.object({
  produtoId: z.string().min(1),
  quantidade: z.coerce.number().int().positive(),
  precoUnitario: z.coerce.number().positive(),
})

export const orderCreateSchema = z.object({
  clienteId: z.string().min(1, 'Selecione o cliente'),
  itens: z.array(orderItemSchema).min(1, 'Adicione pelo menos um item'),
  status: orderStatusEnum.default('rascunho'),
  canalAquisicao: canalAquisicaoEnum.default('site'),
  observacao: z.string().optional().default(''),
  valorFrete: z.coerce.number().min(0).default(0),
  cupons: z.array(z.string()).default([]),
})

export type OrderCreateInput = z.input<typeof orderCreateSchema>
export type OrderCreateValues = z.infer<typeof orderCreateSchema>

/** Edição: cliente não pode ser alterado — validação só dos demais campos. */
export const orderEditSchema = orderCreateSchema.omit({ clienteId: true })

export type OrderEditInput = z.input<typeof orderEditSchema>
export type OrderEditValues = z.infer<typeof orderEditSchema>

export const orderUpdateSchema = z.object({
  status: orderStatusEnum.optional(),
  modalidade: modalidadePedidoEnum.optional(),
  canalAquisicao: canalAquisicaoEnum.optional(),
  producaoIniciadaEm: z.union([z.string(), z.null()]).optional(),
  producaoFinalizadaEm: z.union([z.string(), z.null()]).optional(),
})

export type OrderUpdateValues = z.infer<typeof orderUpdateSchema>
