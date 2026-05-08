import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { CouponFields } from '@/modules/orders/components/CouponFields'
import { useCreateCupomMutation } from '@/modules/orders/hooks/useCupons'
import {
  couponCreateSchema,
  type CouponCreateInput,
  type CouponCreateValues,
} from '@/schemas/coupon.schema'

type CouponCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CouponCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: CouponCreateDialogProps) {
  const create = useCreateCupomMutation()
  const form = useForm<CouponCreateInput, unknown, CouponCreateValues>({
    resolver: zodResolver(couponCreateSchema),
    defaultValues: {
      codigo: '',
      ativo: true,
      valorDesconto: 10,
      tipoDesconto: 'PERCENTUAL',
      dataValidade: '',
      quantidadeMinimaItens: 0,
      valorMinimoPedido: 0,
      limiteUsos: 0,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        codigo: '',
        ativo: true,
        valorDesconto: 10,
        tipoDesconto: 'PERCENTUAL',
        dataValidade: '',
        quantidadeMinimaItens: 0,
        valorMinimoPedido: 0,
        limiteUsos: 0,
      })
    }
  }, [open, form])

  async function onSubmit(values: CouponCreateValues) {
    await create.mutateAsync(values)
    onSuccess?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[min(90vh,800px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar cupom</DialogTitle>
          <DialogDescription>
            Cadastre um cupom para aplicar em pedidos.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 md:grid-cols-2"
          >
            <CouponFields control={form.control} />
            <DialogFooter className="col-span-full mt-2 gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Salvando…' : 'Salvar cupom'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
