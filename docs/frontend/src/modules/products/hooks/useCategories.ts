import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import type { CategoryFormValues } from '@/schemas/category.schema'
import {
  createCategory,
  deleteCategory,
  listCategories,
  listCategoriesPage,
  updateCategory,
} from '@/services/categories.api'

export function useCategoriesPageQuery(page: number) {
  return useQuery({
    queryKey: ['categories', 'page', page],
    queryFn: () => listCategoriesPage(page),
    placeholderData: keepPreviousData,
  })
}

/**
 * Lista completa de categorias para selects/relatórios. Cache compartilhado
 * (5 min) para evitar várias chamadas paginadas em paralelo quando múltiplos
 * componentes/queries dependem do nome→id da categoria.
 */
export function useAllCategoriesQuery() {
  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: listCategories,
    staleTime: 5 * 60_000,
  })
}

export function useCreateCategoryMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CategoryFormValues) => createCategory(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategoryMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryFormValues }) =>
      updateCategory(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteCategoryMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
