import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import type { ProductFormValues } from '@/schemas/product.schema'
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
export function useProductsPageQuery(page: number) {
  return useQuery({
    queryKey: ['products', 'page', page],
    queryFn: () => listProductsPage(page),
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
      void qc.invalidateQueries({ queryKey: ['report-snapshot'] })
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
      void qc.invalidateQueries({ queryKey: ['report-snapshot'] })
      void qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
