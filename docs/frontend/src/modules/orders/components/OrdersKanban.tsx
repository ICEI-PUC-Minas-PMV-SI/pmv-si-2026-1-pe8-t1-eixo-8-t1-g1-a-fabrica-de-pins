import { useMemo, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import {
  useOrdersQuery,
  useUpdateOrderMutation,
} from '@/modules/orders/hooks/useOrders'
import {
  modalidadeLabel,
  orderStatusLabel,
} from '@/modules/orders/lib/order-labels'
import type { OrderStatus } from '@/schemas/order.schema'
import type { Order } from '@/types'
import { cn } from '@/utils/cn'
import { formatCurrencyBRL, formatDateBR } from '@/utils/format'

const KANBAN_STATUSES: OrderStatus[] = [
  'rascunho',
  'confirmado',
  'enviado',
  'cancelado',
]

function groupByStatus(orders: Order[]): Map<OrderStatus, Order[]> {
  const map = new Map<OrderStatus, Order[]>()
  for (const s of KANBAN_STATUSES) map.set(s, [])
  for (const o of orders) {
    const bucket = map.get(o.status)
    if (bucket) bucket.push(o)
    else map.get('rascunho')!.push(o)
  }
  for (const s of KANBAN_STATUSES) {
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
  const updateMutation = useUpdateOrderMutation()
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hoverColumn, setHoverColumn] = useState<OrderStatus | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

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

  function handleDrop(e: React.DragEvent, targetStatus: OrderStatus) {
    e.preventDefault()
    setHoverColumn(null)
    const orderId = e.dataTransfer.getData('text/plain').trim()
    if (!orderId) return
    const order = orders.find((o) => o.id === orderId)
    if (!order || order.status === targetStatus) return

    updateMutation.mutate(
      { id: orderId, patch: { status: targetStatus } },
      {
        onError: (err) => {
          setLocalError(
            err instanceof Error ? err.message : 'Não foi possível atualizar',
          )
        },
      },
    )
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KANBAN_STATUSES.map((status) => {
          const columnOrders = byStatus.get(status) ?? []
          const isHover = hoverColumn === status

          return (
            <div
              key={status}
              className={cn(
                'flex min-h-[280px] flex-col rounded-xl border border-dashed border-border bg-muted/20 p-3 transition-colors',
                isHover && 'border-primary/60 bg-muted/40 ring-2 ring-primary/20',
              )}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setHoverColumn(null)
                }
              }}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="mb-3 flex items-center justify-between gap-2 border-b border-border pb-2">
                <h3 className="text-sm font-semibold">
                  {orderStatusLabel[status]}
                </h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {columnOrders.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
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
  )
}
