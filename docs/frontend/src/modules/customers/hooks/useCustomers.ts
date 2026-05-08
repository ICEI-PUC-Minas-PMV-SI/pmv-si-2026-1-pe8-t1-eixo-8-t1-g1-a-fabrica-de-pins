import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import type { CustomerFormValues } from '@/schemas/customer.schema'
import {
  createCustomer,
  getCustomer,
  listCustomers,
  listCustomersPage,
  updateCustomer,
} from '@/services/customers.api'

/** Lista completa (ex.: select em pedidos). */
export function useCustomersQuery() {
  return useQuery({
    queryKey: ['customers', 'all'],
    queryFn: listCustomers,
  })
}

/** Listagem paginada na tela de clientes (20 por página, mais recentes primeiro). */
export function useCustomersPageQuery(page: number) {
  return useQuery({
    queryKey: ['customers', 'page', page],
    queryFn: () => listCustomersPage(page),
    placeholderData: keepPreviousData,
  })
}

/** GET /clientes/{id} — formulário de edição. */
export function useCustomerDetailQuery(customerId: string | null) {
  return useQuery({
    queryKey: ['customers', 'detail', customerId],
    queryFn: () => getCustomer(customerId!),
    enabled: Boolean(customerId),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useCreateCustomerMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CustomerFormValues) => createCustomer(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['customers'] })
      void qc.invalidateQueries({ queryKey: ['report-snapshot'] })
    },
  })
}

export function useUpdateCustomerMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: CustomerFormValues
    }) => updateCustomer(id, values),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ['customers'] })
      void qc.invalidateQueries({ queryKey: ['customers', 'detail', id] })
      void qc.invalidateQueries({ queryKey: ['orders'] })
      void qc.invalidateQueries({ queryKey: ['report-snapshot'] })
    },
  })
}
