import { Columns3 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Label } from '@/components/ui/label'
import {
  useOrdersQuery,
  useUpdatePedidoCompletoMutation,
} from '@/modules/orders/hooks/useOrders'
import {
  KANBAN_COLUMN_ORDER,
  modalidadeLabel,
  orderStatusLabel,
} from '@/modules/orders/lib/order-labels'
import type { OrderStatus } from '@/schemas/order.schema'
import {
  buildPedidoCompletoInputFromOrder,
  getOrder,
} from '@/services/orders.api'
import type { Order } from '@/types'
import { cn } from '@/utils/cn'
import { formatCurrencyBRL, formatDateBR } from '@/utils/format'

const KANBAN_VISIBILITY_KEY = 'fabrica-pins-kanban-column-visibility'

function defaultColumnVisibility(): Record<OrderStatus, boolean> {
  return Object.fromEntries(
    KANBAN_COLUMN_ORDER.map((s) => [s, true]),
  ) as Record<OrderStatus, boolean>
}

function loadColumnVisibility(): Record<OrderStatus, boolean> {
  const base = defaultColumnVisibility()
  try {
    const raw = localStorage.getItem(KANBAN_VISIBILITY_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<Record<OrderStatus, boolean>>
    return { ...base, ...parsed }
  } catch {
    return base
  }
}

function groupByStatus(orders: Order[]): Map<OrderStatus, Order[]> {
  const map = new Map<OrderStatus, Order[]>()
  for (const s of KANBAN_COLUMN_ORDER) map.set(s, [])
  for (const o of orders) {
    const bucket = map.get(o.status)
    if (bucket) bucket.push(o)
    else map.get('rascunho')!.push(o)
  }
  for (const s of KANBAN_COLUMN_ORDER) {
    map.get(s)!.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }
  return map
}

export function OrdersKanban({
  onEdit,
}: {
  onEdit?: (order: Order) => void
}) {
  const { data: orders = [], isPending, isError, error, refetch } =
    useOrdersQuery()
  const updateMutation = useUpdatePedidoCompletoMutation()
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hoverColumn, setHoverColumn] = useState<OrderStatus | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [columnVisibility, setColumnVisibility] = useState<
    Record<OrderStatus, boolean>
  >(defaultColumnVisibility)
  const [columnsOpen, setColumnsOpen] = useState(false)

  useEffect(() => {
    setColumnVisibility(loadColumnVisibility())
  }, [])

  const persistVisibility = useCallback(
    (next: Record<OrderStatus, boolean>) => {
      setColumnVisibility(next)
      try {
        localStorage.setItem(KANBAN_VISIBILITY_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
    },
    [],
  )

  const visibleStatuses = useMemo(
    () => KANBAN_COLUMN_ORDER.filter((s) => columnVisibility[s]),
    [columnVisibility],
  )

  const byStatus = useMemo(() => groupByStatus(orders), [orders])

  function handleDragStart(e: React.DragEvent, orderId: string) {
    setLocalError(null)
    e.dataTransfer.setData('text/plain', orderId)
    e.dataTransfer.effectAllowed = 'move'
    setDraggingId(orderId)
  }

  function handleDragEnd() {
    setDraggingId(null)
    setHoverColumn(null)
  }

  function handleDragOver(e: React.DragEvent, status: OrderStatus) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setHoverColumn(status)
  }

  async function handleDrop(e: React.DragEvent, targetStatus: OrderStatus) {
    e.preventDefault()
    setHoverColumn(null)
    const orderId = e.dataTransfer.getData('text/plain').trim()
    if (!orderId) return
    const order = orders.find((o) => o.id === orderId)
    if (!order || order.status === targetStatus) return

    setLocalError(null)
    try {
      let sourceOrder = order
      if (sourceOrder.itens.length === 0) {
        sourceOrder = await getOrder(orderId)
      }
      const input = buildPedidoCompletoInputFromOrder(
        sourceOrder,
        targetStatus,
      )
      await updateMutation.mutateAsync({ id: orderId, input })
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'Não foi possível atualizar',
      )
    }
  }

  if (isPending) {
    return <LoadingState rows={4} />
  }

  if (isError) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : 'Erro ao carregar pedidos'
        }
        onRetry={() => void refetch()}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {localError ? (
        <Alert variant="destructive">
          <AlertDescription>{localError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Dialog open={columnsOpen} onOpenChange={setColumnsOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-2">
              <Columns3 className="h-4 w-4" />
              Colunas
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Colunas do quadro</DialogTitle>
              <DialogDescription>
                Oculte status que você não usa no dia a dia. A preferência fica
                salva neste navegador.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              {KANBAN_COLUMN_ORDER.map((status) => (
                <div
                  key={status}
                  className="flex items-center gap-3 rounded-md border border-border px-3 py-2"
                >
                  <input
                    id={`kanban-col-${status}`}
                    type="checkbox"
                    className="h-4 w-4 rounded border-border accent-primary"
                    checked={columnVisibility[status]}
                    onChange={(ev) =>
                      persistVisibility({
                        ...columnVisibility,
                        [status]: ev.target.checked,
                      })
                    }
                  />
                  <Label
                    htmlFor={`kanban-col-${status}`}
                    className="flex-1 cursor-pointer text-sm font-normal leading-tight"
                  >
                    {orderStatusLabel[status]}
                  </Label>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => persistVisibility(defaultColumnVisibility())}
              >
                Mostrar todas
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="-mx-1 overflow-x-auto pb-2">
        <div className="flex min-h-[280px] gap-4 px-1">
          {visibleStatuses.map((status) => {
            const columnOrders = byStatus.get(status) ?? []
            const isHover = hoverColumn === status

            return (
              <div
                key={status}
                className={cn(
                  'flex w-[min(100%,280px)] shrink-0 flex-col rounded-xl border border-dashed border-border bg-muted/20 p-3 transition-colors',
                  isHover &&
                    'border-primary/60 bg-muted/40 ring-2 ring-primary/20',
                )}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setHoverColumn(null)
                  }
                }}
                onDrop={(e) => void handleDrop(e, status)}
              >
                <div className="mb-3 flex items-center justify-between gap-2 border-b border-border pb-2">
                  <h3 className="text-sm font-semibold">
                    {orderStatusLabel[status]}
                  </h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {columnOrders.length}
                  </span>
                </div>

                <div className="flex max-h-[min(70vh,520px)] flex-1 flex-col gap-2 overflow-y-auto">
                  {columnOrders.map((order) => {
                    const busy =
                      updateMutation.isPending &&
                      updateMutation.variables?.id === order.id

                    return (
                      <Card
                        key={order.id}
                        draggable={!busy}
                        onDragStart={(e) => handleDragStart(e, order.id)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          'cursor-grab border-border shadow-sm transition-opacity active:cursor-grabbing',
                          draggingId === order.id && 'opacity-60',
                          busy && 'pointer-events-none opacity-50',
                        )}
                      >
                        <CardHeader className="space-y-1 p-3 pb-0">
                          <CardTitle className="text-sm font-medium leading-tight">
                            {order.clienteNome ?? `Cliente ${order.clienteId}`}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {formatDateBR(order.createdAt)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 p-3 pt-2">
                          <p className="text-sm font-semibold tabular-nums">
                            {formatCurrencyBRL(order.valorTotal)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {modalidadeLabel[order.modalidade]}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => onEdit?.(order)}
                          >
                            Editar
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
