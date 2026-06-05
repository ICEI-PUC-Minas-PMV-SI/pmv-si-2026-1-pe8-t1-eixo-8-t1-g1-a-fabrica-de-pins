import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { relatorioInvalidation } from '@/modules/reports/lib/report-query-keys'

import type { ProductFormValues, TipoEstoqueProduto } from '@/schemas/product.schema'
import {
  createProduct,
  getProduct,
  listProducts,
  listProductsPage,
  updateProduct,
} from '@/services/products.api'

/** Lista completa (pedidos, relatórios, selects). */
export function useProductsQuery() {
  return useQuery({
    queryKey: ['products', 'all'],
    queryFn: listProducts,
  })
}

/** Listagem paginada na tela de produtos. */
export function useProductsPageQuery(
  page: number,
  tipoEstoque?: TipoEstoqueProduto,
) {
  return useQuery({
    queryKey: ['products', 'page', page, tipoEstoque ?? 'all'],
    queryFn: () => listProductsPage(page, undefined, tipoEstoque),
    placeholderData: keepPreviousData,
  })
}

/** GET /produtos/{id} — formulário de edição (sempre refetch ao montar o formulário). */
export function useProductDetailQuery(productId: string | null) {
  return useQuery({
    queryKey: ['products', 'detail', productId],
    queryFn: () => getProduct(productId!),
    enabled: Boolean(productId),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useCreateProductMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductFormValues) => createProduct(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] })
      relatorioInvalidation.onProductChange(qc)
    },
  })
}

export function useUpdateProductMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: ProductFormValues
    }) => updateProduct(id, values),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: ['products'] })
      void qc.invalidateQueries({
        queryKey: ['products', 'detail', variables.id],
      })
      relatorioInvalidation.onProductChange(qc)
      void qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
