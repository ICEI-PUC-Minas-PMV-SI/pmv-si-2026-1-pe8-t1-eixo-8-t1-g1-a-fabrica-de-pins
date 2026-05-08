import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { TablePaginationBar } from '@/components/layout/TablePaginationBar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Form } from '@/components/ui/form'
import { LoadingState } from '@/components/feedback/LoadingState'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CategoryFields } from '@/modules/products/components/CategoryFields'
import {
  useCategoriesPageQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '@/modules/products/hooks/useCategories'
import {
  categoryFormSchema,
  type CategoryFormInput,
  type CategoryFormValues,
} from '@/schemas/category.schema'
import type { Category } from '@/types'

type CategoriesManageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoriesManageDialog({
  open,
  onOpenChange,
}: CategoriesManageDialogProps) {
  const [page, setPage] = useState(0)
  const [editing, setEditing] = useState<Category | null>(null)

  const { data, isPending, isError, error, refetch } =
    useCategoriesPageQuery(page)

  useEffect(() => {
    if (!data || data.totalPages === 0) return
    if (page > data.totalPages - 1) {
      setPage(Math.max(0, data.totalPages - 1))
    }
  }, [data, page])

  useEffect(() => {
    if (!open) {
      setPage(0)
      setEditing(null)
    }
  }, [open])

  return (
    <>
      <CategoryEditDialog
        category={editing}
        open={editing !== null}
        onOpenChange={(v) => {
          if (!v) setEditing(null)
        }}
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-4 overflow-hidden">
          <DialogHeader>
            <DialogTitle>Categorias</DialogTitle>
            <DialogDescription>
              Lista, edição e exclusão de categorias cadastradas.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {isPending ? <LoadingState rows={5} /> : null}
            {isError ? (
              <ErrorState
                message={
                  error instanceof Error ? error.message : 'Erro ao carregar'
                }
                onRetry={() => void refetch()}
              />
            ) : null}
            {!isPending && !isError && data ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="w-[100px]">Ativa</TableHead>
                        <TableHead className="w-[180px]">
                          <span className="sr-only">Ações</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.content.length ? (
                        data.content.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.nome}</TableCell>
                            <TableCell className="max-w-[200px] truncate text-muted-foreground">
                              {c.descricao}
                            </TableCell>
                            <TableCell>{c.ativa ? 'Sim' : 'Não'}</TableCell>
                            <TableCell className="space-x-2 text-right">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setEditing(c)}
                              >
                                Editar
                              </Button>
                              <DeleteCategoryButton category={c} />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Nenhuma categoria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <TablePaginationBar
                  pageIndex={data.page}
                  pageSize={data.pageSize}
                  totalPages={data.totalPages}
                  totalElements={data.totalElements}
                  rowCount={data.content.length}
                  isFirst={data.first}
                  isLast={data.last}
                  isPending={isPending}
                  emptyMessage="Nenhuma categoria."
                  onPrev={() => setPage((p) => Math.max(0, p - 1))}
                  onNext={() => setPage((p) => p + 1)}
                />
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function DeleteCategoryButton({ category }: { category: Category }) {
  const del = useDeleteCategoryMutation()
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={del.isPending}
      onClick={() => {
        if (
          !window.confirm(
            `Excluir a categoria "${category.nome}"? Esta ação não pode ser desfeita.`,
          )
        ) {
          return
        }
        void del.mutateAsync(category.id)
      }}
    >
      Excluir
    </Button>
  )
}

function CategoryEditDialog({
  category,
  open,
  onOpenChange,
}: {
  category: Category | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const update = useUpdateCategoryMutation()
  const form = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      ativa: true,
    },
  })

  useEffect(() => {
    if (category && open) {
      form.reset({
        nome: category.nome,
        descricao: category.descricao,
        ativa: category.ativa,
      })
    }
  }, [category, open, form])

  async function onSubmit(values: CategoryFormValues) {
    if (!category) return
    await update.mutateAsync({ id: category.id, input: values })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar categoria</DialogTitle>
          <DialogDescription>Alterar nome, descrição ou status.</DialogDescription>
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
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
