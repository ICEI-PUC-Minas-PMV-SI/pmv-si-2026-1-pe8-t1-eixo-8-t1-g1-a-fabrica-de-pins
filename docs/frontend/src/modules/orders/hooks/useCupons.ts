import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CouponCreateValues } from '@/schemas/coupon.schema'
import type { Cupom } from '@/types'
import {
  createCupom,
  deleteCupom,
  listCupons,
  updateCupom,
} from '@/services/cupons.api'

export function useCuponsQuery() {
  return useQuery({
    queryKey: ['cupons'],
    queryFn: listCupons,
  })
}

export function useCreateCupomMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CouponCreateValues) => createCupom(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['cupons'] })
    },
  })
}

export function useUpdateCupomMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, cupom }: { id: string; cupom: Cupom }) =>
      updateCupom(id, cupom),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['cupons'] })
    },
  })
}

export function useDeleteCupomMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCupom(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['cupons'] })
    },
  })
}
