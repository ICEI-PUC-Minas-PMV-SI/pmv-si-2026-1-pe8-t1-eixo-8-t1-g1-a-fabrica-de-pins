import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { useMemo } from 'react'

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
  modalidadeLabel,
  orderStatusLabel,
} from '@/modules/orders/lib/order-labels'
import type { Order } from '@/types'
import { formatCurrencyBRL, formatDateBR } from '@/utils/format'

export function OrdersTable({
  data,
  onEdit,
}: {
  data: Order[]
  onEdit?: (order: Order) => void
}) {
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ getValue }) => String(getValue()).slice(0, 8),
      },
      {
        accessorKey: 'clienteNome',
        header: 'Cliente',
        cell: ({ row }) =>
          row.original.clienteNome ?? row.original.clienteId,
      },
      {
        accessorKey: 'valorTotal',
        header: 'Total',
        cell: ({ getValue }) => formatCurrencyBRL(getValue() as number),
      },
      {
        accessorKey: 'modalidade',
        header: 'Modalidade',
        cell: ({ row }) =>
          modalidadeLabel[row.original.modalidade] ??
          row.original.modalidade,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) =>
          orderStatusLabel[row.original.status] ?? row.original.status,
      },
      {
        accessorKey: 'createdAt',
        header: 'Data',
        cell: ({ getValue }) => formatDateBR(getValue() as string),
      },
      {
        id: 'acoes',
        header: () => <span className="sr-only">Ações</span>,
        cell: ({ row }) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(row.original)}
          >
            Editar
          </Button>
        ),
      },
    ],
    [onEdit],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum pedido.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
