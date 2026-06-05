import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { relatorioInvalidation } from '@/modules/reports/lib/report-query-keys'

import type { OrderCreateValues, OrderUpdateValues } from '@/schemas/order.schema'
import {
  createOrder,
  getOrder,
  listOrders,
  listOrdersPage,
  updateOrder,
  updatePedidoCompleto,
} from '@/services/orders.api'

/** Lista completa (relatórios, exportação Excel). */
export function useOrdersQuery() {
  return useQuery({
    queryKey: ['orders', 'all'],
    queryFn: listOrders,
  })
}

/** Listagem paginada na tela de pedidos. */
export function useOrdersPageQuery(page: number) {
  return useQuery({
    queryKey: ['orders', 'page', page],
    queryFn: () => listOrdersPage(page),
    placeholderData: keepPreviousData,
  })
}

export function useCreateOrderMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: OrderCreateValues) => createOrder(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['orders'] })
      void qc.invalidateQueries({ queryKey: ['products'] })
      relatorioInvalidation.onOrderChange(qc)
    },
  })
}

export function useOrderQuery(orderId: string | null) {
  return useQuery({
    queryKey: ['orders', 'detail', orderId],
    queryFn: () => getOrder(orderId!),
    enabled: Boolean(orderId),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useUpdatePedidoCompletoMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: OrderCreateValues }) =>
      updatePedidoCompleto(id, input),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: ['orders'] })
      void qc.invalidateQueries({ queryKey: ['orders', 'detail', id] })
      void qc.invalidateQueries({ queryKey: ['products'] })
      relatorioInvalidation.onOrderChange(qc)
    },
  })
}

export function useUpdateOrderMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string
      patch: OrderUpdateValues
    }) => updateOrder(id, patch),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: ['orders'] })
      void qc.invalidateQueries({ queryKey: ['orders', 'detail', id] })
      relatorioInvalidation.onOrderChange(qc)
    },
  })
}
