import {
  FileSpreadsheet,
  LayoutGrid,
  Plus,
  Table as TableIcon,
  Ticket,
  Tickets,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

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
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CouponCreateDialog } from '@/modules/orders/components/CouponCreateDialog'
import { CouponsManageDialog } from '@/modules/orders/components/CouponsManageDialog'
import { OrderForm } from '@/modules/orders/components/OrderForm'
import { OrdersKanban } from '@/modules/orders/components/OrdersKanban'
import { OrdersTable } from '@/modules/orders/components/OrdersTable'
import {
  useOrdersPageQuery,
} from '@/modules/orders/hooks/useOrders'
import { useProductsQuery } from '@/modules/products/hooks/useProducts'
import { listOrders } from '@/services/orders.api'
import { exportOrdersToExcel } from '@/utils/exportOrdersExcel'

export function OrdersPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [couponCreateOpen, setCouponCreateOpen] = useState(false)
  const [couponsManageOpen, setCouponsManageOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [exporting, setExporting] = useState(false)
  const { data, isPending, isError, error, refetch } = useOrdersPageQuery(page)
  const { data: products, isPending: productsPending } = useProductsQuery()

  useEffect(() => {
    if (!data || data.totalPages === 0) return
    if (page > data.totalPages - 1) {
      setPage(Math.max(0, data.totalPages - 1))
    }
  }, [data, page])

  const nomePorProdutoId = useMemo(() => {
    const m = new Map<string, string>()
    products?.forEach((p) => m.set(p.id, p.nome))
    return m
  }, [products])

  async function handleExportExcel() {
    setExporting(true)
    try {
      const all = await listOrders()
      if (!all.length) return
      exportOrdersToExcel(all, nomePorProdutoId)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-row flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle>Pedidos</CardTitle>
              <CardDescription>
                Pedidos realizados pelos clientes.
              </CardDescription>
            </div>
            <Button
              type="button"
              className="gap-2"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Novo pedido
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={exporting || productsPending}
              onClick={() => void handleExportExcel()}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => setCouponCreateOpen(true)}
            >
              <Ticket className="h-4 w-4" />
              Criar cupom
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => setCouponsManageOpen(true)}
            >
              <Tickets className="h-4 w-4" />
              Gerenciar cupons
            </Button>
            <CouponCreateDialog
              open={couponCreateOpen}
              onOpenChange={setCouponCreateOpen}
            />
            <CouponsManageDialog
              open={couponsManageOpen}
              onOpenChange={setCouponsManageOpen}
            />
          </div>
        </CardHeader>
        <CardContent>
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
            <Tabs defaultValue="tabela" className="gap-4">
              <TabsList>
                <TabsTrigger value="tabela" className="gap-2">
                  <TableIcon className="h-4 w-4" />
                  Tabela
                </TabsTrigger>
                <TabsTrigger value="kanban" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Kanban
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tabela" className="flex flex-col gap-4">
                <OrdersTable
                  data={data.content}
                  onEdit={(o) => {
                    setEditingOrderId(o.id)
                    setEditOpen(true)
                  }}
                />
                <TablePaginationBar
                  pageIndex={data.page}
                  pageSize={data.pageSize}
                  totalPages={data.totalPages}
                  totalElements={data.totalElements}
                  rowCount={data.content.length}
                  isFirst={data.first}
                  isLast={data.last}
                  isPending={isPending}
                  emptyMessage="Nenhum pedido."
                  onPrev={() => setPage((p) => Math.max(0, p - 1))}
                  onNext={() => setPage((p) => p + 1)}
                />
              </TabsContent>

              <TabsContent value="kanban">
                <OrdersKanban
                  onEdit={(o) => {
                    setEditingOrderId(o.id)
                    setEditOpen(true)
                  }}
                />
              </TabsContent>
            </Tabs>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[min(90vh,900px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo pedido</DialogTitle>
            <DialogDescription>
              Cadastrar pedido.
            </DialogDescription>
          </DialogHeader>
          <OrderForm
            onSuccess={() => {
              setPage(0)
              setCreateOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setEditingOrderId(null)
        }}
      >
        <DialogContent className="max-w-3xl max-h-[min(90vh,900px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar pedido</DialogTitle>
            <DialogDescription>
              Alterar dados do pedido (carregados da API).
            </DialogDescription>
          </DialogHeader>
          {editingOrderId ? (
            <OrderForm
              mode="edit"
              orderId={editingOrderId}
              onSuccess={() => {
                setEditOpen(false)
                setEditingOrderId(null)
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
