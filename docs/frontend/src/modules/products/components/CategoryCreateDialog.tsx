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
import { CategoryFields } from '@/modules/products/components/CategoryFields'
import { useCreateCategoryMutation } from '@/modules/products/hooks/useCategories'
import {
  categoryFormSchema,
  type CategoryFormInput,
  type CategoryFormValues,
} from '@/schemas/category.schema'

type CategoryCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CategoryCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: CategoryCreateDialogProps) {
  const create = useCreateCategoryMutation()
  const form = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      ativa: true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        nome: '',
        descricao: '',
        ativa: true,
      })
    }
  }, [open, form])

  async function onSubmit(values: CategoryFormValues) {
    await create.mutateAsync(values)
    onSuccess?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar categoria</DialogTitle>
          <DialogDescription>
            Cadastre uma nova categoria de produto.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
          >
            <CategoryFields control={form.control} />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Salvando…' : 'Salvar categoria'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
