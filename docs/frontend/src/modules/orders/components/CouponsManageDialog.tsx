import { useEffect, useMemo, useState } from 'react'

import { TablePaginationBar } from '@/components/layout/TablePaginationBar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useCuponsQuery,
  useDeleteCupomMutation,
  useUpdateCupomMutation,
} from '@/modules/orders/hooks/useCupons'
import type { Cupom } from '@/types'
import { formatCurrencyBRL } from '@/utils/format'

const PAGE_SIZE = 15

type CouponsManageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CouponsManageDialog({
  open,
  onOpenChange,
}: CouponsManageDialogProps) {
  const [page, setPage] = useState(0)
  const { data, isPending, isError, error, refetch } = useCuponsQuery()

  const sorted = useMemo(() => {
    if (!data?.length) return []
    return [...data].sort((a, b) => a.codigo.localeCompare(b.codigo))
  }, [data])

  const totalElements = sorted.length
  const totalPages =
    totalElements === 0 ? 0 : Math.ceil(totalElements / PAGE_SIZE)

  const pageSlice = useMemo(() => {
    const start = page * PAGE_SIZE
    return sorted.slice(start, start + PAGE_SIZE)
  }, [sorted, page])

  useEffect(() => {
    if (totalPages === 0) return
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1))
    }
  }, [page, totalPages])

  useEffect(() => {
    if (!open) setPage(0)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col gap-4 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Cupons</DialogTitle>
          <DialogDescription>
            Cupons cadastrados na API. Use-os ao criar um pedido.
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
                      <TableHead>Código</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Desconto</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead className="text-right">Mín. itens</TableHead>
                      <TableHead className="text-right">Mín. pedido</TableHead>
                      <TableHead className="text-right">Limite usos</TableHead>
                      <TableHead className="w-[200px]">
                        <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageSlice.length ? (
                      pageSlice.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.codigo}</TableCell>
                          <TableCell>{c.ativo ? 'Sim' : 'Não'}</TableCell>
                          <TableCell>
                            {c.tipoDesconto === 'PERCENTUAL' ? '%' : 'R$'}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {c.tipoDesconto === 'PERCENTUAL'
                              ? `${c.valorDesconto}%`
                              : formatCurrencyBRL(c.valorDesconto)}
                          </TableCell>
                          <TableCell>{c.dataValidade || '—'}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {c.quantidadeMinimaItens}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrencyBRL(c.valorMinimoPedido)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {c.limiteUsos}
                          </TableCell>
                          <TableCell className="text-right">
                            <CupomRowActions cupom={c} />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Nenhum cupom.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <TablePaginationBar
                pageIndex={page}
                pageSize={PAGE_SIZE}
                totalPages={totalPages}
                totalElements={totalElements}
                rowCount={pageSlice.length}
                isFirst={page === 0 || totalElements === 0}
                isLast={totalPages === 0 ? true : page >= totalPages - 1}
                isPending={isPending}
                emptyMessage="Nenhum cupom."
                onPrev={() => setPage((p) => Math.max(0, p - 1))}
                onNext={() => setPage((p) => p + 1)}
              />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CupomRowActions({ cupom }: { cupom: Cupom }) {
  const update = useUpdateCupomMutation()
  const del = useDeleteCupomMutation()

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={update.isPending}
        onClick={() => {
          void update.mutateAsync({
            id: cupom.id,
            cupom: { ...cupom, ativo: !cupom.ativo },
          })
        }}
      >
        {cupom.ativo ? 'Desativar' : 'Ativar'}
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={del.isPending}
        onClick={() => {
          if (
            !window.confirm(
              `Excluir o cupom "${cupom.codigo}"? Esta ação não pode ser desfeita.`,
            )
          ) {
            return
          }
          void del.mutateAsync(cupom.id)
        }}
      >
        Excluir
      </Button>
    </div>
  )
}
