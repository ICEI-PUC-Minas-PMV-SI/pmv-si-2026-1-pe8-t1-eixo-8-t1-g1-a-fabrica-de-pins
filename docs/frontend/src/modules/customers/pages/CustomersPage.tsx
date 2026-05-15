import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

import { TablePaginationBar } from '@/components/layout/TablePaginationBar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { CustomerForm } from '@/modules/customers/components/CustomerForm'
import { CustomerTable } from '@/modules/customers/components/CustomerTable'
import { useCustomersPageQuery } from '@/modules/customers/hooks/useCustomers'
import { tipoClienteLabel } from '@/modules/orders/lib/order-labels'
import type { Customer, TipoCliente } from '@/types'

export function CustomersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(
    null,
  )
  const [page, setPage] = useState(0)
  const [tipoClienteFiltro, setTipoClienteFiltro] = useState<
    'all' | TipoCliente
  >('all')
  const { data, isPending, isError, error, refetch } = useCustomersPageQuery(
    page,
    tipoClienteFiltro === 'all' ? undefined : tipoClienteFiltro,
  )

  useEffect(() => {
    setPage(0)
  }, [tipoClienteFiltro])

  useEffect(() => {
    if (!data || data.totalPages === 0) return
    if (page > data.totalPages - 1) {
      setPage(Math.max(0, data.totalPages - 1))
    }
  }, [data, page])

  function closeDialog() {
    setDialogOpen(false)
    setEditingCustomerId(null)
  }

  function openCreate() {
    setEditingCustomerId(null)
    setDialogOpen(true)
  }

  function openEdit(customer: Customer) {
    setEditingCustomerId(customer.id)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Clientes</CardTitle>
            <CardDescription>
              Listagem de clientes cadastrados.
            </CardDescription>
          </div>
          <Button
            type="button"
            className="shrink-0 gap-2"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" />
            Novo cliente
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex max-w-xs flex-col gap-2">
            <Label htmlFor="filtro-tipo-cliente">Tipo de cliente</Label>
            <Select
              value={tipoClienteFiltro}
              onValueChange={(v) =>
                setTipoClienteFiltro(v as 'all' | TipoCliente)
              }
            >
              <SelectTrigger id="filtro-tipo-cliente">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="VAREJO">{tipoClienteLabel.VAREJO}</SelectItem>
                <SelectItem value="REVENDA">
                  {tipoClienteLabel.REVENDA}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              <CustomerTable data={data.content} onEdit={openEdit} />
              <TablePaginationBar
                pageIndex={data.page}
                pageSize={data.pageSize}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                rowCount={data.content.length}
                isFirst={data.first}
                isLast={data.last}
                isPending={isPending}
                emptyMessage="Nenhum cliente."
                onPrev={() => setPage((p) => Math.max(0, p - 1))}
                onNext={() => setPage((p) => p + 1)}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingCustomerId(null)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCustomerId ? 'Editar cliente' : 'Novo cliente'}
            </DialogTitle>
            <DialogDescription>
              Cadastrar ou editar cliente.
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            editingCustomerId={editingCustomerId}
            onDoneEdit={closeDialog}
            onSuccessfulSubmit={() => {
              const wasCreate = editingCustomerId === null
              closeDialog()
              if (wasCreate) setPage(0)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
